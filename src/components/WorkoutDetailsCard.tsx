import WeekToggle from './WeekToggle'

const getCount = (counts: Map<string, number>, group: string) => counts.get(group) ?? 0

type WorkoutDetailsCardProps = {
  muscleCategories: Record<string, readonly string[]>
  showAllMuscleHighlights: boolean
  selectedDate: string
  dayMuscles: string[]
  weeklyMuscleCounts: Map<string, number>
  weeklyWorkedGroups: Set<string>
  parseIsoDate: (iso: string) => Date
  formatShortDate: (date: Date) => string
  onToggleHighlights: () => void
  onToggleDayMuscle: (group: string) => void
}

export default function WorkoutDetailsCard({
  muscleCategories,
  showAllMuscleHighlights,
  selectedDate,
  dayMuscles,
  weeklyMuscleCounts,
  weeklyWorkedGroups,
  parseIsoDate,
  formatShortDate,
  onToggleHighlights,
  onToggleDayMuscle,
}: WorkoutDetailsCardProps) {
  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Workout Details</h2>
        </div>
        <div className="chip-grid">
          <WeekToggle
            isWeek={showAllMuscleHighlights}
            dayLabel={formatShortDate(parseIsoDate(selectedDate))}
            onToggle={onToggleHighlights}
          />
        </div>
      </div>

      <div className="muscle-categories">
        {Object.entries(muscleCategories).map(([category, groups]) => (
          <div key={category} className="muscle-category">
            <p className="label">{category}</p>
            <div className="chip-grid">
              {groups.map((group) => {
                const workedToday = !showAllMuscleHighlights && dayMuscles.includes(group)
                const workedThisWeek =
                  showAllMuscleHighlights && weeklyWorkedGroups.has(group)
                const weeklyCount = getCount(weeklyMuscleCounts, group)
                const label = weeklyCount > 0 ? `${group} - ${weeklyCount}` : group
                const toneClass = workedToday
                  ? 'chip-today'
                  : workedThisWeek
                    ? 'chip-week'
                    : ''
                return (
                  <button
                    key={group}
                    className={`chip ${toneClass} ${workedToday ? 'selected' : ''}`}
                    onClick={() => onToggleDayMuscle(group)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
