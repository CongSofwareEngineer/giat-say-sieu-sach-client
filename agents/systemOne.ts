// System One (Jev) client. Jev answers typed questions about a `state` and
// returns values plus probability distributions instead of prose, so a
// decision costs a fraction of a chat completion. Used to route a chat
// message and to pick which tools may run.
// Docs: https://docs.typesafe.ai/introduction
import { SYSTEM_ONE_MODEL, SYSTEM_ONE_PATH, SYSTEM_ONE_QUESTION_TYPE, SYSTEM_ONE_TIMEOUT_MS } from '@/constants/tools'

// Option name -> description shown to Jev
export type ChoiceCriteria = Record<string, string>

export interface ChoiceQuestion {
  type: typeof SYSTEM_ONE_QUESTION_TYPE.choice
  instructions: string
  criteria: ChoiceCriteria
}

export interface ChoiceAnswer {
  type: typeof SYSTEM_ONE_QUESTION_TYPE.choice
  // Option with the highest probability
  choice: string
  // 0..1, higher when the probability mass sits on one option
  confidence: number
  // A probability for every option, summing to 1
  probabilities: Record<string, number>
}

// Answers keyed by the question ids we sent
export type SystemOneAnswers = Record<string, ChoiceAnswer | undefined>

// Build a choice question from an option map
export const choiceQuestion = (instructions: string, criteria: ChoiceCriteria): ChoiceQuestion => ({
  type: SYSTEM_ONE_QUESTION_TYPE.choice,
  instructions,
  criteria,
})

// Keep the caller's abort reason while still capping the request on our own
const withTimeout = (signal?: AbortSignal): AbortSignal => {
  const timeout = AbortSignal.timeout(SYSTEM_ONE_TIMEOUT_MS)

  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

// Ask Jev several questions about one state in a single request. Questions are
// evaluated in parallel and in isolation, so the state is billed once.
// Returns null on any failure: the caller decides what to do without an answer.
export const askSystemOne = async (
  state: string,
  questions: Record<string, ChoiceQuestion>,
  signal?: AbortSignal
): Promise<SystemOneAnswers | null> => {
  try {
    const response = await fetch(SYSTEM_ONE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: withTimeout(signal),
      body: JSON.stringify({ model: SYSTEM_ONE_MODEL, state, questions }),
    })

    if (!response.ok) return null

    const data = (await response.json()) as { answers?: SystemOneAnswers }

    return data?.answers ?? null
  } catch {
    return null
  }
}

// Options Jev gave at least `minProbability`, most likely first. Falls back to
// the top choice when the distribution is flat enough that nothing clears it.
export const likelyChoices = (answer: ChoiceAnswer | undefined, minProbability: number): string[] => {
  if (!answer) return []

  const probabilities = answer.probabilities ?? {}

  const kept = Object.entries(probabilities)
    .filter(([, probability]) => probability >= minProbability)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  return kept.length > 0 ? kept : [answer.choice].filter(Boolean)
}
