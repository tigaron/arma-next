import { NextResponse } from "next/server"
import { updatePlayer } from "~/lib/dummy-data"

export async function PUT(request: Request) {
  try {
    const { playerId, teamId, color } = await request.json()

    if (!playerId || !teamId || !color) {
      return NextResponse.json({ error: "Player ID, team ID, and color are required" }, { status: 400 })
    }

    const updatedPlayer = await updatePlayer(playerId, { teamId, color })
    return NextResponse.json(updatedPlayer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to move player" }, { status: 500 })
  }
}
