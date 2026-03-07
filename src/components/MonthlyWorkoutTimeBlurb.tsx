type MonthlyWorkoutTimeBlurbProps = {
  monthLabel: string
  percentLabel: string
}

export default function MonthlyWorkoutTimeBlurb({
  monthLabel,
  percentLabel,
}: MonthlyWorkoutTimeBlurbProps) {
  return (
    <section className="monthly-workout-blurb" aria-live="polite">
      <p>
        You spent <span className="monthly-workout-percent">{percentLabel}</span> of time
        working out in <span className="monthly-workout-month">{monthLabel}</span>.
      </p>
    </section>
  )
}
