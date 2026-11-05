'use client'

// A client component only so the page ships each year as compact props
// (counts and levels) instead of thousands of server-rendered cells twice over
// (once as HTML, once in the RSC payload). It has no state or effects.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MS_PER_DAY = 86_400_000

// Applied to a parent; colors its direct children by their data-level.
const CELL_COLORS =
  '*:rounded-[1px] sm:*:rounded-[2px] *:data-[level=0]:bg-zinc-100 *:data-[level=1]:bg-teal-200 *:data-[level=2]:bg-teal-300 *:data-[level=3]:bg-teal-500 *:data-[level=4]:bg-teal-700 dark:*:data-[level=0]:bg-zinc-800 dark:*:data-[level=1]:bg-teal-900 dark:*:data-[level=2]:bg-teal-700 dark:*:data-[level=3]:bg-teal-500 dark:*:data-[level=4]:bg-teal-300'
const GAP = 'gap-px sm:gap-[2px]'

export type YearActivity = {
  year: number
  total: number
  // Contributions per day from January 1, one entry per day with data.
  counts: Array<number>
  // Level 0 to 4 per day, as a string of digits aligned with counts.
  levels: string
}

function formatCount(count: number) {
  return new Intl.NumberFormat('en-US').format(count)
}

export function YearCalendar({ year, total, counts, levels }: YearActivity) {
  const offset = new Date(Date.UTC(year, 0, 1)).getUTCDay()
  const daysInYear =
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / MS_PER_DAY
  // 53 week columns, or 54 when a leap year starts on a Saturday. Counted from
  // the whole year so the current, partial year keeps the same cell size.
  const weekColumns = {
    gridTemplateColumns: `repeat(${Math.ceil((offset + daysInYear) / 7)}, minmax(0, 1fr))`,
  }
  const months = MONTHS.flatMap((name, month) => {
    const day = (Date.UTC(year, month, 1) - Date.UTC(year, 0, 1)) / MS_PER_DAY
    if (day >= counts.length) return []
    return [{ name: name.slice(0, 3), week: Math.floor((day + offset) / 7) }]
  })

  return (
    <div>
      <p className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {year}
        </span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {formatCount(total)} contribution{total === 1 ? '' : 's'}
        </span>
      </p>
      <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 text-[10px] leading-none text-zinc-400 dark:text-zinc-500">
        <div />
        <div
          aria-hidden="true"
          className={`grid ${GAP} mb-1.5 h-2.5`}
          style={weekColumns}
        >
          {months.map(({ name, week }) => (
            <span
              key={name}
              className="min-w-0 whitespace-nowrap"
              style={{ gridColumnStart: week + 1, gridRowStart: 1 }}
            >
              {name}
            </span>
          ))}
        </div>
        <div
          aria-hidden="true"
          className={`grid grid-rows-[repeat(7,minmax(0,1fr))] ${GAP}`}
        >
          {DAY_LABELS.map((label, row) => (
            <span key={row} className="flex h-0 items-center self-center">
              {label}
            </span>
          ))}
        </div>
        <div
          role="img"
          aria-label={`${formatCount(total)} contribution${total === 1 ? '' : 's'} in ${year}`}
          className={`grid grid-flow-col grid-rows-[repeat(7,auto)] ${GAP} ${CELL_COLORS} *:aspect-square`}
          style={weekColumns}
        >
          {Array.from({ length: offset }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {counts.map((count, i) => {
            const date = new Date(Date.UTC(year, 0, 1 + i))
            return (
              <span
                key={i}
                aria-hidden="true"
                data-level={levels[i]}
                title={
                  count > 0
                    ? `${formatCount(count)} contribution${count === 1 ? '' : 's'} on ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${year}`
                    : undefined
                }
              />
            )
          })}
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
