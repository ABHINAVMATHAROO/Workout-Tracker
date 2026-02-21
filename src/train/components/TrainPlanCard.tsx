import type { GeneratedTrainWorkout, PlanExerciseItem } from '../types'

type TrainPlanCardProps = {
  workout: GeneratedTrainWorkout | null
  activeIndex: number
}

const renderExerciseItem = (
  exercise: PlanExerciseItem,
  index: number,
  activeIndex: number,
  showActive: boolean
) => (
  <article
    key={`${exercise.exercise}-${index}`}
    className={`train-plan-item ${showActive && index === activeIndex ? 'is-active' : ''}`}
  >
    <div className="train-plan-title">
      <h3>
        {index + 1}. {exercise.exercise}
      </h3>
      <span className={`pill ${showActive && index === activeIndex ? 'pill-today' : 'pill-week'}`}>
        {exercise.sets} x {exercise.reps}
      </span>
    </div>
    <p className="muted train-plan-meta">Equipment: {exercise.equipment}</p>
    {exercise.activatedRegion.length > 0 ? (
      <p className="muted train-plan-alt">Activated: {exercise.activatedRegion.join(', ')}</p>
    ) : null}
  </article>
)

export default function TrainPlanCard({ workout, activeIndex }: TrainPlanCardProps) {
  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Workout Plan</h2>
        </div>
        <div className="chip-grid">
          {workout ? (
            <span className="pill pill-done">{workout.plan.mainExercises.length} exercises</span>
          ) : null}
        </div>
      </div>

      {!workout ? (
        <p className="muted">Choose muscle group and intensity, then generate your train plan.</p>
      ) : (
        <>
          <p className="muted train-plan-focus">{workout.plan.focus}</p>
          {workout.plan.source === 'unavailable' ? (
            <p className="muted">Template for this muscle group is not available yet.</p>
          ) : null}

          {workout.plan.regions.length > 0 ? (
            <div className="train-block">
              <p className="label train-label">Regions</p>
              <div className="train-plan-list">
                {workout.plan.regions.map((region) => (
                  <article key={region.area} className="train-plan-item">
                    <div className="train-plan-title">
                      <h3>{region.area}</h3>
                    </div>
                    <p className="muted train-plan-meta">{region.anatomicalName}</p>
                    <p className="muted train-plan-alt">Focus: {region.focus}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {workout.plan.warmup.length > 0 ? (
            <div className="train-block">
              <p className="label train-label">Warmup</p>
              <ul className="train-list">
                {workout.plan.warmup.map((item) => (
                  <li key={item} className="muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="train-block">
            <p className="label train-label">Main exercises</p>
            <div className="train-plan-list">
              {workout.plan.mainExercises.map((exercise, index) =>
                renderExerciseItem(exercise, index, activeIndex, true)
              )}
            </div>
          </div>

          {workout.plan.alternatives.length > 0 ? (
            <div className="train-block">
              <p className="label train-label">Alternatives</p>
              <div className="train-plan-list">
                {workout.plan.alternatives.map((exercise, index) =>
                  renderExerciseItem(exercise, index, activeIndex, false)
                )}
              </div>
            </div>
          ) : null}

          {workout.plan.postWorkoutStretch.length > 0 ? (
            <div className="train-block">
              <p className="label train-label">Post-workout stretch</p>
              <ul className="train-list">
                {workout.plan.postWorkoutStretch.map((item) => (
                  <li key={item} className="muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
