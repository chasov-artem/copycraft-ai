type MockSession = {
  sessionId: string
  userId: string
  priceId: string
  createdAt: number
}

const STORAGE_KEY = "copycraft_mock_sessions"
const inMemorySessions = new Map<string, MockSession>()

function readSessionsFromStorage(): MockSession[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as MockSession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistSession(session: MockSession): void {
  if (typeof window === "undefined") {
    return
  }

  const sessions = readSessionsFromStorage().filter((item) => item.sessionId !== session.sessionId)
  sessions.push(session)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function resolveSession(sessionId: string): MockSession | undefined {
  const memorySession = inMemorySessions.get(sessionId)
  if (memorySession) {
    return memorySession
  }

  const fromStorage = readSessionsFromStorage().find((session) => session.sessionId === sessionId)
  if (fromStorage) {
    inMemorySessions.set(sessionId, fromStorage)
  }
  return fromStorage
}

export async function createCheckoutSession(
  priceId: string,
  userId: string
): Promise<{ sessionId: string; url: string }> {
  const sessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  const session: MockSession = {
    sessionId,
    userId,
    priceId,
    createdAt: Date.now(),
  }

  inMemorySessions.set(sessionId, session)
  persistSession(session)

  return {
    sessionId,
    url: `/checkout/mock-session/${sessionId}`,
  }
}

export async function verifyPayment(
  sessionId: string
): Promise<{ success: boolean; customerId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const session = resolveSession(sessionId)
  const customerSuffix = session?.userId?.slice(0, 8) ?? sessionId.slice(-8)

  return {
    success: true,
    customerId: `mock_cus_${customerSuffix}`,
  }
}

export async function cancelSubscription(_userId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800))
}
