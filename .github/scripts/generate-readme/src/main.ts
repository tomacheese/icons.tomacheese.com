import fs from 'node:fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { DownloadedItem } from './models'

const extensions = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'ico',
  'apng',
  'lottie',
]

function arrayChunk([...array]: string[], size = 1) {
  // eslint-disable-next-line unicorn/no-array-reduce
  return array.reduce<string[][]>(
    (accumulator, _, index) =>
      index % size
        ? accumulator
        : [...accumulator, array.slice(index, index + size)],
    []
  )
}

function getEmojiExtensionsTable(emojiFiles: string[], stickerFiles: string[]) {
  const extensionCounts = extensions
    .map((extension) => {
      return {
        ext: extension,
        emojiCount: emojiFiles.filter((file) => file.endsWith(`.${extension}`))
          .length,
        stickerCount: stickerFiles.filter((file) =>
          file.endsWith(`.${extension}`)
        ).length,
      }
    })
    .toSorted((a, b) => b.emojiCount - a.emojiCount)
  const headerIconExtensions =
    '| file ext | emojis count | stickers count |\n| :-: | :-: | :-: |'
  const extensionTables = extensionCounts
    .map(
      (extension) =>
        '| **' +
        extension.ext +
        '** | ' +
        extension.emojiCount.toString() +
        ' |' +
        extension.stickerCount.toString() +
        ' |'
    )
    .join('\n')

  return headerIconExtensions + '\n' + extensionTables
}

function getEmojiServerTable(
  targetGuildsPath: string,
  emojisPath: string,
  stickerPath: string
) {
  const headerIconServers =
    '| server | emoji/png | emoji/gif | sticker/png | sticker/apng |\n| :- | :-: | :-: | :-: | :-: |'

  const emojis = JSON.parse(
    fs.readFileSync(emojisPath, 'utf8')
  ) as DownloadedItem[]
  const stickers = JSON.parse(
    fs.readFileSync(stickerPath, 'utf8')
  ) as DownloadedItem[]
  const guilds = JSON.parse(
    fs.readFileSync(targetGuildsPath, 'utf8')
  ) as Record<string, string>

  const guildItemCount = Object.entries(guilds).map((guild) => {
    const guildName = guild[1]
    const guildId = guild[0]

    const guildEmojis = emojis.filter((emoji) => emoji.server.id === guildId)

    const guildStickers = stickers.filter(
      (sticker) => sticker.server.id === guildId
    )
    const emojiPngCount = guildEmojis.filter((emoji) =>
      emoji.path.endsWith('.png')
    ).length
    const emojiGifCount = guildEmojis.filter((emoji) =>
      emoji.path.endsWith('.gif')
    ).length
    const stickerPngCount = guildStickers.filter((sticker) =>
      sticker.path.endsWith('.png')
    ).length
    const stickerApngCount = guildStickers.filter((sticker) =>
      sticker.path.endsWith('.apng')
    ).length

    return {
      guildName,
      emojiPngCount,
      emojiGifCount,
      stickerPngCount,
      stickerApngCount,
    }
  })

  const serverTables = guildItemCount
    .map(
      (guild) =>
        '| **' +
        guild.guildName +
        '** | ' +
        guild.emojiPngCount.toString() +
        ' | ' +
        guild.emojiGifCount.toString() +
        ' | ' +
        guild.stickerPngCount.toString() +
        ' | ' +
        guild.stickerApngCount.toString() +
        ' |'
    )
    .join('\n')
  return headerIconServers + '\n' + serverTables
}

function main() {
  const argv = yargs(hideBin(process.argv))
    .option('target-emojis', {
      description: 'Target emojis path',
      demandOption: true,
      type: 'string',
    })
    .option('target-stickers', {
      description: 'Target stickers path',
      demandOption: true,
      type: 'string',
    })
    .option('output', {
      description: 'Output path',
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
  const targetEmojisPath = argv.targetEmojis
  const targetStickersPath = argv.targetStickers
  const outputPath = argv.output
  const targetGuildsPath = argv.targetGuilds
  const emojisPath = argv.emojis
  const stickersPath = argv.stickers

  const emojiFiles = fs
    .readdirSync(targetEmojisPath)
    .filter((file) =>
      extensions.find((extension) => file.endsWith(`.${extension}`))
    )
  const stickerFiles = fs
    .readdirSync(targetStickersPath)
    .filter((file) =>
      extensions.find((extension) => file.endsWith(`.${extension}`))
    )

  const emojiImgTags = emojiFiles.map(
    (file) =>
      `<a href="icons/${file}"><img src="icons/${file}" title="${file}" alt="${file}" width="100px" /><br>${file}</a>`
  )
  const emojiImages = arrayChunk(emojiImgTags, 3)
    .map((chunk: any[]) => chunk.join(' | '))
    .map((chunk: string) => `| ${chunk} |`)
    .join('\n')
  const stickerImgTags = stickerFiles.map(
    (file) =>
      `<a href="stickers/${file}"><img src="stickers/${file}" title="${file}" alt="${file}" width="100px" /><br>${file}</a>`
  )
  const stickerImages = arrayChunk(stickerImgTags, 3)
    .map((chunk: any[]) => chunk.join(' | '))
    .map((chunk: string) => `| ${chunk} |`)
    .join('\n')

  const template = fs.readFileSync('template.md').toString()
  const headerIcons = '|     |     |     |\n| :-: | :-: | :-: |'

  const output = template
    .replace('{{ICONS}}', headerIcons + '\n' + emojiImages)
    .replace('{{STICKERS}}', headerIcons + '\n' + stickerImages)
    .replace('{{ICON_EXTS}}', getEmojiExtensionsTable(emojiFiles, stickerFiles))
    .replace(
      '{{ICON_SERVERS}}',
      getEmojiServerTable(targetGuildsPath, emojisPath, stickersPath)
    )

  fs.writeFileSync(outputPath, output)
}
main()
