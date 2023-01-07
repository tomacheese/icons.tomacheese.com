interface User {
  username: string
  discriminator: string
  id: string
  avatar: string
  public_flags: number
}

export interface Emoji {
  id: string
  name: string
  roles: string[]
  user: User
  require_colons: boolean
  managed: boolean
  animated: boolean
}

export interface Sticker {
  id: string
  name: string
  tags: string
  type: number
  format_type: number
  description: string | null
  asset: string
  available: boolean
  guild_id: string
  user: User
}

interface Guild {
  id: string
  name: string
}

export type EmojiWithGuild = Emoji & { server: Guild }
export type StickerWithGuild = Sticker & { server: Guild }

export interface DownloadedItem {
  id: string
  name: string
  path: string
  hash: string
  server: Guild
}
