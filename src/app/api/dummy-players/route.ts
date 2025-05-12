import { NextResponse } from "next/server"
import { getPlayers, addPlayer, updatePlayers, deletePlayer } from "~/lib/dummy-data"

export async function GET() {
  try {
    const players = await getPlayers()
    return NextResponse.json(players)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, password, teamId, color } = await request.json()

    if (!name || !password || !teamId || !color) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const newPlayer = await addPlayer(name, password, teamId, color)
    return NextResponse.json(newPlayer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const players = await request.json()
    if (!Array.isArray(players)) {
      return NextResponse.json({ error: "Expected an array of players" }, { status: 400 })
    }

    const updatedPlayers = await updatePlayers(players)
    return NextResponse.json(updatedPlayers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update players" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 })
    }

    await deletePlayer(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 })
  }
}
