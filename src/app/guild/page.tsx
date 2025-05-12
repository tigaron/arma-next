import { redirect } from "next/navigation"
import { CountdownTimer } from "~/components/countdown-timer"
import { auth } from "~/server/auth"
import GuildPageComponent from "./component"

export default async function GuildPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <GuildPageComponent userId={session.user.id} />
  )
}
