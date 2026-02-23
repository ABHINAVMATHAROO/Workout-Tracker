import type { CoachMode, CoachRuntimeState } from '../types'

type TrainCoachCardProps = {
  mode: CoachMode
  runtimeState: CoachRuntimeState
  canTriggerFreeform: boolean
  onSelectMode: (mode: CoachMode) => void
  onStartCoach: () => void
  onPauseCoach: () => void
  onResumeCoach: () => void
  onStopCoach: () => void
  onTriggerFreeform: () => void
  status: string
}

export default function TrainCoachCard({
  mode,
  runtimeState,
  canTriggerFreeform,
  onSelectMode,
  onStartCoach,
  onPauseCoach,
  onResumeCoach,
  onStopCoach,
  onTriggerFreeform,
  status,
}: TrainCoachCardProps) {
  const canStart = runtimeState === 'idle' || runtimeState === 'error'
  const canPause = runtimeState === 'running'
  const canResume = runtimeState === 'paused'
  const canStop = runtimeState !== 'idle'

  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Encouragement Coach</h2>
        </div>
      </div>

      <p className="muted">{status}</p>

      <div className="train-coach-mode-toggle" role="group" aria-label="Coach mode">
        <button
          type="button"
          className={`train-coach-mode-btn ${mode === 'encourage' ? 'is-active' : ''}`}
          onClick={() => onSelectMode('encourage')}
        >
          Encourage
        </button>
        <button
          type="button"
          className={`train-coach-mode-btn ${mode === 'roast' ? 'is-active roast' : ''}`}
          onClick={() => onSelectMode('roast')}
        >
          Roast
        </button>
      </div>

      <div className="train-actions">
        <button type="button" className="cta cta-orange" onClick={onStartCoach} disabled={!canStart}>
          Start Coach
        </button>
        <button type="button" className="ghost" onClick={onPauseCoach} disabled={!canPause}>
          Pause
        </button>
        <button type="button" className="ghost" onClick={onResumeCoach} disabled={!canResume}>
          Resume
        </button>
        <button type="button" className="ghost" onClick={onStopCoach} disabled={!canStop}>
          Stop
        </button>
        <button type="button" className="ghost" onClick={onTriggerFreeform} disabled={!canTriggerFreeform}>
          Freeform Prompt
        </button>
      </div>
    </section>
  )
}
