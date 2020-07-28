import childProcess from 'child_process'
import semver from 'semver'

/**
 * @public
 */
export async function gitCommitToChangeLog(release?: string): Promise<string> {
  const remoteUrl = childProcess.execSync(`git config --get remote.origin.url`).toString().trim()
  const remoteType = remoteUrl.includes('github') ? 'github' : 'gitlab'
  const parts = remoteUrl.substring(0, remoteUrl.length - '.git'.length).split(/\/|:|@/)
  const hostname = parts[parts.length - 3]
  const username = parts[parts.length - 2]
  const repositoryName = parts[parts.length - 1]

  const versions: Version[] = []
  let current: Version | undefined
  if (release) {
    current = {
      version: release,
      date: new Date().toISOString(),
      commits: [],
      prerelease: !!semver.prerelease(release),
    }
    versions.push(current)
  }
  for (const commit of iterateCommits()) {
    if (commit.kind === 'version') {
      current = {
        version: commit.version,
        date: commit.date,
        commits: [],
        prerelease: commit.prerelease,
      }
      versions.push(current)
    } else if (current) {
      const currentCommit = current.commits.find((c) => c.message === commit.message)
      if (currentCommit) {
        currentCommit.hashes.push(commit.hash)
      } else {
        current.commits.push({
          hashes: [commit.hash],
          message: commit.message,
        })
      }
    }
  }

  const result = versions.map((r, i) => {
    const date = formatDate(r.date)
    let title: string
    const head = r.prerelease ? '###' : '##'
    if (i === versions.length - 1) {
      title = `${head} ${r.version} (${date})`
    } else if (remoteType === 'github') {
      title = `${head} [${r.version}](https://${hostname}/${username}/${repositoryName}/compare/v${versions[i + 1].version}...v${r.version}) (${date})`
    } else {
      title = `${head} [${r.version}](https://${hostname}/${username}/${repositoryName}/-/compare/v${versions[i + 1].version}...v${r.version}) (${date})`
    }
    const commits = r.commits.map((c) => {
      let hashes: string[]
      if (remoteType === 'github') {
        hashes = c.hashes.map((h) => `([${h.substring(0, 7)}](https://${hostname}/${username}/${repositoryName}/commit/${h}))`)
      } else {
        hashes = c.hashes.map((h) => `([${h.substring(0, 7)}](https://${hostname}/${username}/${repositoryName}/-/commit/${h}))`)
      }
      return `* ${c.message} ${hashes.join(' ')}`
    })
    if (commits.length === 0) {
      return `
${title}`
    }
    return `
${title}
  
${commits.join('\n')}`
  })

  return `# Change Log
${result.join('\n')}
`
}

/**
 * @public
 */
export function* iterateCommits() {
  const lines = childProcess.execSync('git log').toString().split('\n\n')
  for (let i = 0; i < lines.length; i += 2) {
    const headers = lines[i].split('\n')
    const message = lines[i + 1].trim().split('\n')[0]
    const hash = headers[0].substring('commit'.length).trim()
    const date = headers[2].substring('Date:'.length).trim()
    if (semver.valid(message)) {
      yield {
        kind: 'version' as const,
        version: message.startsWith('v') ? message.substring(1) : message,
        date,
        hash,
        prerelease: !!semver.prerelease(message),
      }
    } else {
      yield {
        kind: 'message' as const,
        date,
        hash,
        message,
      }
    }
  }
}

function formatMonthAndDay(value: number) {
  return value > 9 ? value : '0' + value
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${formatMonthAndDay(date.getMonth() + 1)}-${formatMonthAndDay(date.getDate())}`
}

interface Commit {
  message: string
  hashes: string[]
}

interface Version {
  version: string
  date: string
  commits: Commit[]
  prerelease: boolean
}
