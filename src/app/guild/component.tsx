"use client"

import { CountdownTimer } from "~/components/countdown-timer"
import { createDefaultGuild, playerGuild } from "./action"

export default function GuildPageComponent({ userId }: { userId: string }) {
  const { data: playerData, isLoading } = playerGuild(userId)
  const { mutate, isPending } = createDefaultGuild(userId)

  if (isLoading || isPending) {
    return (
      <div>Loading...</div>
    )
  }

  if (!playerData.success) {
    return (
      <div>
        <div>Create new guild</div>
        <button type="submit" onClick={() => {mutate()}}>Create</button>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Armageddon Battle Timer</h1>
        <CountdownTimer />
      </div>
    </main>
  )
}
