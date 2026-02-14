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
    <section className="card history-card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Workout history</h2>
        </div>
      </div>
      <div
        className="history-chart"
        style={{ '--target-line': `${(goalDays / historyMax) * 100}%` } as CSSProperties}
      >
        <div className="history-bars">
          <div className="history-target" />
          {historyWeeks.map((week) => {
            const barHeight = (week.count / historyMax) * 100
            return (
              <div className="history-bar" key={formatLocalIsoDate(week.start)}>
                <div className="history-bar-track">
                  <div
                    className={`history-bar-fill ${week.isCurrent ? 'is-current' : ''}`}
                    style={{ '--bar-height': `${barHeight}%` } as CSSProperties}
                  />
                </div>
                <span className="history-bar-label">{formatShortDate(week.start)}</span>
              </div>
            )
          })}
        </div>
        <div className="history-axis">
          <span className="label history-axis-top">{historyMax}</span>
          <span className="history-axis-mid" aria-hidden="true">
            <img
              className="history-axis-target"
              src={`${import.meta.env.BASE_URL}target.svg`}
              alt=""
            />
          </span>
        </div>
      </div>
    </section>
  )
}
