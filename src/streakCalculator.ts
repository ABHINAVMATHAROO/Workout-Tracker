type WorkoutEntry = {
  date: string
}

type WeekSummary = {
  daysWorked: number
  hasWorkout: boolean
  meetsGoal: boolean
}

const pad = (value: number) => String(value).padStart(2, '0')

const formatLocalIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseIsoDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(date.getDate() + amount)
  return next
}

const startOfWeekMonday = (date: Date) => {
  const dayIndex = (date.getDay() + 6) % 7
  const start = new Date(date)
  start.setDate(date.getDate() - dayIndex)
  start.setHours(0, 0, 0, 0)
  return start
}

const computeCurrentStreak = (
  weeks: WeekSummary[],
  predicate: (week: WeekSummary) => boolean
) => {
  let count = 0
  for (let index = weeks.length - 1; index >= 0; index -= 1) {
    if (!predicate(weeks[index])) {
      break
    }
    count += 1
  }
  return count
}

const computeBestStreak = (
  weeks: WeekSummary[],
  predicate: (week: WeekSummary) => boolean
) => {
  let best = 0
  let current = 0
  weeks.forEach((week) => {
    if (predicate(week)) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 0
    }
  })
  return best
}

export const calculateStreaks = (
  workouts: WorkoutEntry[],
  goalDays: number,
  today: Date
) => {
  if (workouts.length === 0) {
    return {
      currentWorkoutStreak: 0,
      currentGoalStreak: 0,
      bestWorkoutStreak: 0,
      bestGoalStreak: 0,
    }
  }

  const weekMap = new Map<string, Set<string>>()
  const workoutDates = workouts.map((workout) => parseIsoDate(workout.date))
  workoutDates.forEach((date, index) => {
    const weekStart = startOfWeekMonday(date)
    const weekKey = formatLocalIsoDate(weekStart)
    const set = weekMap.get(weekKey) ?? new Set<string>()
    set.add(workouts[index].date)
    weekMap.set(weekKey, set)
  })

  const earliestDate = workoutDates.reduce((min, date) =>
    date.getTime() < min.getTime() ? date : min
  )
  const firstWeekStart = startOfWeekMonday(earliestDate)
  const currentWeekStart = startOfWeekMonday(today)

  const weeks: WeekSummary[] = []
  for (
    let cursor = new Date(firstWeekStart);
    cursor.getTime() <= currentWeekStart.getTime();
    cursor = addDays(cursor, 7)
  ) {
    const key = formatLocalIsoDate(cursor)
    const daysWorked = weekMap.get(key)?.size ?? 0
    weeks.push({
      daysWorked,
      hasWorkout: daysWorked > 0,
      meetsGoal: daysWorked >= goalDays,
    })
  }

  return {
    currentWorkoutStreak: computeCurrentStreak(weeks, (week) => week.hasWorkout),
    currentGoalStreak: computeCurrentStreak(weeks, (week) => week.meetsGoal),
    bestWorkoutStreak: computeBestStreak(weeks, (week) => week.hasWorkout),
    bestGoalStreak: computeBestStreak(weeks, (week) => week.meetsGoal),
  }
}
