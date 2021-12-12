import fs from 'fs'
import yargs from 'yargs'

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
    .filter(
      (file) =>
        file.endsWith('.png') ||
        file.endsWith('.jpg') ||
        file.endsWith('.jpeg') ||
        file.endsWith('.gif') ||
        file.endsWith('.svg') ||
        file.endsWith('.webp') ||
        file.endsWith('.ico')
    )
    .map(
      (file) =>
        `<a href="icons/${file}"><img src="icons/${file}" title="${file}" alt="${file}" width="100px" /><br>${file}</a>`
    )
  const images = arrayChunk(files, 5)
    .map((chunk: any[]) => chunk.join(' | '))
    .map((chunk: string) => `| ${chunk} |`)
    .join('\n')

  const template = fs.readFileSync('template.md').toString()
  const header =
    '|     |     |     |     |     |\n| :-: | :-: | :-: | :-: | :-: |'

  fs.writeFileSync(
    argv.output,
    template.replace('{{ICONS}}', header + '\n' + images)
  )
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
