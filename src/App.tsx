import { useEffect, useMemo, useState } from 'react'
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

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Triceps',
  'Biceps',
  'Shoulder',
  'Forearms',
  'Legs',
  'Core',
]

type Workout = {
  date: string
  muscleGroups: string[]
}

type MuscleCounts = Map<string, number>

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10)

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

const getCount = (counts: MuscleCounts, group: string) => counts.get(group) ?? 0

type MuscleMapProps = {
  weeklyCounts: MuscleCounts
  selectedGroups: string[]
  view: 'front' | 'back'
  onToggle: (group: string) => void
}

function MuscleMap({ weeklyCounts, selectedGroups, view, onToggle }: MuscleMapProps) {
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
    />
  )
}

type AuthStatus = 'signed-out' | 'loading' | 'pending-profile' | 'ready'

type ProfileData = {
  bestWorkoutStreakWeeks?: number
  bestGoalStreakWeeks?: number
}

export default function App() {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const [goalDays] = useState(4)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [pendingProfile, setPendingProfile] = useState<User | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [showAllMuscleHighlights, setShowAllMuscleHighlights] = useState(false)
  const [muscleView, setMuscleView] = useState<'front' | 'back'>('front')
  const weekStart = useMemo(() => startOfWeekMonday(today), [today])
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx)),
    [weekStart]
  )

  const workoutsThisWeek = useMemo(() => {
    const startIso = formatIsoDate(weekStart)
    const endIso = formatIsoDate(addDays(weekStart, 6))
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
  const progress = Math.min(100, Math.round((daysWorked / goalDays) * 100))
  const { currentWorkoutStreak, currentGoalStreak, bestWorkoutStreak, bestGoalStreak } =
    useMemo(() => calculateStreaks(workouts, goalDays, today), [workouts, goalDays, today])
  const bestWorkoutDisplay = Math.max(
    bestWorkoutStreak,
    profileData?.bestWorkoutStreakWeeks ?? 0
  )
  const bestGoalDisplay = Math.max(
    bestGoalStreak,
    profileData?.bestGoalStreakWeeks ?? 0
  )

  const [selectedDate, setSelectedDate] = useState(() => formatIsoDate(today))
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
    if (!showAllMuscleHighlights) return weeklyMuscleCounts
    const all = new Map<string, number>()
    MUSCLE_GROUPS.forEach((group) => all.set(group, 1))
    return all
  }, [showAllMuscleHighlights, weeklyMuscleCounts])

  const dayWorkout = workouts.find((workout) => workout.date === selectedDate)
  const dayMuscles = dayWorkout?.muscleGroups ?? []

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
    const nextWorkoutBest = Math.max(storedWorkoutBest, bestWorkoutStreak)
    const nextGoalBest = Math.max(storedGoalBest, bestGoalStreak)

    if (
      nextWorkoutBest === storedWorkoutBest &&
      nextGoalBest === storedGoalBest
    ) {
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
  }, [authStatus, bestGoalStreak, bestWorkoutStreak, profileData, user])

  const handleGoogleSignIn = async () => {
    setAuthStatus('loading')
    await signInWithPopup(auth, googleProvider)
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
      <div className="app auth-screen">
        <div className="card auth-card">
          <h1>Workout Tracker</h1>
          <p className="muted">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (authStatus === 'signed-out') {
    return (
      <div className="app auth-screen">
        <div className="card auth-card">
          <p className="eyebrow">Welcome back</p>
          <h1>Workout Tracker</h1>
          <p className="muted">Sign in to track your workouts across devices.</p>
          <button className="cta" onClick={handleGoogleSignIn}>
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  if (authStatus === 'pending-profile' && pendingProfile) {
    return (
      <div className="app auth-screen">
        <div className="card auth-card">
          <p className="eyebrow">Almost there</p>
          <h1>Create your account?</h1>
          <p className="muted">
            We found your Google account but not an app profile yet. Want to create
            one now?
          </p>
          <div className="auth-actions">
            <button className="cta" onClick={handleProfileCreate}>
              Create account
            </button>
            <button className="ghost" onClick={handleProfileDecline}>
              Not now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">
            {user?.displayName ? `Hi ${user.displayName}` : 'Weekly focus'}
          </p>
          <h1>Workout Tracker</h1>
          <p className="subhead">{formatRange(weekStart, addDays(weekStart, 6))}</p>
        </div>
        <div className="hero-card streak-card">
          <p className="label">Streaks</p>
          <div className="streak-split">
            <div className="streak-current">
              <div className="streak-number">{currentWorkoutStreak}</div>
              <div className="streak-copy">
                <span className="streak-title">Current</span>
                <span className="streak-subtitle">Workout weeks</span>
              </div>
            </div>
            <div className="streak-divider" />
            <div className="streak-best">
              <span className="streak-best-label">Best</span>
              <span className="streak-best-value">{bestWorkoutDisplay}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="card week-card">
        <div className="week-top">
          <div>
            <h2>This week</h2>
            <p className="muted">
              {daysWorked} workouts logged - {daysToGo === 0 ? 'Goal met' : `${daysToGo} to go`}
            </p>
          </div>
          <div className="progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="week-grid">
          {weekDates.map((date) => {
            const iso = formatIsoDate(date)
            const hasWorkout = workoutDateSet.has(iso)
            const isToday = iso === formatIsoDate(today)
            const isSelected = iso === selectedDate
            const isFuture = date.getTime() > today.getTime()
            return (
              <button
                key={iso}
                type="button"
                className={`day-pill ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(iso)}
                disabled={isFuture}
              >
                <span className="day-name">{formatWeekday(date)}</span>
                <span className="day-date">{date.getDate()}</span>
                <span
                  className={`dot ${isToday ? 'today' : ''} ${hasWorkout ? 'active' : ''}`}
                />
              </button>
            )
          })}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>Muscle map</h2>
            <p className="muted">Tap a region to toggle it for the selected day.</p>
          </div>
          <div className="chip-grid">
            <span className="pill pill-today">Today</span>
            <span className="pill pill-week">Week</span>
          </div>
        </div>
        <MuscleMap
          weeklyCounts={highlightCounts}
          selectedGroups={dayMuscles}
          view={muscleView}
          onToggle={toggleDayMuscle}
        />
        <div className="muscle-toggle">
          <button
            type="button"
            className={`chip ${muscleView === 'front' ? 'selected' : ''}`}
            onClick={() => setMuscleView('front')}
          >
            Front
          </button>
          <button
            type="button"
            className={`chip ${muscleView === 'back' ? 'selected' : ''}`}
            onClick={() => setMuscleView('back')}
          >
            Back
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>Day details</h2>
            <p className="muted">
              {selectedDate} - Tap to edit the muscle groups you trained.
            </p>
          </div>
          <span className="pill">{dayMuscles.length} groups</span>
        </div>

        <div className="chip-grid">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              className={`chip ${dayMuscles.includes(group) ? 'selected' : ''}`}
              onClick={() => toggleDayMuscle(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
