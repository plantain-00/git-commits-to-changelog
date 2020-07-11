import childProcess from 'child_process'
import semver from 'semver'

/**
 * @public
 */
export async function gitCommitToChangeLog(): Promise<string> {
  const remoteUrl = childProcess.execSync(`git config --get remote.origin.url`).toString().trim()
  const remoteType = remoteUrl.includes('github') ? 'github' : 'gitlab'
  const parts = remoteUrl.substring(0, remoteUrl.length - '.git'.length).split(/\/|:|@/)
  const hostname = parts[parts.length - 3]
  const username = parts[parts.length - 2]
  const repositoryName = parts[parts.length - 1]

  const lines = childProcess.execSync(`git log --all`).toString().split('\n\n')
  const versions: Version[] = []
  let current: Version | undefined
  for (let i = 0; i < lines.length; i += 2) {
    const headers = lines[i].split('\n')
    const hash = headers[0].substring('commit'.length).trim()
    const author = headers[1].substring('Author:'.length).trim()
    const date = headers[2].substring('Date:'.length).trim()
    const message = lines[i + 1].trim().split('\n')[0]
    if (semver.valid(message)) {
      current = {
        version: message.startsWith('v') ? message.substring(1) : message,
        hash,
        author,
        date,
        commits: [],
      }
      versions.push(current)
    } else if (current) {
      const commit = current.commits.find((c) => c.message === message)
      if (commit) {
        commit.hashes.push(hash)
      } else {
        current.commits.push({
          hashes: [hash],
          message
        })
      }
    }
  }

  const result = versions.map((r, i) => {
    const date = formatDate(r.date)
    let title: string
    if (i === versions.length - 1) {
      title = `## ${r.version} (${date})`
    } else if (remoteType === 'github') {
      title = `## [${r.version}](https://${hostname}/${username}/${repositoryName}/compare/v${versions[i + 1].version}...v${r.version}) (${date})`
    } else {
      title = `## [${r.version}](https://${hostname}/${username}/${repositoryName}/-/compare/v${versions[i + 1].version}...v${r.version}) (${date})`
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
${result.join('\n')}`
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
  hash: string
  author: string
  date: string
  commits: Commit[]
}
