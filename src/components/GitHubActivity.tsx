import { ContributionCalendar } from '@/components/ContributionCalendar'
import contributions from '@/data/github-contributions.json'
import extraCommits from '@/data/github-extra-commits.json'

const PROFILE_URL = `https://github.com/${contributions.login}`
const MS_PER_DAY = 86_400_000
// The full-width chart covers exactly this many years, in days.
const YEARS = 5
const DAYS = Math.round(YEARS * 365.25)
// Enough columns for the widest layout: the 64rem content column fits
// floor((1024 + 3) / 17) = 60 columns of 14px squares with a 3px gap. Narrower
// layouts show only the newest columns that fit.
const COLUMNS = 60
// Filled down each column, then across, as on GitHub.
const ROWS = 7
const CELLS = COLUMNS * ROWS
// Each cell covers DAYS / CELLS days, rounded to whole days per cell.

// Levels are quartiles of the active cells, as GitHub does for days: an active
// cell gets level 1 to 4 by which quarter of the non-zero values it falls in.
function quartileLevels(values: Array<number>) {
  const active = values.filter((value) => value > 0).sort((a, b) => a - b)
  return values
    .map((value) => {
      if (value === 0) return 0
      let atOrBelow = 0
      while (atOrBelow < active.length && active[atOrBelow] <= value) {
        atOrBelow++
      }
      return Math.ceil((4 * atOrBelow) / active.length)
    })
    .join('')
}

export function GitHubActivity() {
  // GitHub's calendar plus public commits under email addresses that are not
  // linked to the account, which GitHub does not count.
  const daily = new Map<string, number>(Object.entries(extraCommits.days))
  for (const { days } of contributions.years) {
    for (const { date, count } of days) {
      daily.set(date, (daily.get(date) ?? 0) + count)
    }
  }

  const lastDate = contributions.years[0].days.at(-1)!.date

  // The window ends with the last day with data and is split across the cells
  // as evenly as whole days allow, so each cell covers 4 or 5 days.
  const end = Date.parse(lastDate)
  const start = end - (DAYS - 1) * MS_PER_DAY
  const counts = Array<number>(CELLS).fill(0)
  const daysCovered = Array<number>(CELLS).fill(0)
  for (let day = 0; day < DAYS; day++) {
    const cell = Math.floor((day * CELLS) / DAYS)
    const date = new Date(start + day * MS_PER_DAY).toISOString().slice(0, 10)
    counts[cell] += daily.get(date) ?? 0
    daysCovered[cell]++
  }

  return (
    <section aria-label="GitHub activity">
      <a
        href={PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Mike Averto on GitHub (opens in new tab)"
        className="block w-full cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
      >
        <ContributionCalendar
          start={new Date(start).toISOString().slice(0, 10)}
          days={DAYS}
          rows={ROWS}
          counts={counts}
          // Per day, so 4- and 5-day cells compare fairly.
          levels={quartileLevels(
            counts.map((count, i) => count / daysCovered[i]),
          )}
        />
      </a>
    </section>
  )
}
