import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const playerGuild = (id: string) => useQuery({
  queryKey: ["playerGuild", id],
  queryFn: async () => {
    const response = await fetch("/api/player")
    return await response.json()
  }
})

export const createDefaultGuild = (id: string) => useMutation({
  mutationFn: async () => {
    const response = await fetch("/api/player", {
      method: "POST"
    })
    return await response.json()
  },
  onSuccess: () => {
    useQueryClient().invalidateQueries({ queryKey: ["playerGuild", id] })
  }
})