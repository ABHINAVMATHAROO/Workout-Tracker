type ThisWeekCardProps = {
  daysWorked: number
  daysToGo: number
  daysOverGoal: number
  goalDays: number
  goalBoxCount: number
  onEditGoal: () => void
}

export default function ThisWeekCard({
  daysWorked,
  daysToGo,
  daysOverGoal,
  goalDays,
  onEditGoal,
}: ThisWeekCardProps) {
  const progressRaw = goalDays > 0 ? daysWorked / goalDays : 0
  const progress = Math.max(0, Math.min(progressRaw, 1))
  const percent = goalDays > 0 ? Math.round(progressRaw * 100) : 0
  const gaugeCircumference = Math.PI * 45
  const gaugeOffset = gaugeCircumference * (1 - progress)
  const isGoalMet = progressRaw >= 1
  const hasProgress = progress > 0
  const capAngle = Math.PI * (1 - progress)
  const capX = 60 + 45 * Math.cos(capAngle)
  const capY = 60 - 45 * Math.sin(capAngle)

  return (
    <section className="card progress-card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Progress</h2>
        </div>
        <div className="chip-grid">
          <span className="pill pill-done">{daysWorked} done</span>
          {daysOverGoal > 0 ? (
            <span className="pill pill-over">{daysOverGoal} over</span>
          ) : (
            <span className="pill pill-remaining">{daysToGo} left</span>
          )}
        </div>
      </div>

      <div className="progress-gauge-wrap">
        <svg className="progress-gauge" viewBox="0 0 120 72" aria-hidden="true">
          <defs>
            <linearGradient id="progress-gauge-track-gradient" x1="15" y1="60" x2="105" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(148, 162, 193, 0.22)" />
              <stop offset="100%" stopColor="rgba(148, 162, 193, 0.34)" />
            </linearGradient>
            <linearGradient id="progress-gauge-fill-green" x1="15" y1="60" x2="105" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(174, 234, 0, 0.86)" />
              <stop offset="100%" stopColor="rgba(174, 234, 0, 1)" />
            </linearGradient>
            <linearGradient id="progress-gauge-fill-orange" x1="15" y1="60" x2="105" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 179, 0, 0.86)" />
              <stop offset="100%" stopColor="rgba(255, 179, 0, 1)" />
            </linearGradient>
          </defs>

          <path className="progress-gauge-track" d="M 15 60 A 45 45 0 0 1 105 60" />
          <path className="progress-gauge-track-gloss" d="M 15 60 A 45 45 0 0 1 105 60" />
          {hasProgress ? (
            <path
              className={`progress-gauge-fill ${isGoalMet ? 'goal-met' : ''}`}
              d="M 15 60 A 45 45 0 0 1 105 60"
              pathLength={gaugeCircumference}
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={gaugeOffset}
            />
          ) : null}
          <circle className={`progress-gauge-cap-halo ${isGoalMet ? 'goal-met' : ''}`} cx={capX} cy={capY} r="7.8" />
          <circle className={`progress-gauge-cap ${isGoalMet ? 'goal-met' : ''}`} cx={capX} cy={capY} r="5" />
        </svg>

        <div className="progress-gauge-content">
          <p className="progress-gauge-percent">{percent}%</p>
          <p className="progress-gauge-label">Target met</p>
          <button type="button" className="progress-target-btn" onClick={onEditGoal}>
            Set target
          </button>
        </div>
      </div>
    </section>
  )
}
