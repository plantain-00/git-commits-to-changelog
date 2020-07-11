import minimist from 'minimist'
import * as fs from 'fs'
import * as packageJson from '../package.json'
import { gitCommitToChangeLog } from './core'

let suppressError = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   git-commits-to-changelog [options]
Examples: git-commits-to-changelog
          git-commits-to-changelog --release 1.0.0
Options:
 --release                                          Release version
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
`)
}

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as {
    v?: unknown
    version?: unknown
    suppressError?: unknown
    h?: unknown
    help?: unknown
    release?: string
  }

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  if (argv.h || argv.help) {
    showHelp()
    return
  }

  suppressError = !!argv.suppressError

  const changelog = await gitCommitToChangeLog(argv.release)
  fs.writeFileSync('CHANGELOG.md', changelog)
}

executeCommandLine().then(() => {
  console.log(`git-commits-to-changelog success.`)
}, (error: unknown) => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  if (!suppressError) {
    process.exit(1)
  }
})
