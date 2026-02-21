import { INTENSITIES, MUSCLE_GROUPS, type Intensity, type MuscleGroup } from '../types'

type TrainInputCardProps = {
  muscleGroup: MuscleGroup
  intensity: Intensity
  onSelectMuscleGroup: (group: MuscleGroup) => void
  onSelectIntensity: (intensity: Intensity) => void
  onGenerate: () => void
}

export default function TrainInputCard({
  muscleGroup,
  intensity,
  onSelectMuscleGroup,
  onSelectIntensity,
  onGenerate,
}: TrainInputCardProps) {
  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Train Setup</h2>
        </div>
        <div className="chip-grid">
          <span className="pill pill-week">Rules-first plan</span>
        </div>
      </div>

      <div className="train-input-grid">
        <div>
          <p className="label train-label">Muscle group</p>
          <div className="chip-grid">
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                className={`chip ${muscleGroup === group ? 'selected' : ''}`}
                onClick={() => onSelectMuscleGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label train-label">Intensity</p>
          <div className="chip-grid">
            {INTENSITIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${intensity === item ? 'selected' : ''}`}
                onClick={() => onSelectIntensity(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="train-actions">
        <button type="button" className="cta cta-orange" onClick={onGenerate}>
          Generate workout
        </button>
      </div>
    </section>
  )
}
