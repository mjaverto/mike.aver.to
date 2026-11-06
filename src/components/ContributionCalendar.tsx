'use client'

// A client component only so the page ships the weeks as compact props (counts
// and levels) instead of hundreds of server-rendered cells twice over (once as
// HTML, once in the RSC payload). It has no state or effects.

const MS_PER_DAY = 86_400_000
const MS_PER_COLUMN = 49 * MS_PER_DAY

// Shared by the year labels and the squares. The grid runs right to left so the
// newest column sits at the right edge, with as many columns as fit at a 12px
// (9px square plus 3px gap) or, from sm, 17px (14px square) pitch, stretched to
// fill the width exactly. Older columns land in zero-width implicit tracks past
// the left edge, so they take no space and cannot be seen or hovered. The gap
// is a left margin on each item rather than a column gap, which would also
// apply between those hidden tracks; the grid reaches 3px past the left edge
// so the oldest visible column's square starts at the edge.
const TRACKS =
  '-ml-[3px] grid w-[calc(100%+3px)] auto-cols-[0] grid-cols-[repeat(auto-fill,minmax(12px,1fr))] [direction:rtl] *:ml-[3px] sm:grid-cols-[repeat(auto-fill,minmax(17px,1fr))]'

// Applied to a parent; colors its direct children by their data-level and
// gives them a subtle hover zoom.
const CELL_STYLES =
  '*:rounded-[3px] *:transition *:duration-150 *:ease-out *:hover:relative *:hover:z-10 *:hover:scale-125 *:hover:brightness-110 *:hover:shadow-md *:hover:ring-2 *:hover:shadow-zinc-900/40 *:hover:ring-white *:hover:ring-offset-0 dark:*:hover:shadow-black/60 dark:*:hover:ring-zinc-100 motion-reduce:*:transition-none motion-reduce:*:hover:scale-100 *:data-[level=0]:bg-zinc-200 *:data-[level=1]:bg-teal-200 *:data-[level=2]:bg-teal-300 *:data-[level=3]:bg-teal-500 *:data-[level=4]:bg-teal-700 dark:*:data-[level=0]:bg-zinc-800 dark:*:data-[level=1]:bg-teal-900 dark:*:data-[level=2]:bg-teal-700 dark:*:data-[level=3]:bg-teal-500 dark:*:data-[level=4]:bg-teal-300'

export type WeeklyActivity = {
  // The Sunday that starts the first week, as YYYY-MM-DD. Columns are 7 weeks
  // from here.
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
  const columns = Math.ceil(counts.length / 7)

  // Weeks belong to the year they end in, so a first week starting in late
  // December counts toward January.
  const firstYear = new Date(startTime + 6 * MS_PER_DAY).getUTCFullYear()
  const lastYear = Number(lastDate.slice(0, 4))
  const firstColumn = (year: number) =>
    year > firstYear
      ? Math.floor((Date.UTC(year, 0, 1) - startTime) / MS_PER_COLUMN)
      : 0
  // Each year is labeled from the column holding the week of January 1 up to
  // the next year's. A year cut off at the left edge is labeled at the edge,
  // but only if its label fits in the columns left showing.
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
    const year = firstYear + i
    const last = year < lastYear ? firstColumn(year + 1) - 1 : columns - 1
    return { year, first: firstColumn(year), last }
  }).filter(({ first, last }) => first <= last)

  // Newest column first, each column's weeks top to bottom, padding the
  // newest column so the next one starts on the top row.
  const cells = []
  for (let column = columns - 1; column >= 0; column--) {
    for (let i = column * 7; i < column * 7 + 7; i++) {
      cells.push(
        i < counts.length ? (
          <span
            key={i}
            data-level={levels[i]}
            title={
              counts[i] > 0
                ? `${formatCount(counts[i])} contribution${counts[i] === 1 ? '' : 's'}, week of ${formatDate(startTime + i * 7 * MS_PER_DAY)}`
                : undefined
            }
          />
        ) : (
          <span key={i} className="invisible" />
        ),
      )
    }
  }

  return (
    <div
      aria-hidden="true"
      className="w-full text-[10px] leading-none text-zinc-400 lg:text-xs dark:text-zinc-500"
    >
      <div className={`mb-1.5 h-2.5 lg:mb-2 lg:h-3 ${TRACKS}`}>
        {years.map(({ year, first, last }) => (
          // A wrapping flex row behind a zero-width strut: a label too wide
          // for its columns wraps to a hidden second line instead of being
          // cut off or overlapping the next year.
          <span
            key={year}
            className="flex min-w-0 flex-wrap overflow-hidden [direction:ltr]"
            style={{
              // Grid lines count from the right edge.
              gridColumn: `${columns - last} / ${columns - first + 1}`,
              gridRow: 1,
            }}
          >
            <span className="h-2.5 w-0 lg:h-3" />
            {year}
          </span>
        ))}
      </div>
      <div
        className={`grid-flow-col grid-rows-[repeat(7,auto)] gap-y-[3px] ${TRACKS} ${CELL_STYLES} *:aspect-square`}
      >
        {cells}
      </div>
    </div>
  )
}
