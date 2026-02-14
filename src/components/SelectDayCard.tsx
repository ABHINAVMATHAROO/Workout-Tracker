type SelectDayCardProps = {
  weekDates: Date[]
  today: Date
  selectedDate: string
  daysWorked: number
  workoutDateSet: Set<string>
  formatWeekday: (date: Date) => string
  formatLocalIsoDate: (date: Date) => string
  onSelectDate: (iso: string) => void
}

export default function SelectDayCard({
  weekDates,
  today,
  selectedDate,
  daysWorked,
  workoutDateSet,
  formatWeekday,
  formatLocalIsoDate,
  onSelectDate,
}: SelectDayCardProps) {
  return (
    <section className="card week-card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Select Day</h2>
        </div>
        <div className="chip-grid">
          <span className="pill pill-week">
            {daysWorked} {daysWorked === 1 ? 'workout' : 'workouts'} this week
          </span>
        </div>
      </div>

      <div className="week-grid">
        {weekDates.map((date) => {
          const iso = formatLocalIsoDate(date)
          const hasWorkout = workoutDateSet.has(iso)
          const isToday = iso === formatLocalIsoDate(today)
          const isTodayActive = isToday && selectedDate === iso
          const isSelected = iso === selectedDate
          const isFuture = date.getTime() > today.getTime()
          const isPast = date.getTime() < today.getTime()
          return (
            <button
              key={iso}
              type="button"
              className={`day-pill ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectDate(iso)}
              disabled={isFuture}
            >
              <span className="day-name">{formatWeekday(date)}</span>
              <span className={`day-date ${isPast ? 'past' : ''}`}>{date.getDate()}</span>
              <span
                className={`dot ${isTodayActive ? 'today' : ''} ${hasWorkout ? 'active' : ''}`}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
