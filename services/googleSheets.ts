import { JWT } from 'google-auth-library'

import { CHAT_LOG_SHEET_RANGE, CHAT_LOG_TIMEOUT_MS, GOOGLE_SHEETS_API_URL, GOOGLE_SHEETS_SCOPE } from '@/constants/tools'

// Server only: uses the service account key, never import this from the browser
let authClient: JWT | null = null

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

// Append one row as raw values, so user text can never run as a sheet formula.
// INSERT_ROWS keeps new rows inside the sheet's highlight rule range.
export const appendChatLogRow = async (row: (string | number)[]) => {
  const { token } = await getAuthClient().getAccessToken()
  const range = encodeURIComponent(CHAT_LOG_SHEET_RANGE)
  const url = `${GOOGLE_SHEETS_API_URL}/${process.env.GOOGLE_SHEETS_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ values: [row] }),
    signal: AbortSignal.timeout(CHAT_LOG_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`Google Sheets append failed (${response.status})`)
}
