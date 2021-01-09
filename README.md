# git-commits-to-changelog

A CLI to generate changelog from git commits.

[![Dependency Status](https://david-dm.org/plantain-00/git-commits-to-changelog.svg)](https://david-dm.org/plantain-00/git-commits-to-changelog)
[![devDependency Status](https://david-dm.org/plantain-00/git-commits-to-changelog/dev-status.svg)](https://david-dm.org/plantain-00/git-commits-to-changelog#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/git-commits-to-changelog.svg?branch=master)](https://travis-ci.org/plantain-00/git-commits-to-changelog)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/git-commits-to-changelog?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/git-commits-to-changelog/branch/master)
![Github CI](https://github.com/plantain-00/git-commits-to-changelog/workflows/Github%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/git-commits-to-changelog.svg)](https://badge.fury.io/js/git-commits-to-changelog)
[![Downloads](https://img.shields.io/npm/dm/git-commits-to-changelog.svg)](https://www.npmjs.com/package/git-commits-to-changelog)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fgit-commits-to-changelog%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/git-commits-to-changelog)

## install

`yarn global add git-commits-to-changelog`

## usage

run `git-commits-to-changelog`

## options

key | description
--- | ---
-h,--help | Print this message.
-v,--version | Print the version
--release | release version, eg `--release 1.0.0`
--append | append changelog to old changelog rather than generate it from whole git commits

## API

```ts
import { gitCommitToChangeLog } from 'git-commits-to-changelog'

const changelog = await gitCommitToChangeLog()
```
