'use client'

// A client component only so the page ships the weeks as compact props (counts
// and levels) instead of hundreds of server-rendered cells twice over (once as
// HTML, once in the RSC payload). It has no state or effects.

const MS_PER_DAY = 86_400_000

// Applied to a parent; colors its direct children by their data-level.
const CELL_COLORS =
  '*:rounded-[2px] *:data-[level=0]:bg-zinc-100 *:data-[level=1]:bg-teal-200 *:data-[level=2]:bg-teal-300 *:data-[level=3]:bg-teal-500 *:data-[level=4]:bg-teal-700 dark:*:data-[level=0]:bg-zinc-800 dark:*:data-[level=1]:bg-teal-900 dark:*:data-[level=2]:bg-teal-700 dark:*:data-[level=3]:bg-teal-500 dark:*:data-[level=4]:bg-teal-300'
// Fixed-size cells that scroll below lg, stretched to the full width above.
const COLUMNS =
  'grid-cols-[repeat(var(--columns),0.5rem)] lg:grid-cols-[repeat(var(--columns),minmax(0,1fr))]'

export type WeeklyActivity = {
  // The Sunday that starts the first week, as YYYY-MM-DD.
  start: string
  total: number
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
  total,
  counts,
  levels,
}: WeeklyActivity) {
  const startTime = Date.parse(start)
  // The first week can start in late December; it belongs to the year it ends in.
  const firstYear = new Date(startTime + 6 * MS_PER_DAY).getUTCFullYear()
  const lastYear = new Date(
    startTime + (counts.length - 1) * 7 * MS_PER_DAY,
  ).getUTCFullYear()
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
    // Right to left so narrow screens start scrolled to the newest weeks.
    <div dir="rtl" className="overflow-x-auto pb-2 lg:overflow-visible">
      <div
        dir="ltr"
        className="w-max text-[10px] leading-none text-zinc-400 lg:w-full dark:text-zinc-500"
      >
        <div
          aria-hidden="true"
          className={`mb-1.5 grid h-2.5 gap-[2px] ${COLUMNS}`}
          style={style}
        >
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
          role="img"
          aria-label={`${formatCount(total)} contributions from ${firstYear} to ${lastYear}`}
          className={`grid grid-flow-col grid-rows-[repeat(7,auto)] gap-[2px] ${COLUMNS} ${CELL_COLORS} *:aspect-square`}
          style={style}
        >
          {counts.map((count, i) => (
            <span
              key={i}
              aria-hidden="true"
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
    </div>
  )
}

export function ContributionLegend() {
  return (
    <div aria-hidden="true" className="flex items-center gap-1.5">
      Less
      <span className={`flex gap-[2px] ${CELL_COLORS} *:size-2.5`}>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} data-level={level} />
        ))}
      </span>
      More
    </div>
  )
}
