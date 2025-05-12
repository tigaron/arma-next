import { NextResponse } from "next/server"
import { getGuildBattleDates, setGuildBattleDates } from "~/lib/dummy-data"

export async function GET() {
  try {
    const dates = await getGuildBattleDates()
    return NextResponse.json({ dates })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch guild battle dates" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { dates } = await request.json()

    if (!dates || !Array.isArray(dates)) {
      return NextResponse.json({ error: "Dates array is required" }, { status: 400 })
    }

    const updatedDates = await setGuildBattleDates(dates)
    return NextResponse.json({ dates: updatedDates })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update guild battle dates" }, { status: 500 })
  }
}
