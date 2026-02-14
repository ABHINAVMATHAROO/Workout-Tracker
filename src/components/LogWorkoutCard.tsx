import type { ReactNode } from 'react'
import WeekToggle from './WeekToggle'

type LogWorkoutCardProps = {
  showAllMuscleHighlights: boolean
  selectedDate: string
  parseIsoDate: (iso: string) => Date
  formatShortDate: (date: Date) => string
  onToggleHighlights: () => void
  children: ReactNode
}

export default function LogWorkoutCard({
  showAllMuscleHighlights,
  selectedDate,
  parseIsoDate,
  formatShortDate,
  onToggleHighlights,
  children,
}: LogWorkoutCardProps) {
  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Log workout</h2>
        </div>
        <div className="chip-grid">
          <WeekToggle
            isWeek={showAllMuscleHighlights}
            dayLabel={formatShortDate(parseIsoDate(selectedDate))}
            onToggle={onToggleHighlights}
          />
        </div>
      </div>
      {children}
    </section>
  )
}
