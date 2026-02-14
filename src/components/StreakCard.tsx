type StreakCardProps = {
  currentWorkoutStreak: number
  bestWorkoutStreak: number
}

export default function StreakCard({ currentWorkoutStreak, bestWorkoutStreak }: StreakCardProps) {
  return (
    <div className="hero-card streak-card">
      <p className="label">Streak</p>
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
          <span className="streak-best-value">{bestWorkoutStreak}</span>
        </div>
      </div>
    </div>
  )
}
