import { NextResponse, type NextRequest } from "next/server"

import { activateUserPro } from "@/lib/subscription-service"

type MockWebhookPayload = {
  sessionId?: string
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as MockWebhookPayload
    const sessionId = String(payload?.sessionId ?? "").trim()
    const userId = String(payload?.userId ?? "").trim()

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "sessionId and userId are required" },
        { status: 400 }
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    await activateUserPro(userId, `mock_cus_${sessionId.slice(-8)}`)

    return NextResponse.json({
      received: true,
      type: "checkout.session.completed",
      sessionId,
      userId,
    })
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
