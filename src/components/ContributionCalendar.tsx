'use client'

// A client component only so the page ships the weeks as compact props (counts
// and levels) instead of hundreds of server-rendered cells twice over (once as
// HTML, once in the RSC payload). It has no state or effects.

const MS_PER_DAY = 86_400_000

// Applied to a parent; colors its direct children by their data-level and
// gives them a subtle hover zoom.
const CELL_STYLES =
  '*:rounded-[3px] *:transition *:duration-150 *:ease-out *:hover:relative *:hover:z-10 *:hover:scale-125 *:hover:brightness-110 *:hover:shadow-md *:hover:ring-2 *:hover:shadow-zinc-900/40 *:hover:ring-white *:hover:ring-offset-0 dark:*:hover:shadow-black/60 dark:*:hover:ring-zinc-100 motion-reduce:*:transition-none motion-reduce:*:hover:scale-100 *:data-[level=0]:bg-zinc-200 *:data-[level=1]:bg-teal-200 *:data-[level=2]:bg-teal-300 *:data-[level=3]:bg-teal-500 *:data-[level=4]:bg-teal-700 dark:*:data-[level=0]:bg-zinc-800 dark:*:data-[level=1]:bg-teal-900 dark:*:data-[level=2]:bg-teal-700 dark:*:data-[level=3]:bg-teal-500 dark:*:data-[level=4]:bg-teal-300'
const COLUMNS = 'grid-cols-[repeat(var(--columns),minmax(0,1fr))]'

export type WeeklyActivity = {
  // The Sunday that starts the first week, as YYYY-MM-DD.
  start: string
  // The last day with data, as YYYY-MM-DD.
  lastDate: string
  // Contributions per week, oldest first.
  counts: Array<number>
  // Level 0 to 4 per week, as a string of digits aligned with counts.
  levels: string
}

const formatCount = new Intl.NumberFormat('en-US').format
const formatDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
}).format

// GitHub's contribution graph zoomed out: each square is a week instead of a
// day, filled down 7 rows and then across, so a column is 7 weeks and years
// take the place of months.
export function ContributionCalendar({
  start,
  lastDate,
  counts,
  levels,
}: WeeklyActivity) {
  const startTime = Date.parse(start)
  // Weeks belong to the year they end in, so a first week starting in late
  // December counts toward January.
  const firstYear = new Date(startTime + 6 * MS_PER_DAY).getUTCFullYear()
  const lastYear = Number(lastDate.slice(0, 4))
  // Each year is labeled above the column holding the week of January 1.
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
    const year = firstYear + i
    const week = Math.floor(
      (Math.max(Date.UTC(year, 0, 1), startTime) - startTime) /
        (7 * MS_PER_DAY),
    )
    return { year, column: Math.floor(week / 7) }
  })
  const style = {
    '--columns': Math.ceil(counts.length / 7),
  } as React.CSSProperties

  return (
    <div
      aria-hidden="true"
      // Cap each column at a 14px square plus a 3px gap, like GitHub's graph;
      // narrower screens shrink the squares to fit.
      className="w-[calc(var(--columns)*1.0625rem)] max-w-full text-[10px] leading-none text-zinc-400 lg:text-xs dark:text-zinc-500"
      style={style}
    >
      <div className={`mb-1.5 grid h-2.5 gap-[3px] lg:mb-2 lg:h-3 ${COLUMNS}`}>
        {years.map(({ year, column }) => (
          <span
            key={year}
            className="min-w-0 whitespace-nowrap"
            style={{ gridColumnStart: column + 1, gridRowStart: 1 }}
          >
            {year}
          </span>
        ))}
      </div>
      <div
        className={`grid grid-flow-col grid-rows-[repeat(7,auto)] gap-[3px] ${COLUMNS} ${CELL_STYLES} *:aspect-square`}
      >
        {counts.map((count, i) => (
          <span
            key={i}
            data-level={levels[i]}
            title={
              count > 0
                ? `${formatCount(count)} contribution${count === 1 ? '' : 's'}, week of ${formatDate(startTime + i * 7 * MS_PER_DAY)}`
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
