import axios from 'axios'
import fs from 'node:fs'
import yargs from 'yargs'
import { getEmojis, getStickers } from './lib'
import { DownloadedItem, EmojiWithGuild, StickerWithGuild } from './models'
import crypto from 'node:crypto'
import sharp from 'sharp'

const config = {
  EMOJI: {
    URL: 'https://cdn.discordapp.com/emojis/{id}.{format}',
    METHOD: getEmojis,
  },
  STICKER: {
    URL: 'https://cdn.discordapp.com/stickers/{id}.{format}',
    METHOD: getStickers,
  },
}

function getUrlExtension(emoji: EmojiWithGuild | StickerWithGuild) {
  if ('animated' in emoji && emoji.animated) {
    return 'gif'
  }
  // https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
  if ('format_type' in emoji && emoji.format_type === 2) {
    return 'png'
  }
  if ('format_type' in emoji && emoji.format_type === 3) {
    return 'lottie'
  }
  return 'png'
}

function getFileExtension(emoji: EmojiWithGuild | StickerWithGuild) {
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

function getHash(data: ArrayBuffer): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    sharp(data)
      .raw()
      .toBuffer((error, data) => {
        if (error) {
          reject(error)
          return
        }
        hash.update(data)
        resolve(hash.digest('hex'))
      })
  })
}

function sanitizeName(name: string) {
  // ファイル名として使えない文字を置換
  const invalidChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|']
  for (const c of invalidChars) {
    name = name.replaceAll(c, '_')
  }
  return name
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
  const { URL, METHOD } = config[target]
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
        output.endsWith('/')
          ? output.slice(0, Math.max(0, output.length - 1))
          : output
      }/${sanitizeName(item.name)}.` + getFileExtension(item)
    const emojiUrl = URL.replace('{id}', item.id).replace(
      '{format}',
      getUrlExtension(item)
    )
    const data = await axios.get(emojiUrl, {
      responseType: 'arraybuffer',
      validateStatus: () => true,
    })
    if (data.status !== 200) {
      console.warn(`failed to download ${emojiUrl}`)
      console.warn(item)
      process.exitCode = 1
      continue
    }
    const hash = await getHash(data.data)

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
    if (newDownloadedItems.some((e) => e.id === downloadedItem.id)) {
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
  await main({
    output: {
      emojis: args['output-emojis'],
      stickers: args['output-stickers'],
    },
    targetGuildsPath: args['target-guilds'],
    emojisPath: args.emojis,
    stickersPath: args.stickers,
  })
})()
