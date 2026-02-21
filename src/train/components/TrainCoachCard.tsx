type TrainCoachCardProps = {
  canStart: boolean
  canAdvance: boolean
  onStartCoach: () => void
  onNextPrompt: () => void
  onStopCoach: () => void
  status: string
}

export default function TrainCoachCard({
  canStart,
  canAdvance,
  onStartCoach,
  onNextPrompt,
  onStopCoach,
  status,
}: TrainCoachCardProps) {
  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Encouragement Coach</h2>
        </div>
      </div>

      <p className="muted">{status}</p>

      <div className="train-actions">
        <button type="button" className="cta cta-orange" onClick={onStartCoach} disabled={!canStart}>
          Start Coach
        </button>
        <button type="button" className="ghost" onClick={onNextPrompt} disabled={!canAdvance}>
          Next prompt
        </button>
        <button type="button" className="ghost" onClick={onStopCoach}>
          Stop
        </button>
      </div>
    </section>
  )
}
