import fs from 'fs'
import yargs from 'yargs'

const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico']

interface Guild {
  id: string
  name: string
}

interface DownloadedEmoji {
  id: string
  name: string
  path: string
  hash: string
  server: Guild
}

function arrayChunk([...array], size = 1) {
  return array.reduce(
    (acc, _, index) =>
      index % size ? acc : [...acc, array.slice(index, index + size)],
    []
  )
}

function getEmojiExtensionsTable(files: string[]) {
  const extCounts = extensions
    .map((ext) => {
      return {
        ext,
        count: files.filter((file) => file.endsWith(`.${ext}`)).length,
      }
    })
    .sort((a, b) => b.count - a.count)
  const headerIconExts = '| file ext | count |\n| :-: | :-: |'
  const extTables = extCounts
    .map((ext) => '| **' + ext.ext + '** | ' + ext.count + ' |')
    .join('\n')

  return headerIconExts + '\n' + extTables
}

function getEmojiServerTable(targetGuildsPath: string, emojisPath: string) {
  const headerIconServers = '| server | png | gif |\n| :-: | :-: | :-: |'

  const emojis = JSON.parse(
    fs.readFileSync(emojisPath, 'utf8')
  ) as DownloadedEmoji[]
  const guilds = JSON.parse(
    fs.readFileSync(targetGuildsPath, 'utf8')
  ) as { [key: string]: string }

  const guildEmojiCount = Object.entries(guilds).map((guild) => {
    const guildName = guild[1]
    const guildId = guild[0]

    const guildEmojis = emojis.filter((emoji) => emoji.server.id === guildId)
    const pngCount = guildEmojis.filter((emoji) =>
      emoji.path.endsWith('.png')
    ).length
    const gifCount = guildEmojis.filter((emoji) =>
      emoji.path.endsWith('.gif')
    ).length

    return {
      guildName,
      pngCount,
      gifCount,
    }
  })

  const serverTables = guildEmojiCount
    .map((guild) => '| **' + guild.guildName + '** | ' + guild.pngCount + ' | ' + guild.gifCount + ' |')
    .join('\n')
  return headerIconServers + '\n' + serverTables
}

function main(argv: any) {
  const targetPath = argv.target as string
  const outputPath = argv.output as string
  const targetGuildsPath = argv.targetGuilds as string
  const emojisPath = argv.emojis as string

  const files = fs
    .readdirSync(targetPath)
    .filter((file) => extensions.find((ext) => file.endsWith(`.${ext}`)))

  const imgTags = files.map(
    (file) =>
      `<a href="icons/${file}"><img src="icons/${file}" title="${file}" alt="${file}" width="100px" /><br>${file}</a>`
  )
  const images = arrayChunk(imgTags, 3)
    .map((chunk: any[]) => chunk.join(' | '))
    .map((chunk: string) => `| ${chunk} |`)
    .join('\n')

  const template = fs.readFileSync('template.md').toString()
  const headerIcons =
    '|     |     |     |\n| :-: | :-: | :-: |'

  const output = template
    .replace('{{ICONS}}', headerIcons + '\n' + images)
    .replace('{{ICON_EXTS}}', getEmojiExtensionsTable(files))
    .replace(
      '{{ICON_SERVERS}}',
      getEmojiServerTable(targetGuildsPath, emojisPath)
    )

  fs.writeFileSync(outputPath, output)
}
main(
  yargs
    .option('target', {
      description: 'Target path',
      demandOption: true,
    })
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
    .help().argv
)
