import { useEffect, useMemo, useState } from 'react'
import TinyMuscleThumb from './TinyMuscleThumb'
import type { GeneratedTrainWorkout, PlanExerciseItem } from '../types'

type TrainPlanCardProps = {
  workout: GeneratedTrainWorkout | null
  activeIndex: number
}

const renderExerciseItem = (
  muscleGroup: string,
  exercise: PlanExerciseItem,
  index: number,
  activeIndex: number,
  showActive: boolean
) => (
  <article
    key={`${exercise.exercise}-${index}`}
    className={`train-plan-item ${showActive && index === activeIndex ? 'is-active' : ''}`}
  >
    <div className="train-plan-layout">
      <TinyMuscleThumb muscleGroup={muscleGroup} targetAreas={exercise.activatedRegion} />
      <div className="train-plan-content">
        <div className="train-plan-title">
          <h3>
            {index + 1}. {exercise.exercise}
          </h3>
          <span className={`pill ${showActive && index === activeIndex ? 'pill-today' : 'pill-week'}`}>
            {exercise.sets} x {exercise.reps}
          </span>
        </div>
        <p className="muted train-plan-meta">
          <span className="equipment-icon" aria-hidden="true" />
          {exercise.equipment}
        </p>
        {exercise.activatedRegion.length > 0 ? (
          <p className="muted train-plan-alt">{exercise.activatedRegion.join(' - ')}</p>
        ) : null}
      </div>
    </div>
  </article>
)

export default function TrainPlanCard({ workout, activeIndex }: TrainPlanCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false)

  useEffect(() => {
    setShowAlternatives(false)
  }, [workout?.muscleGroup, workout?.intensity])

  const regionLabels = useMemo(() => {
    if (!workout) return []
    return workout.plan.regions.map((region) => {
      const raw = region.area.toLowerCase()
      if (raw.includes('upper')) return 'Upper'
      if (raw.includes('mid')) return 'Mid'
      if (raw.includes('inner')) return 'Inner'
      if (raw.includes('outer')) return 'Outer'
      if (raw.includes('lower')) return 'Lower'
      return region.area.split('/')[0]?.split(' ')[0] ?? region.area
    })
  }, [workout])

  return (
    <section className="card">
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap">Workout Plan</h2>
        </div>
        <div className="chip-grid">
          {workout ? <span className="pill pill-done">{workout.plan.mainExercises.length} exercises</span> : null}
        </div>
      </div>

      {!workout ? (
        <p className="muted">Choose muscle group and intensity, then generate your train plan.</p>
      ) : workout.plan.source === 'unavailable' ? (
        <p className="muted">Sorry, we are working on it.</p>
      ) : (
        <>
          <div className="train-hero">
            <TinyMuscleThumb muscleGroup={workout.muscleGroup} targetAreas={regionLabels} size="lg" />
            <div className="train-hero-copy">
              <p className="muted train-plan-focus">{workout.plan.focus}</p>
              {regionLabels.length > 0 ? (
                <div className="train-region-chips">
                  {regionLabels.map((label) => (
                    <span key={label} className="pill pill-week">
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {workout.plan.warmup.length > 0 ? (
            <div className="train-block">
              <p className="label train-label">Warm-up</p>
              <div className="train-pill-row">
                {workout.plan.warmup.map((item) => (
                  <span key={item} className="pill pill-week train-pill-compact">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="train-block">
            <p className="label train-label">Main</p>
            <div className="train-plan-list">
              {workout.plan.mainExercises.map((exercise, index) =>
                renderExerciseItem(workout.muscleGroup, exercise, index, activeIndex, true)
              )}
            </div>
          </div>

          {workout.plan.alternatives.length > 0 ? (
            <div className="train-block">
              <button
                type="button"
                className="train-collapse-btn"
                onClick={() => setShowAlternatives((prev) => !prev)}
                aria-expanded={showAlternatives}
              >
                {showAlternatives
                  ? 'Hide alternatives'
                  : `Show alternatives (${workout.plan.alternatives.length})`}
              </button>
              {showAlternatives ? (
                <div className="train-plan-list train-alt-list">
                  {workout.plan.alternatives.map((exercise, index) =>
                    renderExerciseItem(workout.muscleGroup, exercise, index, activeIndex, false)
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {workout.plan.postWorkoutStretch.length > 0 ? (
            <div className="train-block">
              <p className="label train-label">Stretch</p>
              <div className="train-pill-row">
                {workout.plan.postWorkoutStretch.map((item) => (
                  <span key={item} className="pill pill-week train-pill-compact">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
