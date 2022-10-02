import axios from 'axios'
import fs from 'fs'
import md5 from 'md5'
import yargs from 'yargs'

interface User {
  username: string
  discriminator: string
  id: string
  avatar: string
  public_flags: number
}

interface Emoji {
  id: string
  name: string
  roles: string[]
  user: User
  require_colons: boolean
  managed: boolean
  animated: boolean
}

interface Guild {
  id: string
  name: string
}

type EmojiWithGuild = Emoji & { server: Guild }

interface DownloadedEmoji {
  id: string
  name: string
  path: string
  hash: string
  server: Guild
}

async function getEmojis(
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

async function main(argv: yargs.Arguments) {
  const output = argv.output as string
  const targetGuildsPath = argv.targetGuilds as string
  const emojisPath = argv.emojis as string

  if (process.env.DISCORD_TOKEN === undefined) {
    console.warn('DISCORD_TOKEN is not set')
    return
  }

  const token: string = process.env.DISCORD_TOKEN
  if (!fs.existsSync(targetGuildsPath)) {
    console.warn('targetGuilds.json does not exist')
    return
  }
  const guildIds: {
    [key: string]: string
  } = JSON.parse(fs.readFileSync(targetGuildsPath, 'utf8'))

  const emojis = await Promise.all(
    Object.entries(guildIds).map((v) => {
      const guildName = v[1]
      const guildId = v[0]
      return getEmojis(token, guildId, guildName)
    })
  )
  const downloadedEmojis: DownloadedEmoji[] = []
  if (fs.existsSync(emojisPath)) {
    downloadedEmojis.push(
      ...(JSON.parse(
        fs.readFileSync(emojisPath, 'utf8')
      ) as DownloadedEmoji[])
    )
  }

  const newDownloadedEmojis: DownloadedEmoji[] = []
  for (const emoji of emojis.flat()) {
    const path = `${output}/${emoji.name}.` + (emoji.animated ? 'gif' : 'png')
    const emojiUrl =
      'https://cdn.discordapp.com/emojis/' +
      emoji.id +
      '.' +
      (emoji.animated ? 'gif' : 'png')
    const data = await axios.get(emojiUrl, {
      responseType: 'arraybuffer',
    })
    const hash = md5(data.data)

    const downloadedEmoji = downloadedEmojis.find((e) => e.id === emoji.id)
    if (downloadedEmoji !== undefined) {
      // 絵文字がすでにダウンロード済み
      // 既存絵文字画像と比較して変更があれば更新

      // 名前の変更
      if (downloadedEmoji.name !== emoji.name) {
        console.log(`rename ${downloadedEmoji.name} -> ${emoji.name}`)
        fs.renameSync(downloadedEmoji.path, path)
        downloadedEmoji.name = emoji.name
      }

      // ハッシュ値の変更
      if (downloadedEmoji.hash !== hash) {
        console.log(`update ${emoji.name}`)
        fs.writeFileSync(path, data.data)
        downloadedEmoji.hash = hash
      }
      newDownloadedEmojis.push(downloadedEmoji)
      continue
    }

    // 絵文字がダウンロード済みでない
    console.log(`download ${emoji.name}`)
    fs.writeFileSync(path, data.data)
    newDownloadedEmojis.push({
      id: emoji.id,
      name: emoji.name,
      path,
      hash,
      server: emoji.server,
    })
  }

  // 削除済みの絵文字を処理
  for (const downloadedEmoji of downloadedEmojis) {
    if (
      newDownloadedEmojis.find((e) => e.id === downloadedEmoji.id) !== undefined
    ) {
      continue
    }
    console.log(`delete ${downloadedEmoji.name}`)
    fs.unlinkSync(downloadedEmoji.path)
  }

  fs.writeFileSync(emojisPath, JSON.stringify(newDownloadedEmojis, null, 2))
}

;(async () => {
  main(
    yargs
      .option('output', {
        description: 'Output path',
        demandOption: true,
      })
      .option('target-guilds', {
        description: 'Target guilds file path',
        demandOption: true,
      })
      .option('emojis', {
        description: 'Emojis file path',
        demandOption: true,
      })
      .help()
      .parseSync()
  )
})()
