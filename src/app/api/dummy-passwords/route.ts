import { NextResponse } from "next/server"
import { getUserPasswords } from "~/lib/dummy-data"

export async function GET() {
  try {
    const passwords = await getUserPasswords()
    return NextResponse.json(passwords)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch passwords" }, { status: 500 })
  }
}
