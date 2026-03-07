import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GeneratedTrainWorkout, LoadType, LoadUnit, PlanExerciseItem, RepsPreset } from '../types'

type TrainPlanCardProps = {
  workout: GeneratedTrainWorkout | null
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  alternativeOptions: PlanExerciseItem[]
  warmupOptions: string[]
  stretchOptions: string[]
  onActiveExerciseChange?: (activatedRegion: string[] | null) => void
  onChangeSet: (
    exerciseIndex: number,
    setIndex: number,
    patch: { repsPreset?: RepsPreset; load?: number; loadUnit?: LoadUnit }
  ) => void
  onAddSet: (exerciseIndex: number) => void
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void
  onRemoveExercise: (exerciseIndex: number) => void
  onReplaceExercise: (exerciseIndex: number, exercise: PlanExerciseItem) => void
}

const REPS_OPTIONS: RepsPreset[] = ['5', '6-8', '8-10', '10-12', '12-15', '15-20', 'Max']
const TOUCH_LONG_PRESS_MS = 420
const TOUCH_CLICK_SUPPRESS_MS = 700

const buildLoadOptions = (unit: LoadUnit, loadType: LoadType) => {
  const max = unit === 'lb'
    ? loadType === 'bodyweight'
      ? 120
      : loadType === 'dumbbell'
        ? 120
        : 300
    : loadType === 'bodyweight'
      ? 55
      : loadType === 'dumbbell'
        ? 55
        : 140
  const step = unit === 'lb' ? 5 : 2.5
  const values: number[] = [0]
  for (let value = step; value <= max; value += step) {
    values.push(Number(value.toFixed(1)))
  }
  return values
}

const loadLabel = (load: number, unit: LoadUnit, loadType: LoadType) => {
  if (loadType === 'bodyweight' && load <= 0) return 'Bodyweight'
  if (loadType === 'bodyweight') return `Bodyweight + ${load} ${unit}`
  if (loadType === 'dumbbell') return `${load} ${unit} each`
  return `${load} ${unit}`
}

const summaryLoadLabel = (load: number, unit: LoadUnit, loadType: LoadType) => {
  if (loadType === 'bodyweight' && load <= 0) return 'Bodyweight'
  if (loadType === 'bodyweight') return `Bodyweight + ${load} ${unit}`
  return `${load} ${unit}`
}

const normalizeLabel = (value: string) => value.trim().toLowerCase()
const resolveActivatedRegions = (exercise: PlanExerciseItem | undefined): string[] | null => {
  if (!exercise) return null
  const explicit = (exercise.activatedRegion ?? []).map((value) => value.trim()).filter(Boolean)
  if (explicit.length > 0) return explicit
  if (exercise.exercise.toLowerCase().includes('calf')) return ['Calves']
  return null
}

export default function TrainPlanCard({
  workout,
  saveState,
  alternativeOptions,
  warmupOptions,
  stretchOptions,
  onActiveExerciseChange,
  onChangeSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onReplaceExercise,
}: TrainPlanCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(null)
  const [highlightedExerciseIndex, setHighlightedExerciseIndex] = useState<number | null>(null)
  const [expandedAuxSection, setExpandedAuxSection] = useState<'warmup' | 'stretch' | null>(null)
  const [removeExerciseIndex, setRemoveExerciseIndex] = useState<number | null>(null)
  const touchTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)
  const suppressNextClickRef = useRef(false)
  const lastTouchInteractionAtRef = useRef(0)

  const clearTouchTimer = () => {
    if (touchTimerRef.current !== null) {
      window.clearTimeout(touchTimerRef.current)
      touchTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => clearTouchTimer()
  }, [])

  useEffect(() => {
    setShowAlternatives(false)
    setExpandedExerciseIndex(null)
    setHighlightedExerciseIndex(null)
    setExpandedAuxSection(null)
    setRemoveExerciseIndex(null)
    onActiveExerciseChange?.(null)
  }, [workout?.muscleGroup, workout?.intensity])

  useEffect(() => {
    const activeExerciseIndex = expandedExerciseIndex ?? highlightedExerciseIndex
    if (!workout || activeExerciseIndex === null) {
      onActiveExerciseChange?.(null)
      return
    }
    const exercise = workout.plan.mainExercises[activeExerciseIndex]
    onActiveExerciseChange?.(resolveActivatedRegions(exercise))
  }, [onActiveExerciseChange, expandedExerciseIndex, highlightedExerciseIndex, workout])

  const handleExerciseToggle = (exerciseIndex: number) => {
    const isExpanded = expandedExerciseIndex === exerciseIndex
    setExpandedExerciseIndex(isExpanded ? null : exerciseIndex)
    if (!isExpanded) setHighlightedExerciseIndex(exerciseIndex)
  }

  const openExerciseEditor = (exerciseIndex: number) => {
    setExpandedExerciseIndex(exerciseIndex)
    setHighlightedExerciseIndex(exerciseIndex)
  }

  const handleExerciseTouchStart = (exerciseIndex: number) => {
    lastTouchInteractionAtRef.current = Date.now()
    clearTouchTimer()
    longPressTriggeredRef.current = false
    touchTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      suppressNextClickRef.current = true
      openExerciseEditor(exerciseIndex)
    }, TOUCH_LONG_PRESS_MS)
  }

  const handleExerciseTouchEnd = (exerciseIndex: number) => {
    lastTouchInteractionAtRef.current = Date.now()
    const wasLongPress = longPressTriggeredRef.current
    clearTouchTimer()
    longPressTriggeredRef.current = false
    suppressNextClickRef.current = true
    if (!wasLongPress) {
      if (expandedExerciseIndex === exerciseIndex) {
        setExpandedExerciseIndex(null)
        setHighlightedExerciseIndex(null)
        return
      }
      setHighlightedExerciseIndex(exerciseIndex)
    }
  }

  const saveLabel =
    saveState === 'saving'
      ? 'Saving...'
      : saveState === 'saved'
        ? 'Saved'
        : saveState === 'error'
          ? 'Save failed'
          : null

  return (
    <section className="card">
      {saveLabel ? (
        <div className="chip-grid train-plan-actions">
          <span className="pill pill-week">{saveLabel}</span>
          {workout ? <span className="pill pill-done">{workout.plan.mainExercises.length} exercises</span> : null}
        </div>
      ) : null}

      {!workout ? (
        <p className="muted">Choose muscle group and intensity, then generate your train plan.</p>
      ) : workout.plan.source === 'unavailable' ? (
        <p className="muted">Sorry, we are working on it.</p>
      ) : (
        <>
          {warmupOptions.length > 0 ? (
            <div className="train-block">
              <article className={`train-plan-item train-accordion-item train-aux-accordion-item ${expandedAuxSection === 'warmup' ? 'is-expanded' : ''}`}>
                <button
                  type="button"
                  className="train-accordion-head train-aux-accordion-head"
                  onClick={() => setExpandedAuxSection((prev) => (prev === 'warmup' ? null : 'warmup'))}
                  aria-expanded={expandedAuxSection === 'warmup'}
                >
                  <span className="train-accordion-title">Warm-up</span>
                  <span className="train-accordion-summary">{warmupOptions.length} exercises</span>
                </button>
                {expandedAuxSection === 'warmup' ? (
                  <div className="train-accordion-body train-aux-accordion-body">
                    <div className="train-plan-list train-aux-list">
                      {warmupOptions.map((item) => (
                        <article key={item} className="train-plan-item train-aux-item-card">
                          <p className="train-aux-item-title">{item}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            </div>
          ) : null}

          <div className="train-block">
            <p className="label train-label">Main</p>
            <div className="train-plan-list">
              {workout.plan.mainExercises.map((exercise, exerciseIndex) => {
                const isExpanded = expandedExerciseIndex === exerciseIndex
                const setDetails = exercise.setDetails
                const firstSet = setDetails[0]
                const compactSummary =
                  setDetails.length === 0
                    ? 'No sets'
                    : (() => {
                        const repsLabel = `${firstSet?.repsPreset ?? '-'} reps`
                        const loadText = summaryLoadLabel(
                          firstSet?.load ?? 0,
                          firstSet?.loadUnit ?? 'kg',
                          firstSet?.loadType ?? 'machine'
                        )
                        const equipmentText = exercise.equipment
                        const parts = [`${setDetails.length} sets`, repsLabel, loadText]
                        if (normalizeLabel(loadText) !== normalizeLabel(equipmentText)) {
                          parts.push(equipmentText)
                        }
                        return parts.join(' - ')
                      })()
                return (
                  <article
                    key={`${exercise.exercise}-${exerciseIndex}`}
                    className={`train-plan-item train-accordion-item ${isExpanded ? 'is-expanded' : ''}`}
                  >
                    <button
                      type="button"
                      className="train-accordion-head"
                      onClick={() => {
                        if (Date.now() - lastTouchInteractionAtRef.current < TOUCH_CLICK_SUPPRESS_MS) {
                          return
                        }
                        if (suppressNextClickRef.current) {
                          suppressNextClickRef.current = false
                          return
                        }
                        handleExerciseToggle(exerciseIndex)
                      }}
                      onTouchStart={() => handleExerciseTouchStart(exerciseIndex)}
                      onTouchEnd={() => handleExerciseTouchEnd(exerciseIndex)}
                      onTouchCancel={() => handleExerciseTouchEnd(exerciseIndex)}
                      onTouchMove={clearTouchTimer}
                      aria-expanded={isExpanded}
                    >
                      <span className="train-accordion-title">{exercise.exercise}</span>
                      <span className="train-accordion-summary">{compactSummary}</span>
                    </button>

                    {isExpanded ? (
                      <div className="train-accordion-body">
                        <p className="muted train-plan-meta">
                          <span className="equipment-icon" aria-hidden="true" />
                          {exercise.equipment}
                        </p>

                        <div className="train-swap-row">
                          <span>Swap</span>
                          <select
                            className="train-set-select train-swap-select"
                            value={exercise.exercise}
                            onChange={(event) => {
                              const next = [exercise, ...workout.plan.alternatives].find(
                                (item) => item.exercise === event.target.value
                              )
                              if (!next) return
                              onReplaceExercise(exerciseIndex, next)
                            }}
                          >
                            {[exercise, ...alternativeOptions]
                              .filter((item, idx, arr) => arr.findIndex((x) => x.exercise === item.exercise) === idx)
                              .map((item) => (
                                <option key={item.exercise} value={item.exercise}>
                                  {item.exercise}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            className="train-exercise-remove"
                            onClick={() => setRemoveExerciseIndex(exerciseIndex)}
                            disabled={workout.plan.mainExercises.length <= 1}
                            aria-label={`Remove exercise ${exercise.exercise}`}
                          >
                            <svg
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="train-set-list">
                          {setDetails.map((setDetail, setIndex) => {
                            const loadOptions = buildLoadOptions(setDetail.loadUnit, setDetail.loadType)
                            return (
                              <div key={`${exercise.exercise}-set-${setIndex}`} className="train-set-row">
                                <p className="train-set-label">Set {setIndex + 1}</p>
                                <select
                                  className="train-set-select"
                                  value={setDetail.repsPreset}
                                  onChange={(event) =>
                                    onChangeSet(exerciseIndex, setIndex, {
                                      repsPreset: event.target.value as RepsPreset,
                                    })
                                  }
                                >
                                  {REPS_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  className="train-set-select"
                                  value={setDetail.load}
                                  onChange={(event) =>
                                    onChangeSet(exerciseIndex, setIndex, {
                                      load: Number(event.target.value),
                                      loadUnit: setDetail.loadUnit,
                                    })
                                  }
                                >
                                  {loadOptions.map((item) => (
                                    <option key={item} value={item}>
                                      {loadLabel(item, setDetail.loadUnit, setDetail.loadType)}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="train-set-remove"
                                  onClick={() => onRemoveSet(exerciseIndex, setIndex)}
                                  disabled={setDetails.length <= 1}
                                  aria-label={`Remove set ${setIndex + 1}`}
                                >
                                  <svg
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          })}
                          <button
                            type="button"
                            className="train-set-add-row"
                            onClick={() => onAddSet(exerciseIndex)}
                            aria-label="Add set"
                          >
                            <span className="train-set-add-label">Add</span>
                            <span className="train-set-add" aria-hidden="true">
                              <svg
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </div>

          {alternativeOptions.length > 0 ? (
            <div className="train-block">
              <button
                type="button"
                className="train-collapse-btn"
                onClick={() => setShowAlternatives((prev) => !prev)}
                aria-expanded={showAlternatives}
              >
                {showAlternatives
                  ? 'Hide alternatives'
                  : `Show alternatives (${alternativeOptions.length})`}
              </button>
              {showAlternatives ? (
                <div className="train-plan-list train-alt-list">
                  {alternativeOptions.map((exercise, index) => (
                    <article key={`${exercise.exercise}-${index}`} className="train-plan-item train-rail-alt">
                      <h3>{exercise.exercise}</h3>
                      <p className="muted train-plan-meta">
                        {(() => {
                          const firstSet = exercise.setDetails[0]
                          const setCount = exercise.setDetails.length > 0 ? exercise.setDetails.length : exercise.sets
                          const repsLabel = `${firstSet?.repsPreset ?? exercise.reps ?? '-'} reps`
                          const loadText = summaryLoadLabel(
                            firstSet?.load ?? exercise.load ?? 0,
                            firstSet?.loadUnit ?? exercise.loadUnit ?? 'kg',
                            firstSet?.loadType ?? exercise.loadType ?? 'machine'
                          )
                          const equipmentText = exercise.equipment
                          const parts = [`${setCount} sets`, repsLabel, loadText]
                          if (normalizeLabel(loadText) !== normalizeLabel(equipmentText)) {
                            parts.push(equipmentText)
                          }
                          return parts.join(' - ')
                        })()}
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {stretchOptions.length > 0 ? (
            <div className="train-block">
              <article className={`train-plan-item train-accordion-item train-aux-accordion-item ${expandedAuxSection === 'stretch' ? 'is-expanded' : ''}`}>
                <button
                  type="button"
                  className="train-accordion-head train-aux-accordion-head"
                  onClick={() => setExpandedAuxSection((prev) => (prev === 'stretch' ? null : 'stretch'))}
                  aria-expanded={expandedAuxSection === 'stretch'}
                >
                  <span className="train-accordion-title">Stretch</span>
                  <span className="train-accordion-summary">{stretchOptions.length} exercises</span>
                </button>
                {expandedAuxSection === 'stretch' ? (
                  <div className="train-accordion-body train-aux-accordion-body">
                    <div className="train-plan-list train-aux-list">
                      {stretchOptions.map((item) => (
                        <article key={item} className="train-plan-item train-aux-item-card">
                          <p className="train-aux-item-title">{item}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            </div>
          ) : null}
        </>
      )}

      {removeExerciseIndex !== null && workout && typeof document !== 'undefined'
        ? createPortal(
            <div className="dialog-backdrop" role="presentation" onClick={() => setRemoveExerciseIndex(null)}>
              <div
                className="dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-exercise-dialog-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 id="remove-exercise-dialog-title">Remove exercise?</h3>
                <p className="muted">
                  Are you sure you want to remove{' '}
                  <strong>{workout.plan.mainExercises[removeExerciseIndex]?.exercise ?? 'this exercise'}</strong>?
                </p>
                <div className="dialog-actions">
                  <button type="button" className="ghost" onClick={() => setRemoveExerciseIndex(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="train-danger-btn"
                    onClick={() => {
                      onRemoveExercise(removeExerciseIndex)
                      setRemoveExerciseIndex(null)
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  )
}
