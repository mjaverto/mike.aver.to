import { ContributionCalendar } from '@/components/ContributionCalendar'
import contributions from '@/data/github-contributions.json'
import extraCommits from '@/data/github-extra-commits.json'

const PROFILE_URL = `https://github.com/${contributions.login}`
const MS_PER_DAY = 86_400_000
// How much history the full-width chart covers.
const YEARS = 5
// Enough columns for the widest layout: the 64rem content column fits
// floor((1024 + 3) / 17) = 60 columns of 14px squares with a 3px gap. Narrower
// layouts show only the newest columns that fit.
const COLUMNS = 60
// Filled down each column, then across, as on GitHub.
const ROWS = 7
const CELLS = COLUMNS * ROWS
// Each square sums a fixed number of days, the fewest that let the grid cover
// YEARS.
const DAYS_PER_CELL = Math.ceil((YEARS * 365.25) / CELLS)
const MS_PER_CELL = DAYS_PER_CELL * MS_PER_DAY
const MS_PER_COLUMN = ROWS * MS_PER_CELL
// Cells and columns are counted from 1970, so they stay put as new days
// arrive.
const EPOCH = Date.UTC(1970, 0, 1)

// Levels are quartiles of the active cells, as GitHub does for days: an active
// cell gets level 1 to 4 by which quarter of the non-zero counts it falls in.
function quartileLevels(counts: Array<number>) {
  const active = counts.filter((count) => count > 0).sort((a, b) => a - b)
  return counts
    .map((count) => {
      if (count === 0) return 0
      let atOrBelow = 0
      while (atOrBelow < active.length && active[atOrBelow] <= count) {
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

  // Cells run from the start of the oldest of COLUMNS columns, ending with the
  // one holding the last day with data.
  const end = Date.parse(lastDate)
  const lastColumn = Math.floor((end - EPOCH) / MS_PER_COLUMN)
  const start = EPOCH + (lastColumn - COLUMNS + 1) * MS_PER_COLUMN
  const counts: Array<number> = []
  for (let day = start; day <= end; day += MS_PER_DAY) {
    const cell = Math.floor((day - start) / MS_PER_CELL)
    const date = new Date(day).toISOString().slice(0, 10)
    counts[cell] = (counts[cell] ?? 0) + (daily.get(date) ?? 0)
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
          lastDate={lastDate}
          rows={ROWS}
          daysPerCell={DAYS_PER_CELL}
          counts={counts}
          levels={quartileLevels(counts)}
        />
      </a>
    </section>
  )
}
