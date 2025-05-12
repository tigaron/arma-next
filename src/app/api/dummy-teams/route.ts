import { NextResponse } from "next/server"
import { getTeams, addTeam, updateTeam, deleteTeam } from "~/lib/dummy-data"

export async function GET() {
  try {
    const teams = await getTeams()
    return NextResponse.json(teams)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newTeam = await addTeam(name)
    return NextResponse.json(newTeam)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const team = await request.json()
    if (!team.id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }

    const updatedTeam = await updateTeam(team)
    return NextResponse.json(updatedTeam)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }

    await deleteTeam(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
