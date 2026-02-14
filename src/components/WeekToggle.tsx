type WeekToggleProps = {
  isWeek: boolean
  dayLabel: string
  onToggle: () => void
}

export default function WeekToggle({ isWeek, dayLabel, onToggle }: WeekToggleProps) {
  return (
    <button
      type="button"
      className={`week-toggle ${isWeek ? 'is-week' : 'is-day'}`}
      onClick={onToggle}
      aria-pressed={isWeek}
    >
      <span className="week-toggle-track">
        <span className="week-toggle-track-label">{dayLabel}</span>
        <span className="week-toggle-track-label">Week</span>
      </span>
      <span className="week-toggle-thumb">
        <span className="week-toggle-label">{isWeek ? 'Week' : dayLabel}</span>
      </span>
    </button>
  )
}
