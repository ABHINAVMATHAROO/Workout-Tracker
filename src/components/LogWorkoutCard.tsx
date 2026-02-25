import type { ReactNode } from 'react'
import WeekToggle from './WeekToggle'

type LogWorkoutCardProps = {
  showAllMuscleHighlights: boolean
  selectedDate: string
  dayMuscles: string[]
  parseIsoDate: (iso: string) => Date
  formatShortDate: (date: Date) => string
  onToggleHighlights: () => void
  children: ReactNode
}

export default function LogWorkoutCard({
  showAllMuscleHighlights,
  selectedDate,
  dayMuscles,
  parseIsoDate,
  formatShortDate,
  onToggleHighlights,
  children,
}: LogWorkoutCardProps) {
  const dayTitle = dayMuscles.length > 0 ? dayMuscles.join(' / ') : 'Log workout'
  const titleText = showAllMuscleHighlights ? 'This week' : dayTitle
  const truncatedTitle = titleText.length > 56 ? `${titleText.slice(0, 56).trimEnd()}..` : titleText

  return (
    <section className="card log-workout-card">
      <div className="section-head section-head-inline log-workout-head">
        <div className="section-title">
          <h2 className="section-title-nowrap log-workout-title">{truncatedTitle}</h2>
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
