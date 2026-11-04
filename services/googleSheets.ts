import { JWT } from 'google-auth-library'

import { CHAT_LOG_FIRST_DATA_ROW, CHAT_LOG_SHEET_TAB, CHAT_LOG_TIMEOUT_MS, GOOGLE_SHEETS_API_URL, GOOGLE_SHEETS_SCOPE } from '@/constants/tools'

// Server only: uses the service account key, never import this from the browser
let authClient: JWT | null = null
let logTabId: number | null = null

export const isChatLogEnabled = () =>
  Boolean(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)

// Reuse one client so the access token stays cached between requests
const getAuthClient = () => {
  authClient ??= new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Hosting env vars usually store line breaks as a literal "\n"
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: [GOOGLE_SHEETS_SCOPE],
  })

  return authClient
}

const callSheets = async (path: string, token: string | null | undefined, init: RequestInit = {}) => {
  const response = await fetch(`${GOOGLE_SHEETS_API_URL}/${process.env.GOOGLE_SHEETS_ID}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(CHAT_LOG_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`Google Sheets request failed (${response.status})`)

  return response.json()
}

// Inserting a row needs the tab's numeric id; look it up once per server instance
const getLogTabId = async (token: string | null | undefined) => {
  if (logTabId !== null) return logTabId

  const data = await callSheets('?fields=sheets.properties(sheetId,title)', token)
  const tab = data?.sheets?.find((sheet: any) => sheet?.properties?.title === CHAT_LOG_SHEET_TAB)

  if (!tab) throw new Error('Chat log tab not found')

  logTabId = tab.properties.sheetId as number

  return logTabId
}

// Explicit cell types, so user text can never run as a sheet formula
const toCell = (value: string | number) => ({
  userEnteredValue: typeof value === 'number' ? { numberValue: value } : { stringValue: value },
})

// Insert one row right under the header, so the newest log stays on top.
// One batchUpdate is atomic, so concurrent writes cannot overwrite each other.
export const insertChatLogRow = async (row: (string | number)[]) => {
  const { token } = await getAuthClient().getAccessToken()
  const sheetId = await getLogTabId(token)

  await callSheets(':batchUpdate', token, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          insertDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: CHAT_LOG_FIRST_DATA_ROW, endIndex: CHAT_LOG_FIRST_DATA_ROW + 1 },
            inheritFromBefore: false,
          },
        },
        {
          updateCells: {
            start: { sheetId, rowIndex: CHAT_LOG_FIRST_DATA_ROW, columnIndex: 0 },
            rows: [{ values: row.map(toCell) }],
            fields: 'userEnteredValue',
          },
        },
      ],
    }),
  })
}
