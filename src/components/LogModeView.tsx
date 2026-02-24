import type { ReactNode } from 'react'
import SelectDayCard from './SelectDayCard'
import LogWorkoutCard from './LogWorkoutCard'
import WorkoutDetailsCard from './WorkoutDetailsCard'
import ThisWeekCard from './ThisWeekCard'
import WorkoutHistoryCard from './WorkoutHistoryCard'

type HistoryWeek = {
  start: Date
  count: number
  isCurrent: boolean
}

type LogModeViewProps = {
  weekDates: Date[]
  today: Date
  selectedDate: string
  daysWorked: number
  workoutDateSet: Set<string>
  formatWeekday: (date: Date) => string
  formatLocalIsoDate: (date: Date) => string
  onSelectDate: (iso: string) => void
  showAllMuscleHighlights: boolean
  parseIsoDate: (iso: string) => Date
  formatShortDate: (date: Date) => string
  onToggleHighlights: () => void
  muscleMap: ReactNode
  muscleCategories: Record<string, readonly string[]>
  dayMuscles: string[]
  weeklyMuscleCounts: Map<string, number>
  weeklyWorkedGroups: Set<string>
  onToggleDayMuscle: (group: string) => void
  daysToGo: number
  daysOverGoal: number
  goalDays: number
  goalBoxCount: number
  onEditGoal: () => void
  historyWeeks: HistoryWeek[]
  historyMax: number
}

export default function LogModeView({
  weekDates,
  today,
  selectedDate,
  daysWorked,
  workoutDateSet,
  formatWeekday,
  formatLocalIsoDate,
  onSelectDate,
  showAllMuscleHighlights,
  parseIsoDate,
  formatShortDate,
  onToggleHighlights,
  muscleMap,
  muscleCategories,
  dayMuscles,
  weeklyMuscleCounts,
  weeklyWorkedGroups,
  onToggleDayMuscle,
  daysToGo,
  daysOverGoal,
  goalDays,
  goalBoxCount,
  onEditGoal,
  historyWeeks,
  historyMax,
}: LogModeViewProps) {
  return (
    <>
      <SelectDayCard
        weekDates={weekDates}
        today={today}
        selectedDate={selectedDate}
        daysWorked={daysWorked}
        workoutDateSet={workoutDateSet}
        formatWeekday={formatWeekday}
        formatLocalIsoDate={formatLocalIsoDate}
        onSelectDate={onSelectDate}
      />

      <LogWorkoutCard
        showAllMuscleHighlights={showAllMuscleHighlights}
        selectedDate={selectedDate}
        parseIsoDate={parseIsoDate}
        formatShortDate={formatShortDate}
        onToggleHighlights={onToggleHighlights}
      >
        {muscleMap}
      </LogWorkoutCard>

      <WorkoutDetailsCard
        muscleCategories={muscleCategories}
        showAllMuscleHighlights={showAllMuscleHighlights}
        selectedDate={selectedDate}
        dayMuscles={dayMuscles}
        weeklyMuscleCounts={weeklyMuscleCounts}
        weeklyWorkedGroups={weeklyWorkedGroups}
        parseIsoDate={parseIsoDate}
        formatShortDate={formatShortDate}
        onToggleHighlights={onToggleHighlights}
        onToggleDayMuscle={onToggleDayMuscle}
      />

      <ThisWeekCard
        daysWorked={daysWorked}
        daysToGo={daysToGo}
        daysOverGoal={daysOverGoal}
        goalDays={goalDays}
        goalBoxCount={goalBoxCount}
        onEditGoal={onEditGoal}
      />

      <WorkoutHistoryCard
        historyWeeks={historyWeeks}
        historyMax={historyMax}
        goalDays={goalDays}
        formatShortDate={formatShortDate}
        formatLocalIsoDate={formatLocalIsoDate}
      />
    </>
  )
}
