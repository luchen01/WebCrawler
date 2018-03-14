import program from 'commander'
import path from 'path'
import Queue from './Queue'

program
  .version('0.1.0')
  .option('-c, --concurrency', 'Number of concurrent bots at a time', parseInt, 5)
  .option('-f, --file <file>', 'Url input file')
  .option('-t, --timeout', 'Timeout for request', 3000)
  .parse(process.argv)

if (!program.file) {
  console.error('You need to give a file with urls (-f)')
  process.exit(1)
}

const queue = new Queue(program.concurrency, program.timeout)
const fullPath = path.resolve(process.cwd(), program.file)

console.info(`Loading file ${fullPath}...`)

queue.loadFile(fullPath)
  .then(() => queue.start())
  .then(() => queue.listOfUrls.map(url => queue.fetchUrl(url.url)))
  .catch((err) => {
    console.error(`Error reading file ${fullPath} because: ${err.message}`)
    process.exit(1)
  })
