import { NextResponse } from "next/server"
import { getGuildBattleTimeSlot, setGuildBattleTimeSlot } from "~/lib/dummy-data"

export async function GET() {
  try {
    const timeSlot = await getGuildBattleTimeSlot()
    return NextResponse.json({ timeSlot })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch guild battle time slot" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { timeSlot } = await request.json()

    if (!timeSlot) {
      return NextResponse.json({ error: "Time slot is required" }, { status: 400 })
    }

    const updatedTimeSlot = await setGuildBattleTimeSlot(timeSlot)
    return NextResponse.json({ timeSlot: updatedTimeSlot })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update guild battle time slot" }, { status: 500 })
  }
}
