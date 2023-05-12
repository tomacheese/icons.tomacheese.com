import axios from 'axios'
import fs from 'fs'
import yargs from 'yargs'
import { getEmojis, getStickers } from './lib'
import { DownloadedItem, EmojiWithGuild, StickerWithGuild } from './models'
import crypto from 'crypto'

const conf = {
  EMOJI: {
    URL: 'https://cdn.discordapp.com/emojis/{id}.{format}',
    METHOD: getEmojis,
  },
  STICKER: {
    URL: 'https://cdn.discordapp.com/stickers/{id}.{format}',
    METHOD: getStickers,
  },
}

function getExtension(emoji: EmojiWithGuild | StickerWithGuild) {
  if ('animated' in emoji && emoji.animated) {
    return 'gif'
  }
  // https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
  if ('format_type' in emoji && emoji.format_type === 2) {
    return 'apng'
  }
  if ('format_type' in emoji && emoji.format_type === 3) {
    return 'lottie'
  }
  return 'png'
}

function getHash(data: ArrayBuffer) {
  const hash = crypto.createHash('md5')
  hash.update(Buffer.from(data))
  return hash.digest('hex')
}

async function crawl(
  target: 'EMOJI' | 'STICKER',
  guildIds: { [key: string]: string },
  token: string,
  output: string,
  filePath: string
) {
  console.log(`crawl(${target})`)
  console.time(`crawl(${target})`)
  const { URL, METHOD } = conf[target]
  const items = await Promise.all(
    Object.entries(guildIds).map((v) => {
      const guildName = v[1]
      const guildId = v[0]
      return METHOD(token, guildId, guildName)
    })
  )
  const downloadedItems: DownloadedItem[] = []
  if (fs.existsSync(filePath)) {
    downloadedItems.push(
      ...(JSON.parse(fs.readFileSync(filePath, 'utf8')) as DownloadedItem[])
    )
  }

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true })
  }

  const newDownloadedItems: DownloadedItem[] = []
  for (const item of items.flat()) {
    const path =
      `${
        output.endsWith('/') ? output.substring(0, output.length - 1) : output
      }/${item.name}.` + getExtension(item)
    const emojiUrl = URL.replace('{id}', item.id).replace(
      '{format}',
      getExtension(item)
    )
    const data = await axios.get(emojiUrl, {
      responseType: 'arraybuffer',
    })
    const hash = getHash(data.data)

    const downloadedItem = downloadedItems.find((e) => e.id === item.id)
    if (downloadedItem !== undefined) {
      // すでにダウンロード済み
      // 既存画像と比較して変更があれば更新

      // 名前の変更
      if (downloadedItem.name !== item.name) {
        console.log(`rename ${downloadedItem.name} -> ${item.name}`)
        fs.renameSync(downloadedItem.path, path)
        downloadedItem.name = item.name
      }

      // ハッシュ値の変更
      if (downloadedItem.hash !== hash) {
        console.log(`update ${item.name}`)
        fs.writeFileSync(path, data.data)
        downloadedItem.hash = hash
      }
      newDownloadedItems.push(downloadedItem)
      continue
    }

    // ダウンロード済みでない
    console.log(`download ${item.name}`)
    fs.writeFileSync(path, data.data)
    newDownloadedItems.push({
      id: item.id,
      name: item.name,
      path,
      hash,
      server: item.server,
    })
  }

  // 削除済みの画像を処理
  for (const downloadedItem of downloadedItems) {
    if (
      newDownloadedItems.find((e) => e.id === downloadedItem.id) !== undefined
    ) {
      continue
    }
    console.log(`delete ${downloadedItem.name}`)
    fs.unlinkSync(downloadedItem.path)
  }

  fs.writeFileSync(filePath, JSON.stringify(newDownloadedItems, null, 2))
  console.timeEnd(`crawl(${target})`)
}

interface MainOptions {
  output: {
    emojis: string
    stickers: string
  }
  targetGuildsPath: string
  emojisPath: string
  stickersPath: string
}

async function main(options: MainOptions) {
  const { output, targetGuildsPath, emojisPath, stickersPath } = options

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

  await Promise.all([
    crawl('EMOJI', guildIds, token, output.emojis, emojisPath),
    crawl('STICKER', guildIds, token, output.stickers, stickersPath),
  ])
}

;(async () => {
  const args = yargs
    .option('output-emojis', {
      description: 'Output emojis path',
      demandOption: true,
      type: 'string',
    })
    .option('output-stickers', {
      description: 'Output stickers path',
      demandOption: true,
      type: 'string',
    })
    .option('target-guilds', {
      description: 'Target guilds file path',
      demandOption: true,
      type: 'string',
    })
    .option('emojis', {
      description: 'Emojis file path',
      demandOption: true,
      type: 'string',
    })
    .option('stickers', {
      description: 'Stickers file path',
      demandOption: true,
      type: 'string',
    })
    .help()
    .parseSync()
  main({
    output: {
      emojis: args['output-emojis'],
      stickers: args['output-stickers'],
    },
    targetGuildsPath: args['target-guilds'],
    emojisPath: args.emojis,
    stickersPath: args.stickers,
  })
})()
