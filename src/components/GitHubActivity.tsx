import {
  ContributionCalendar,
  ContributionLegend,
} from '@/components/ContributionCalendar'
import contributions from '@/data/github-contributions.json'
import extraCommits from '@/data/github-extra-commits.json'

const PROFILE_URL = `https://github.com/${contributions.login}`
const MS_PER_DAY = 86_400_000
const MS_PER_YEAR = 365.2425 * MS_PER_DAY

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

  const firstDate = [...daily]
    .filter(([, count]) => count > 0)
    .map(([date]) => date)
    .sort()[0]
  const lastDate = contributions.years[0].days.at(-1)!.date
  const span = Math.floor(
    (Date.parse(lastDate) - Date.parse(firstDate)) / MS_PER_YEAR,
  )

  // Weeks run Sunday to Saturday, from the week of January 1 of the first
  // year through the week of the last day with data.
  const jan1 = Date.UTC(Number(firstDate.slice(0, 4)), 0, 1)
  const start = jan1 - new Date(jan1).getUTCDay() * MS_PER_DAY
  const end = Date.parse(lastDate)
  const counts: Array<number> = []
  for (let day = start; day <= end; day += MS_PER_DAY) {
    const week = Math.floor((day - start) / (7 * MS_PER_DAY))
    const date = new Date(day).toISOString().slice(0, 10)
    counts[week] = (counts[week] ?? 0) + (daily.get(date) ?? 0)
  }
  const total = counts.reduce((sum, count) => sum + count, 0)

  return (
    <section aria-labelledby="github-activity">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2
          id="github-activity"
          className="font-medium text-zinc-900 dark:text-zinc-100"
        >
          <a href={PROFILE_URL} className="transition hover:text-teal-500">
            {new Intl.NumberFormat('en-US').format(total)} contributions over{' '}
            {span} years
          </a>
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {firstDate.slice(0, 4)} to {lastDate.slice(0, 4)}
        </p>
      </div>
      <div className="mt-1 mb-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <a href={PROFILE_URL} className="transition hover:text-teal-500">
          github.com/{contributions.login}
        </a>
        <ContributionLegend />
      </div>
      <ContributionCalendar
        start={new Date(start).toISOString().slice(0, 10)}
        total={total}
        counts={counts}
        levels={quartileLevels(counts)}
      />
    </section>
  )
}
