import { NextResponse } from "next/server"
import { updateColorOrder } from "~/lib/dummy-data"

export async function PUT(request: Request) {
  try {
    const { groupId, colorOrder } = await request.json()

    if (!groupId || !colorOrder || !Array.isArray(colorOrder)) {
      return NextResponse.json({ error: "Group ID and color order array are required" }, { status: 400 })
    }

    const updatedGroup = await updateColorOrder(groupId, colorOrder)
    return NextResponse.json(updatedGroup)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update color order" }, { status: 500 })
  }
}
