#!/usr/bin/env node
// Fetches the GitHub contribution calendar for every year since FIRST_YEAR and
// writes it to src/data/github-contributions.json.
//
// Each year is read from two places, and the complete one with the higher
// total wins:
//   - the GraphQL API (contributionsCollection.contributionCalendar), and
//   - the public calendar on the profile page (github.com/users/<login>/contributions).
// The profile page can count more than a token sees through the API, for
// example contributions in SSO-protected orgs the token is not authorized for,
// which the public calendar still shows as private contributions. Whole years
// come from one source, never mixed per day, because the two can bucket a
// contribution into neighbouring days.
//
// Token: GH_CONTRIB_TOKEN, falling back to GITHUB_TOKEN.
// Fails soft: with no token, or when a year cannot be fetched and has no
// previous data to reuse, it logs a warning, leaves the existing JSON
// untouched, and exits 0 so it can never break a build. A year that fails but
// exists in the current JSON is kept as is while the other years refresh.
//
// src/data/github-extra-commits.json is not written by this script. It holds
// public commits authored under Mike's email addresses that are not linked to
// the GitHub account, which the calendar never counts: { total, days: {
// "YYYY-MM-DD": count } }. It was generated once by hand; to regenerate it:
//   1. For each of Mike's author emails, list commits via the REST API
//      (GET /repos/{repo}/commits?author=<email>&sha=<branch>) across every
//      branch of his public repos, plus org-owned and upstream repos he
//      committed to.
//   2. Keep commits whose top-level `author` is null (the email is not linked
//      to any account, so GitHub does not count it). Skip linked ones.
//   3. Deduplicate by SHA, bucket by the UTC date of commit.author.date, and
//      write the per-day counts and their sum as `total`.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const LOGIN = 'mjaverto'
const FIRST_YEAR = 2011
const OUTPUT = fileURLToPath(
  new URL('../src/data/github-contributions.json', import.meta.url),
)
const TIMEOUT_MS = 30_000

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

const QUERY = `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

function warn(message) {
  console.warn(`[github-contributions] warning: ${message}`)
}

function sumCounts(days) {
  return days.reduce((sum, day) => sum + day.count, 0)
}

async function fetchApiYear(token, year, today) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${LOGIN}-contributions`,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: {
        login: LOGIN,
        from: `${year}-01-01T00:00:00Z`,
        to: `${year}-12-31T23:59:59Z`,
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status} for ${year}`)
  }
  const body = await response.json()
  if (body.errors?.length) {
    throw new Error(`GraphQL error for ${year}: ${body.errors[0].message}`)
  }
  const calendar =
    body.data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) {
    throw new Error(`no contribution calendar returned for ${year}`)
  }

  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .filter((day) => day.date.startsWith(`${year}-`) && day.date <= today)
    .map((day) => {
      const level = LEVELS[day.contributionLevel]
      if (level === undefined) {
        throw new Error(`unknown contribution level ${day.contributionLevel}`)
      }
      return { date: day.date, count: day.contributionCount, level }
    })
  return { year, source: 'api', total: sumCounts(days), days }
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]
}

async function fetchProfileYear(year, today) {
  const response = await fetch(
    `https://github.com/users/${LOGIN}/contributions?from=${year}-01-01&to=${year}-12-31`,
    {
      headers: { 'User-Agent': `${LOGIN}-contributions` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  )
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const html = await response.text()

  const tooltips = new Map()
  for (const [, tag, text] of html.matchAll(
    /(<tool-tip\b[^>]*>)([^<]*)<\/tool-tip>/g,
  )) {
    const id = attribute(tag, 'for')
    if (id) tooltips.set(id, text.trim())
  }

  const days = []
  for (const [tag] of html.matchAll(/<td\b[^>]*\sdata-date="[^"]*"[^>]*>/g)) {
    const date = attribute(tag, 'data-date')
    if (!date?.startsWith(`${year}-`) || date > today) continue
    const level = Number(attribute(tag, 'data-level'))
    const text = tooltips.get(attribute(tag, 'id'))
    const match = text?.match(/^(No|[\d,]+) contributions? on /)
    if (!match || !(level >= 0 && level <= 4)) {
      throw new Error(`unparseable day ${date}`)
    }
    const count = match[1] === 'No' ? 0 : Number(match[1].replace(/,/g, ''))
    days.push({ date, count, level })
  }
  days.sort((a, b) => a.date.localeCompare(b.date))
  return { year, source: 'profile', total: sumCounts(days), days }
}

// Every date of the year up to today, so a source with gaps or extra days is
// never used.
function expectedDates(year, today) {
  const dates = []
  const day = new Date(`${year}-01-01T00:00:00Z`)
  for (
    let date = day.toISOString().slice(0, 10);
    date.startsWith(`${year}-`) && date <= today;
    date = day.toISOString().slice(0, 10)
  ) {
    dates.push(date)
    day.setUTCDate(day.getUTCDate() + 1)
  }
  return dates
}

async function fetchYear(token, year, today) {
  const expected = expectedDates(year, today)
  const results = await Promise.allSettled([
    fetchApiYear(token, year, today),
    fetchProfileYear(year, today),
  ])
  const usable = []
  for (const [i, result] of results.entries()) {
    const name = i === 0 ? 'API' : 'profile'
    if (result.status === 'rejected') {
      const { reason } = result
      warn(
        `${name} calendar for ${year} failed: ${reason instanceof Error ? reason.message : reason}`,
      )
    } else if (
      result.value.days.length !== expected.length ||
      result.value.days.some((day, j) => day.date !== expected[j])
    ) {
      warn(`${name} calendar for ${year} has missing or extra days`)
    } else {
      usable.push(result.value)
    }
  }
  if (usable.length === 0) {
    throw new Error(`no usable calendar for ${year}`)
  }
  return usable.reduce((best, source) =>
    source.total > best.total ? source : best,
  )
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf8'))
  } catch {
    return null
  }
}

// One day per line, in the layout Prettier keeps, so refresh diffs stay small
// and readable.
function serialize({ years, ...meta }) {
  const q = JSON.stringify
  const fields = (object) =>
    Object.entries(object).map(([key, value]) => `${q(key)}: ${q(value)}`)
  const yearBlocks = years.map(({ days, ...year }) => {
    const dayLines = days.map((day) => `        { ${fields(day).join(', ')} }`)
    return [
      '    {',
      ...fields(year).map((field) => `      ${field},`),
      '      "days": [',
      dayLines.join(',\n'),
      '      ]',
      '    }',
    ].join('\n')
  })
  return [
    '{',
    ...fields(meta).map((field) => `  ${field},`),
    '  "years": [',
    yearBlocks.join(',\n'),
    '  ]',
    '}',
    '',
  ].join('\n')
}

async function main() {
  const token = process.env.GH_CONTRIB_TOKEN || process.env.GITHUB_TOKEN
  if (!token) {
    warn('no GH_CONTRIB_TOKEN or GITHUB_TOKEN set. Keeping existing data')
    return
  }

  const existing = await readExisting()
  const today = new Date().toISOString().slice(0, 10)
  const currentYear = Number(today.slice(0, 4))
  const years = []
  for (let year = currentYear; year >= FIRST_YEAR; year--) {
    try {
      years.push(await fetchYear(token, year, today))
    } catch (error) {
      const previous = existing?.years?.find((entry) => entry.year === year)
      if (!previous) throw error
      warn(
        `${error instanceof Error ? error.message : error}; keeping the existing ${year} data`,
      )
      years.push(previous)
    }
  }

  // Only rewrite the file when the contribution data itself changed, so a
  // scheduled refresh does not produce a commit just for a new timestamp.
  if (existing && JSON.stringify(existing.years) === JSON.stringify(years)) {
    console.log('[github-contributions] no changes')
    return
  }

  const data = {
    generatedAt: new Date().toISOString(),
    login: LOGIN,
    since: FIRST_YEAR,
    years,
  }
  await writeFile(OUTPUT, serialize(data))
  const total = years.reduce((sum, { total }) => sum + total, 0)
  console.log(
    `[github-contributions] wrote ${years.length} years, ${total} contributions`,
  )
}

try {
  await main()
} catch (error) {
  warn(
    `${error instanceof Error ? error.message : String(error)}. Keeping existing data`,
  )
}
