import {
  ContributionLegend,
  YearCalendar,
  type YearActivity,
} from '@/components/ContributionCalendar'
import contributions from '@/data/github-contributions.json'
import extraCommits from '@/data/github-extra-commits.json'

const PROFILE_URL = `https://github.com/${contributions.login}`
const MS_PER_YEAR = 365.2425 * 86_400_000

// Levels are quartiles of the year's active days, as on GitHub: an active day
// gets level 1 to 4 by which quarter of the year's non-zero counts it falls in.
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
  const extra: Record<string, number> = extraCommits.days
  const years: Array<YearActivity> = contributions.years.map(
    ({ year, days }) => {
      const counts = days.map(({ date, count }) => count + (extra[date] ?? 0))
      return {
        year,
        total: counts.reduce((sum, count) => sum + count, 0),
        counts,
        levels: quartileLevels(counts),
      }
    },
  )
  const total = years.reduce((sum, year) => sum + year.total, 0)

  const allDays = contributions.years.flatMap((year) => year.days)
  const firstDate = allDays
    .filter((day) => day.count > 0 || extra[day.date])
    .map((day) => day.date)
    .sort()[0]
  const lastDate = contributions.years[0].days.at(-1)!.date
  const span = Math.floor(
    (Date.parse(lastDate) - Date.parse(firstDate)) / MS_PER_YEAR,
  )

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
      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <a href={PROFILE_URL} className="transition hover:text-teal-500">
          github.com/{contributions.login}
        </a>
        <ContributionLegend />
      </div>
      <div className="mt-8 space-y-6">
        {years.map((year) => (
          <YearCalendar key={year.year} {...year} />
        ))}
      </div>
    </section>
  )
}
