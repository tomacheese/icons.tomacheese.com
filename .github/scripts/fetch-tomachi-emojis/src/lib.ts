import axios from 'axios'
import { Emoji, EmojiWithGuild, Sticker, StickerWithGuild } from './models'

export async function getEmojis(
  token: string,
  guildId: string,
  guildName: string
): Promise<EmojiWithGuild[]> {
  const response = await axios.get(
    'https://discord.com/api/guilds/' + guildId + '/emojis',
    {
      headers: {
        Authorization: 'Bot ' + token,
      },
    }
  )
  const emojis = response.data
  return emojis.map((emoji: Emoji) => {
    return {
      ...emoji,
      server: {
        id: guildId,
        name: guildName,
      },
    }
  })
}

export async function getStickers(
  token: string,
  guildId: string,
  guildName: string
): Promise<StickerWithGuild[]> {
  const response = await axios.get(
    'https://discord.com/api/guilds/' + guildId + '/stickers',
    {
      headers: {
        Authorization: 'Bot ' + token,
      },
    }
  )
  const stickers = response.data
  return stickers.map((sticker: Sticker) => {
    return {
      ...sticker,
      server: {
        id: guildId,
        name: guildName,
      },
    }
  })
}
