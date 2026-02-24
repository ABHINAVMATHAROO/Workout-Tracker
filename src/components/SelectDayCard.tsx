import { useMemo, useRef, useState } from 'react'

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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [monthTitleDateIso, setMonthTitleDateIso] = useState<string | null>(null)
  const dragStartY = useRef<number | null>(null)
  const monthScrollLockUntil = useRef(0)
  const monthSwipeStartY = useRef<number | null>(null)
  const monthSwipePointerId = useRef<number | null>(null)
  const monthSwipeRawDeltaY = useRef(0)
  const [monthDragOffsetY, setMonthDragOffsetY] = useState(0)
  const [isMonthDragging, setIsMonthDragging] = useState(false)

  const todayIso = formatLocalIsoDate(today)
  const currentMonthStart = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today])
  const getWeekdayLabel = (date: Date) => formatWeekday(date).charAt(0).toUpperCase()

  const monthDates = useMemo(() => {
    const monthStart = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1)
    const monthStartWeekStart = new Date(monthStart)
    monthStartWeekStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7))

    return Array.from({ length: 35 }, (_, idx) => {
      const date = new Date(monthStartWeekStart)
      date.setDate(monthStartWeekStart.getDate() + idx)
      return date
    })
  }, [displayedMonth])

  const selectedDateLabel = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number)
    if ([year, month, day].some((value) => Number.isNaN(value))) {
      return 'Select Day'
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
    }).format(new Date(year, month - 1, day))
  }, [selectedDate])

  const selectedDateYear = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number)
    if ([year, month, day].some((value) => Number.isNaN(value))) {
      return ''
    }
    return String(year)
  }, [selectedDate])

  const displayedMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
      }).format(displayedMonth),
    [displayedMonth]
  )

  const displayedMonthYear = useMemo(() => String(displayedMonth.getFullYear()), [displayedMonth])

  const monthWorkouts = useMemo(() => {
    let count = 0
    workoutDateSet.forEach((iso) => {
      const [year, month] = iso.split('-').map(Number)
      if (year === displayedMonth.getFullYear() && month === displayedMonth.getMonth() + 1) {
        count += 1
      }
    })
    return count
  }, [displayedMonth, workoutDateSet])

  const openMonthView = () => {
    const [year, month] = selectedDate.split('-').map(Number)
    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      setDisplayedMonth(new Date(year, month - 1, 1))
    } else {
      setDisplayedMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }
    setMonthTitleDateIso(null)
    setViewMode('month')
  }

  const openWeekView = () => {
    onSelectDate(todayIso)
    setViewMode('week')
  }

  const shiftDisplayedMonth = (direction: 'prev' | 'next') => {
    setDisplayedMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + (direction === 'prev' ? -1 : 1), 1)
      if (next.getTime() > currentMonthStart.getTime()) {
        return prev
      }
      return next
    })
    setMonthTitleDateIso(null)
  }

  const handleBarPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY
  }

  const handleBarPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartY.current === null) {
      return
    }
    const deltaY = event.clientY - dragStartY.current
    dragStartY.current = null

    if (deltaY > 24) {
      openMonthView()
      return
    }

    if (deltaY < -24) {
      openWeekView()
      return
    }

    if (viewMode === 'week') {
      openMonthView()
    } else {
      openWeekView()
    }
  }

  const handleMonthWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 12) return
    const now = Date.now()
    if (now < monthScrollLockUntil.current) {
      event.preventDefault()
      return
    }

    monthScrollLockUntil.current = now + 320
    if (event.deltaY < 0) {
      shiftDisplayedMonth('prev')
    } else {
      shiftDisplayedMonth('next')
    }
    event.preventDefault()
  }

  const handleMonthPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    monthSwipePointerId.current = event.pointerId
    monthSwipeStartY.current = event.clientY
    monthSwipeRawDeltaY.current = 0
    setMonthDragOffsetY(0)
    setIsMonthDragging(true)
  }

  const handleMonthPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (monthSwipePointerId.current !== event.pointerId || monthSwipeStartY.current === null) return

    const rawDeltaY = event.clientY - monthSwipeStartY.current
    monthSwipeRawDeltaY.current = rawDeltaY
    const elasticOffset = Math.tanh(rawDeltaY / 80) * 42
    setMonthDragOffsetY(elasticOffset)
  }

  const handleMonthPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (monthSwipePointerId.current !== event.pointerId || monthSwipeStartY.current === null) return
    const deltaY = monthSwipeRawDeltaY.current
    monthSwipePointerId.current = null
    monthSwipeStartY.current = null
    monthSwipeRawDeltaY.current = 0
    setIsMonthDragging(false)
    setMonthDragOffsetY(0)
    const threshold = 28
    if (deltaY <= -threshold) {
      shiftDisplayedMonth('prev')
      return
    }
    if (deltaY >= threshold) {
      shiftDisplayedMonth('next')
    }
  }

  return (
    <section className="card week-card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          {viewMode === 'month' ? (
            <h2 className="section-title-nowrap section-title-with-year">
              {monthTitleDateIso ? selectedDateLabel : displayedMonthLabel}
              <span className="label section-title-year">
                {monthTitleDateIso ? selectedDateYear : displayedMonthYear}
              </span>
            </h2>
          ) : (
            <h2 className="section-title-nowrap">{selectedDateLabel}</h2>
          )}
        </div>
        {viewMode === 'week' ? (
          <div className="chip-grid">
            <span className="pill pill-week">
              {daysWorked} {daysWorked === 1 ? 'workout' : 'workouts'} this week
            </span>
          </div>
        ) : (
          <div className="chip-grid">
            <span className="pill pill-week">
              {monthWorkouts} {monthWorkouts === 1 ? 'workout' : 'workouts'} this month
            </span>
          </div>
        )}
      </div>

      {viewMode === 'week' ? (
        <div className="week-grid-wrap">
          <div className="week-grid month-weekdays">
            {weekDates.map((date) => {
              const iso = formatLocalIsoDate(date)
              return (
                <span key={`${iso}-weekday`} className="day-name">
                  {getWeekdayLabel(date)}
                </span>
              )
            })}
          </div>
          <div className="week-grid week-circles-grid">
            {weekDates.map((date) => {
              const iso = formatLocalIsoDate(date)
              const hasWorkout = workoutDateSet.has(iso)
              const isToday = iso === todayIso
              const isSelected = iso === selectedDate
              const isFuture = date.getTime() > today.getTime()
              const isPast = date.getTime() < today.getTime()
              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    'month-day-circle',
                    'week-day-circle',
                    hasWorkout ? 'has-workout' : '',
                    isToday ? 'today' : '',
                    isSelected ? 'selected' : '',
                    isPast ? 'past' : '',
                  ].join(' ')}
                  onClick={() => onSelectDate(iso)}
                  disabled={isFuture}
                >
                  <span className="month-day-label">{date.getDate()}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div
          className={`month-grid-wrap ${isMonthDragging ? 'is-dragging' : ''}`}
          style={{ ['--month-drag-offset' as string]: `${monthDragOffsetY}px` }}
          onWheel={handleMonthWheel}
          onPointerDown={handleMonthPointerDown}
          onPointerMove={handleMonthPointerMove}
          onPointerUp={handleMonthPointerUp}
          onPointerCancel={() => {
            monthSwipePointerId.current = null
            monthSwipeStartY.current = null
            monthSwipeRawDeltaY.current = 0
            setIsMonthDragging(false)
            setMonthDragOffsetY(0)
          }}
        >
          <div className="week-grid month-weekdays">
            {Array.from({ length: 7 }, (_, idx) => (
              <span key={idx} className="day-name">
                {getWeekdayLabel(monthDates[idx])}
              </span>
            ))}
          </div>
          <div className="month-grid">
            {monthDates.map((date) => {
              const iso = formatLocalIsoDate(date)
              const hasWorkout = workoutDateSet.has(iso)
              const isToday = iso === todayIso
              const isSelected = iso === selectedDate
              const isFuture = date.getTime() > today.getTime()
              const inDisplayedMonth = date.getMonth() === displayedMonth.getMonth()
              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    'month-day-circle',
                    hasWorkout ? 'has-workout' : '',
                    isToday ? 'today' : '',
                    isSelected ? 'selected' : '',
                    inDisplayedMonth ? '' : 'outside',
                  ].join(' ')}
                  onClick={() => {
                    onSelectDate(iso)
                    if (inDisplayedMonth) {
                      setMonthTitleDateIso(iso)
                    }
                  }}
                  disabled={isFuture}
                >
                  <span className="month-day-label">{date.getDate()}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        className={`calendar-handle ${viewMode === 'month' ? 'is-open' : ''}`}
        aria-label={viewMode === 'month' ? 'Show week view' : 'Show month view'}
        onPointerDown={handleBarPointerDown}
        onPointerUp={handleBarPointerUp}
        onPointerCancel={() => {
          dragStartY.current = null
        }}
      >
        <span className="calendar-handle-bar" />
      </button>
    </section>
  )
}
