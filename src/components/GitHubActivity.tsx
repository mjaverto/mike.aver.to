import { ContributionCalendar } from '@/components/ContributionCalendar'
import contributions from '@/data/github-contributions.json'
import extraCommits from '@/data/github-extra-commits.json'

const PROFILE_URL = `https://github.com/${contributions.login}`
const MS_PER_DAY = 86_400_000
// The chart starts with the week of January 1, 2023.
const FIRST_YEAR = 2023

// Levels are quartiles of the active weeks, as GitHub does for days: an active
// week gets level 1 to 4 by which quarter of the non-zero counts it falls in.
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

  // Weeks run Sunday to Saturday, from the week of January 1 of the first
  // year through the week of the last day with data.
  const jan1 = Date.UTC(FIRST_YEAR, 0, 1)
  const start = jan1 - new Date(jan1).getUTCDay() * MS_PER_DAY
  const end = Date.parse(lastDate)
  const counts: Array<number> = []
  for (let day = start; day <= end; day += MS_PER_DAY) {
    const week = Math.floor((day - start) / (7 * MS_PER_DAY))
    const date = new Date(day).toISOString().slice(0, 10)
    counts[week] = (counts[week] ?? 0) + (daily.get(date) ?? 0)
  }

  return (
    <section aria-label="GitHub activity">
      <a
        href={PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Mike Averto on GitHub (opens in new tab)"
        className="block cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
      >
        <ContributionCalendar
          start={new Date(start).toISOString().slice(0, 10)}
          lastDate={lastDate}
          counts={counts}
          levels={quartileLevels(counts)}
        />
      </a>
    </section>
  )
}
