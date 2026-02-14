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
  goalBoxCount,
  onEditGoal,
}: ThisWeekCardProps) {
  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">This week</h2>
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
      <div className="goal-visual">
        <div className="goal-circles">
          {Array.from({ length: goalBoxCount }, (_, index) => {
            const filled = index < daysWorked
            const extra = filled && index >= goalDays
            const target = goalDays > 0 && index === goalDays - 1
            return (
              <span
                key={`goal-${index}`}
                className={`goal-circle ${filled ? 'filled' : ''} ${extra ? 'extra' : ''} ${target ? 'is-target' : ''}`}
              >
                {target ? (
                  <img
                    className={`goal-target ${daysWorked >= goalDays ? 'met' : ''}`}
                    src={`${import.meta.env.BASE_URL}target.svg`}
                    alt="Goal"
                  />
                ) : null}
              </span>
            )
          })}
          <button type="button" className="goal-edit" onClick={onEditGoal}>
            Set target
          </button>
        </div>
      </div>
    </section>
  )
}
