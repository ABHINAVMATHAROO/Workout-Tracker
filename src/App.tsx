import { useEffect, useMemo, useRef, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import MuscleMapSvg from './MuscleMapSvg'
import { calculateStreaks } from './streakCalculator'
import AuthScreen from './AuthScreen'
import { type HyperspeedOptions } from './hyperspeed/background'
import StreakCard from './components/StreakCard'
import SelectDayCard from './components/SelectDayCard'
import LogWorkoutCard from './components/LogWorkoutCard'
import WorkoutDetailsCard from './components/WorkoutDetailsCard'
import ThisWeekCard from './components/ThisWeekCard'
import WorkoutHistoryCard from './components/WorkoutHistoryCard'

const MUSCLE_CATEGORIES = {
  Push: ['Chest', 'Triceps', 'Shoulder'],
  Pull: ['Back', 'Biceps', 'Forearms'],
  Other: ['Legs', 'Core'],
} as const

const hyperspeedOptions: HyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x04070f,
    islandColor: 0x0a1020,
    background: 0x0a1020,
    shoulderLines: 0xaeea00,
    brokenLines: 0xffb300,
    leftCars: [0xaeea00, 0xffb300],
    rightCars: [0x4dd0e1, 0xffb300],
    sticks: 0x4dd0e1,
  },
}

type Workout = {
  date: string
  muscleGroups: string[]
}

type MuscleCounts = Map<string, number>

const pad = (value: number) => String(value).padStart(2, '0')

const formatLocalIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseIsoDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const startOfWeekMonday = (date: Date) => {
  const dayIndex = (date.getDay() + 6) % 7
  const start = new Date(date)
  start.setDate(date.getDate() - dayIndex)
  start.setHours(0, 0, 0, 0)
  return start
}

const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(date.getDate() + amount)
  return next
}

const formatWeekday = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)

const formatRange = (start: Date, end: Date) => {
  const startFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(start)
  const endFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(end)
  return `${startFmt} - ${endFmt}`
}

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)

const getCount = (counts: MuscleCounts, group: string) => counts.get(group) ?? 0

type MuscleMapProps = {
  weeklyCounts: MuscleCounts
  selectedGroups: string[]
  view: 'front' | 'back'
  onToggle: (group: string) => void
  onFlip: () => void
}

function MuscleMap({ weeklyCounts, selectedGroups, view, onToggle, onFlip }: MuscleMapProps) {
  const workedGroups = useMemo(
    () => new Set(Array.from(weeklyCounts.keys()).filter((group) => getCount(weeklyCounts, group) > 0)),
    [weeklyCounts]
  )

  return (
    <MuscleMapSvg
      workedGroups={workedGroups}
      selectedGroups={new Set(selectedGroups)}
      view={view}
      onToggle={onToggle}
      onFlip={onFlip}
    />
  )
}

type AuthStatus = 'signed-out' | 'loading' | 'pending-profile' | 'ready'

type ProfileData = {
  bestWorkoutStreakWeeks?: number
  bestGoalStreakWeeks?: number
}

const signInWithGoogle = async (setAuthStatus: (status: AuthStatus) => void) => {
  setAuthStatus('loading')
  await signInWithPopup(auth, googleProvider)
}

export default function App() {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const [goalDays, setGoalDays] = useState(4)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [pendingProfile, setPendingProfile] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [showAllMuscleHighlights, setShowAllMuscleHighlights] = useState(false)
  const [muscleView, setMuscleView] = useState<'front' | 'back'>('front')
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const weekStart = useMemo(() => startOfWeekMonday(addDays(today, weekOffset * 7)), [today, weekOffset])
  const currentWeekStart = useMemo(() => startOfWeekMonday(today), [today])
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx)),
    [weekStart]
  )

  const workoutsThisWeek = useMemo(() => {
    const startIso = formatLocalIsoDate(weekStart)
    const endIso = formatLocalIsoDate(addDays(weekStart, 6))
    return workouts.filter(
      (workout) => workout.date >= startIso && workout.date <= endIso
    )
  }, [weekStart, workouts])

  const workoutDateSet = useMemo(() => {
    const set = new Set<string>()
    workoutsThisWeek.forEach((workout) => set.add(workout.date))
    return set
  }, [workoutsThisWeek])

  const daysWorked = workoutDateSet.size
  const daysToGo = Math.max(0, goalDays - daysWorked)
  const daysOverGoal = Math.max(0, daysWorked - goalDays)
  const goalBoxCount = Math.max(7, goalDays)
  const { currentWorkoutStreak, bestWorkoutStreak, bestGoalStreak } =
    useMemo(() => calculateStreaks(workouts, goalDays, today), [workouts, goalDays, today])
  const bestWorkoutDisplay = bestWorkoutStreak

  const [selectedDate, setSelectedDate] = useState(() => formatLocalIsoDate(today))
  const weeklyMuscleCounts = useMemo(() => {
    const counts = new Map<string, number>()
    workoutsThisWeek.forEach((workout) => {
      workout.muscleGroups.forEach((group) => {
        counts.set(group, (counts.get(group) ?? 0) + 1)
      })
    })
    return counts
  }, [workoutsThisWeek])

  const highlightCounts = useMemo(() => {
    if (!showAllMuscleHighlights) return new Map<string, number>()
    return weeklyMuscleCounts
  }, [showAllMuscleHighlights, weeklyMuscleCounts])

  const dayWorkout = workouts.find((workout) => workout.date === selectedDate)
  const dayMuscles = dayWorkout?.muscleGroups ?? []
  const weeklyWorkedGroups = useMemo(
    () => new Set(Array.from(weeklyMuscleCounts.keys()).filter((group) => getCount(weeklyMuscleCounts, group) > 0)),
    [weeklyMuscleCounts]
  )

  const weeklyCountsByWeek = useMemo(() => {
    const weekMap = new Map<string, Set<string>>()
    workouts.forEach((workout) => {
      const weekKey = formatLocalIsoDate(startOfWeekMonday(parseIsoDate(workout.date)))
      const set = weekMap.get(weekKey) ?? new Set<string>()
      set.add(workout.date)
      weekMap.set(weekKey, set)
    })
    const counts = new Map<string, number>()
    weekMap.forEach((set, key) => {
      counts.set(key, set.size)
    })
    return counts
  }, [workouts])

  const previousWeekCountsRef = useRef<Map<string, number> | null>(null)
  const previousGoalDaysRef = useRef<number | null>(null)

  const historyWeeks = useMemo(() => {
    const count = 8
    return Array.from({ length: count }, (_, idx) => {
      const start = addDays(weekStart, -7 * (count - 1 - idx))
      const end = addDays(start, 6)
      const startIso = formatLocalIsoDate(start)
      const endIso = formatLocalIsoDate(end)
      const uniqueDates = new Set(
        workouts
          .filter((workout) => workout.date >= startIso && workout.date <= endIso)
          .map((workout) => workout.date)
      )
      return {
        start,
        count: uniqueDates.size,
        isCurrent: start.getTime() === weekStart.getTime(),
      }
    })
  }, [weekStart, workouts])

  const historyMax = 7


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setAuthStatus('signed-out')
        setWorkouts([])
        setProfileData(null)
        return
      }

      setAuthStatus('loading')
      const profileRef = doc(db, 'users', nextUser.uid)
      try {
        const profileSnap = await getDoc(profileRef)
        if (!profileSnap.exists()) {
          setPendingProfile(nextUser)
          setAuthStatus('pending-profile')
          return
        }

        setPendingProfile(null)
        setProfileData(profileSnap.data() as ProfileData)
        setAuthStatus('ready')
      } catch (error) {
        console.error('Failed to load profile', error)
        setPendingProfile(nextUser)
        setAuthStatus('pending-profile')
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user || authStatus !== 'ready') {
      return undefined
    }

    const workoutsRef = collection(db, 'workouts')
    const workoutsQuery = query(workoutsRef, where('userId', '==', user.uid))
    return onSnapshot(workoutsQuery, (snapshot) => {
      const next = snapshot.docs
        .map((docSnapshot) => docSnapshot.data() as Workout & { userId?: string })
        .map((data) => ({ date: data.date, muscleGroups: data.muscleGroups ?? [] }))
      setWorkouts(next)
    })
  }, [authStatus, user])

  useEffect(() => {
    if (!user || authStatus !== 'ready') {
      return
    }

    const storedWorkoutBest = profileData?.bestWorkoutStreakWeeks ?? 0
    const storedGoalBest = profileData?.bestGoalStreakWeeks ?? 0
    const nextWorkoutBest = bestWorkoutStreak
    const nextGoalBest = bestGoalStreak

    let allowDecreaseWrite = false
    const previousWeekCounts = previousWeekCountsRef.current
    if (previousWeekCounts) {
      previousWeekCounts.forEach((prevCount, weekKey) => {
        const nextCount = weeklyCountsByWeek.get(weekKey) ?? 0
        if (prevCount > 0 && nextCount === 0) {
          allowDecreaseWrite = true
        }
        if (prevCount >= goalDays && nextCount < goalDays) {
          allowDecreaseWrite = true
        }
      })
    }
    if (previousGoalDaysRef.current !== null && previousGoalDaysRef.current !== goalDays) {
      allowDecreaseWrite = true
    }

    previousWeekCountsRef.current = weeklyCountsByWeek
    previousGoalDaysRef.current = goalDays

    const hasIncrease =
      nextWorkoutBest > storedWorkoutBest || nextGoalBest > storedGoalBest
    const hasDecrease =
      nextWorkoutBest < storedWorkoutBest || nextGoalBest < storedGoalBest

    if (!hasIncrease && !(hasDecrease && allowDecreaseWrite)) {
      return
    }

    void setDoc(
      doc(db, 'users', user.uid),
      {
        bestWorkoutStreakWeeks: nextWorkoutBest,
        bestGoalStreakWeeks: nextGoalBest,
      },
      { merge: true }
    )

    setProfileData((prev) => ({
      ...(prev ?? {}),
      bestWorkoutStreakWeeks: nextWorkoutBest,
      bestGoalStreakWeeks: nextGoalBest,
    }))
  }, [authStatus, bestGoalStreak, bestWorkoutStreak, goalDays, profileData, user, weeklyCountsByWeek])

  const handleGoogleSignIn = async () => {
    await signInWithGoogle(setAuthStatus)
  }

  const handleProfileCreate = async () => {
    if (!pendingProfile) {
      return
    }

    await setDoc(doc(db, 'users', pendingProfile.uid), {
      userId: pendingProfile.uid,
      email: pendingProfile.email ?? '',
      name: pendingProfile.displayName ?? '',
      photoUrl: pendingProfile.photoURL ?? '',
      bestWorkoutStreakWeeks: 0,
      bestGoalStreakWeeks: 0,
      createdAt: serverTimestamp(),
    })
    setProfileData({ bestWorkoutStreakWeeks: 0, bestGoalStreakWeeks: 0 })
    setPendingProfile(null)
    setAuthStatus('ready')
  }

  const handleProfileDecline = async () => {
    await signOut(auth)
  }

  const toggleDayMuscle = (group: string) => {
    if (!user) {
      return
    }

    const existing = workouts.find((workout) => workout.date === selectedDate)
    const updatedMuscles = existing?.muscleGroups.includes(group)
      ? existing.muscleGroups.filter((item) => item !== group)
      : [...(existing?.muscleGroups ?? []), group]

    const docId = `${user.uid}_${selectedDate}`
    const workoutRef = doc(db, 'workouts', docId)

    if (updatedMuscles.length === 0) {
      void deleteDoc(workoutRef)
      return
    }

    void setDoc(
      workoutRef,
      {
        userId: user.uid,
        date: selectedDate,
        muscleGroups: updatedMuscles,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  if (authStatus === 'loading') {
    return (
      <AuthScreen
        variant="loading"
        onSignIn={handleGoogleSignIn}
        onCreateProfile={handleProfileCreate}
        onDeclineProfile={handleProfileDecline}
        effectOptions={hyperspeedOptions}
      />
    )
  }

  if (authStatus === 'signed-out') {
    return (
      <AuthScreen
        variant="signed-out"
        onSignIn={handleGoogleSignIn}
        onCreateProfile={handleProfileCreate}
        onDeclineProfile={handleProfileDecline}
        effectOptions={hyperspeedOptions}
      />
    )
  }

  if (authStatus === 'pending-profile' && pendingProfile) {
    return (
      <AuthScreen
        variant="pending-profile"
        onSignIn={handleGoogleSignIn}
        onCreateProfile={handleProfileCreate}
        onDeclineProfile={handleProfileDecline}
        effectOptions={hyperspeedOptions}
      />
    )
  }

  return (
    <>
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">
            {user?.displayName ? `Hi, ${user.displayName}` : 'Weekly focus'}
          </p>
          <h1 className="brand">
            <img
              className="brand-mark"
              src={`${import.meta.env.BASE_URL}cadax.svg`}
              alt=""
            />
            CADAX
          </h1>
          <p className="subhead">{formatRange(weekStart, addDays(weekStart, 6))}</p>
        </div>
        <StreakCard
          currentWorkoutStreak={currentWorkoutStreak}
          bestWorkoutStreak={bestWorkoutDisplay}
        />
      </header>

      <SelectDayCard
        weekDates={weekDates}
        today={today}
        selectedDate={selectedDate}
        daysWorked={daysWorked}
        workoutDateSet={workoutDateSet}
        formatWeekday={formatWeekday}
        formatLocalIsoDate={formatLocalIsoDate}
        onSelectDate={setSelectedDate}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        canGoNext={weekStart.getTime() < currentWeekStart.getTime()}
      />

      <LogWorkoutCard
        showAllMuscleHighlights={showAllMuscleHighlights}
        selectedDate={selectedDate}
        parseIsoDate={parseIsoDate}
        formatShortDate={formatShortDate}
        onToggleHighlights={() => setShowAllMuscleHighlights((prev) => !prev)}
      >
        <MuscleMap
          weeklyCounts={highlightCounts}
          selectedGroups={showAllMuscleHighlights ? [] : dayMuscles}
          view={muscleView}
          onToggle={toggleDayMuscle}
          onFlip={() =>
            setMuscleView((prev) => (prev === 'front' ? 'back' : 'front'))
          }
        />
      </LogWorkoutCard>

      <WorkoutDetailsCard
        muscleCategories={MUSCLE_CATEGORIES}
        showAllMuscleHighlights={showAllMuscleHighlights}
        selectedDate={selectedDate}
        dayMuscles={dayMuscles}
        weeklyMuscleCounts={weeklyMuscleCounts}
        weeklyWorkedGroups={weeklyWorkedGroups}
        parseIsoDate={parseIsoDate}
        formatShortDate={formatShortDate}
        onToggleHighlights={() => setShowAllMuscleHighlights((prev) => !prev)}
        onToggleDayMuscle={toggleDayMuscle}
      />

      <ThisWeekCard
        daysWorked={daysWorked}
        daysToGo={daysToGo}
        daysOverGoal={daysOverGoal}
        goalDays={goalDays}
        goalBoxCount={goalBoxCount}
        onEditGoal={() => setShowGoalDialog(true)}
      />

      <WorkoutHistoryCard
        historyWeeks={historyWeeks}
        historyMax={historyMax}
        goalDays={goalDays}
        formatShortDate={formatShortDate}
        formatLocalIsoDate={formatLocalIsoDate}
      />
    </div>
    {showGoalDialog ? (
      <div className="dialog-backdrop" role="presentation" onClick={() => setShowGoalDialog(false)}>
        <div
          className="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-dialog-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h3 id="goal-dialog-title">Set weekly target</h3>
          <p className="muted">How many days you want to work out every week?</p>
          <div className="goal-slider">
            <input
              type="range"
              min={1}
              max={7}
              value={goalDays}
              onChange={(event) => setGoalDays(Number(event.target.value))}
            />
            <span className="goal-slider-value">{goalDays} days</span>
          </div>
          <div className="dialog-actions">
            <button type="button" className="ghost" onClick={() => setShowGoalDialog(false)}>
              Save and close
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  )
}
