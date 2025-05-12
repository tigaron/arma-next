import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { createDefaultGuildForUserId, getPlayerByUserId } from "~/server/db/query";

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      }, { status: 401 })
    }

    const [player] = await getPlayerByUserId(session.user.id)
    if (!player) {
      return NextResponse.json({
        success: false,
        message: "Player not found",
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Player found",
      data: player
    }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized",
      }, { status: 401 })
    }

    const player = await createDefaultGuildForUserId(session.user.id)

    return NextResponse.json({
      success: true,
      message: "Default guild created",
      data: player
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
