import { NextResponse } from "next/server"
import { getPlayerTimers, updateTimer } from "~/lib/dummy-data"

export async function GET() {
  try {
    const timers = await getPlayerTimers()
    return NextResponse.json(timers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timers" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, time } = await request.json()

    if (!userId || time === undefined) {
      return NextResponse.json({ error: "User ID and time are required" }, { status: 400 })
    }

    await updateTimer(userId, time)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update timer" }, { status: 500 })
  }
}
