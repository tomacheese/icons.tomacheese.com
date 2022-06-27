import fs from 'fs'
import yargs from 'yargs'

const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico']

function arrayChunk([...array], size = 1) {
  return array.reduce(
    (acc, _, index) =>
      index % size ? acc : [...acc, array.slice(index, index + size)],
    []
  )
}

function main(argv: any) {
  const files = fs
    .readdirSync(argv.target)
    .filter((file) => extensions.find((ext) => file.endsWith(`.${ext}`)))
  const extCounts = extensions
    .map((ext) => {
      return {
        ext,
        count: files.filter((file) => file.endsWith(`.${ext}`)).length,
      }
    })
    .sort((a, b) => b.count - a.count)
  const imgTags = files.map(
    (file) =>
      `<a href="icons/${file}"><img src="icons/${file}" title="${file}" alt="${file}" width="100px" /><br>${file}</a>`
  )
  const images = arrayChunk(imgTags, 5)
    .map((chunk: any[]) => chunk.join(' | '))
    .map((chunk: string) => `| ${chunk} |`)
    .join('\n')

  const template = fs.readFileSync('template.md').toString()
  const headerIcons =
    '|     |     |     |     |     |\n| :-: | :-: | :-: | :-: | :-: |'
  const headerIconExts = '| file ext | count |\n| :-: | :-: |'

  const extTables = extCounts
    .map((ext) => '| **' + ext.ext + '** | ' + ext.count + ' |')
    .join('\n')

  const output = template
    .replace('{{ICONS}}', headerIcons + '\n' + images)
    .replace('{{ICON_EXTS}}', headerIconExts + '\n' + extTables)

  fs.writeFileSync(argv.output, output)
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
    .help().argv
)
