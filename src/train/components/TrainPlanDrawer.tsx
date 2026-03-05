import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import TrainPlanCard from './TrainPlanCard'
import type { GeneratedTrainWorkout, Intensity, LoadUnit, MuscleGroup, PlanExerciseItem, RepsPreset } from '../types'

type TrainPlanDrawerProps = {
  drawerHeightVh: number
  onDrawerHeightChange: (value: number) => void
  workout: GeneratedTrainWorkout | null
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  alternativeOptions: PlanExerciseItem[]
  warmupOptions: string[]
  stretchOptions: string[]
  intensity: Intensity
  hasMineOption: boolean
  isMineSelected: boolean
  mineLabel: string
  onSelectIntensity: (intensity: Intensity) => void
  onSelectMine: () => void
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

const INTENSITY_VALUES: Intensity[] = ['Beginner', 'Intermediate', 'Pro']
const MINE_OPTION_VALUE = '__mine__'
export const DEFAULT_DRAWER_HEIGHT_BY_MUSCLE: Record<MuscleGroup, number> = {
  Chest: 70,
  Back: 64,
  Triceps: 58,
  Biceps: 58,
  Shoulder: 60,
  Forearms: 56,
  Legs: 68,
  Core: 60,
}

export const getDefaultDrawerHeight = (muscle: MuscleGroup) =>
  DEFAULT_DRAWER_HEIGHT_BY_MUSCLE[muscle] ?? 62

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function TrainPlanDrawer({
  drawerHeightVh,
  onDrawerHeightChange,
  workout,
  saveState,
  alternativeOptions,
  warmupOptions,
  stretchOptions,
  intensity,
  hasMineOption,
  isMineSelected,
  mineLabel,
  onSelectIntensity,
  onSelectMine,
  onActiveExerciseChange,
  onChangeSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onReplaceExercise,
}: TrainPlanDrawerProps) {
  const draggingRef = useRef(false)

  const moveToClientY = (clientY: number) => {
    const viewportHeight = window.innerHeight || 1
    const target = ((viewportHeight - clientY) / viewportHeight) * 100
    onDrawerHeightChange(clamp(target, 36, 90))
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!draggingRef.current) return
    moveToClientY(event.clientY)
  }

  const onPointerUp = () => {
    draggingRef.current = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    draggingRef.current = true
    moveToClientY(event.clientY)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <section
      className="train-plan-drawer"
      style={{ '--train-drawer-height': `${drawerHeightVh}dvh` } as CSSProperties}
    >
      <button
        type="button"
        className="train-plan-drawer-handle"
        aria-label="Resize workout plan drawer"
        onPointerDown={handlePointerDown}
      >
        <span />
      </button>

      <div className="train-plan-drawer-header">
        <h2 className="train-plan-drawer-title">Workout Plan</h2>
        <div className="train-plan-drawer-header-actions">
          <label className="train-plan-drawer-intensity">
            <span>Intensity</span>
            <select
              value={isMineSelected && hasMineOption ? MINE_OPTION_VALUE : intensity}
              onChange={(event) => {
                if (event.target.value === MINE_OPTION_VALUE) {
                  onSelectMine()
                  return
                }
                onSelectIntensity(event.target.value as Intensity)
              }}
              aria-label="Select intensity"
            >
              {INTENSITY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
              {hasMineOption ? (
                <option value={MINE_OPTION_VALUE}>
                  {mineLabel}
                </option>
              ) : null}
            </select>
          </label>
        </div>
      </div>

      <div className="train-plan-drawer-scroll">
        <TrainPlanCard
          workout={workout}
          saveState={saveState}
          alternativeOptions={alternativeOptions}
          warmupOptions={warmupOptions}
          stretchOptions={stretchOptions}
          onActiveExerciseChange={onActiveExerciseChange}
          onChangeSet={onChangeSet}
          onAddSet={onAddSet}
          onRemoveSet={onRemoveSet}
          onRemoveExercise={onRemoveExercise}
          onReplaceExercise={onReplaceExercise}
        />
      </div>
    </section>
  )
}
