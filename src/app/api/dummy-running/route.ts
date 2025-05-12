import { NextResponse } from "next/server"
import { getRunningStatus, updateRunningStatus } from "~/lib/dummy-data"

export async function GET() {
  try {
    const runningStatus = await getRunningStatus()
    return NextResponse.json(runningStatus)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch running status" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, running } = await request.json()

    if (!userId || running === undefined) {
      return NextResponse.json({ error: "User ID and running status are required" }, { status: 400 })
    }

    await updateRunningStatus(userId, running)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update running status" }, { status: 500 })
  }
}
