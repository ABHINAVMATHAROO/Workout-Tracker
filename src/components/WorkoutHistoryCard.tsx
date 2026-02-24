import type { CSSProperties } from 'react'

type HistoryWeek = {
  start: Date
  count: number
  isCurrent: boolean
}

type WorkoutHistoryCardProps = {
  historyWeeks: HistoryWeek[]
  historyMax: number
  goalDays: number
  formatShortDate: (date: Date) => string
  formatLocalIsoDate: (date: Date) => string
}

export default function WorkoutHistoryCard({
  historyWeeks,
  historyMax,
  goalDays,
  formatShortDate,
  formatLocalIsoDate,
}: WorkoutHistoryCardProps) {
  return (
    <section className="card consistency-card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Consistency</h2>
        </div>
      </div>
      <div
        className="consistency-chart"
        style={{ '--target-line': `${(goalDays / historyMax) * 100}%` } as CSSProperties}
      >
        <div className="consistency-bars">
          <div className="consistency-target" />
          {historyWeeks.map((week) => {
            const barHeight = (week.count / historyMax) * 100
            return (
              <div className="consistency-bar" key={formatLocalIsoDate(week.start)}>
                <div className="consistency-bar-track">
                  <div
                    className={`consistency-bar-fill ${week.isCurrent ? 'is-current' : ''}`}
                    style={{ '--bar-height': `${barHeight}%` } as CSSProperties}
                  />
                </div>
                <span className="consistency-bar-label">{formatShortDate(week.start)}</span>
              </div>
            )
          })}
        </div>
        <div className="consistency-axis">
          <span className="label consistency-axis-top">{historyMax}</span>
          <span className="consistency-axis-mid" aria-hidden="true">
            <img
              className="consistency-axis-target"
              src={`${import.meta.env.BASE_URL}target.svg`}
              alt=""
            />
          </span>
        </div>
      </div>
    </section>
  )
}
