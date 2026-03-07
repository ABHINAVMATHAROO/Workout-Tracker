import MuscleMapSvg from '../../MuscleMapSvg'
import { mapActiveRegionsToAreas } from '../muscleAreaMapper'
import IntensityStepSlider from './IntensityStepSlider'
import type { Intensity, MuscleGroup } from '../types'

type TrainMuscleSelectCardProps = {
  selectedMuscle: MuscleGroup | null
  isExpanded: boolean
  intensity: Intensity
  hasMineOption: boolean
  isMineSelected: boolean
  mineLabel: string
  view: 'front' | 'back'
  activeExerciseRegions?: string[] | null
  onSelectMuscle: (group: MuscleGroup) => void
  onExpand: () => void
  onFlip: () => void
  onSelectIntensity: (intensity: Intensity) => void
  onSelectMine: () => void
}

export default function TrainMuscleSelectCard({
  selectedMuscle,
  isExpanded,
  intensity,
  hasMineOption,
  isMineSelected,
  mineLabel,
  view,
  activeExerciseRegions,
  onSelectMuscle,
  onExpand,
  onFlip,
  onSelectIntensity,
  onSelectMine,
}: TrainMuscleSelectCardProps) {
  const selectedSet = selectedMuscle ? new Set<string>([selectedMuscle]) : new Set<string>()
  const isCollapsed = selectedMuscle !== null && !isExpanded
  const title = selectedMuscle ? `${selectedMuscle} day` : 'Select workout'
  const chestAreaHighlights = mapActiveRegionsToAreas(selectedMuscle, activeExerciseRegions)

  return (
    <section
      className={`card train-focus-card ${isCollapsed ? 'train-focus-card-collapsed train-focus-card-clickable' : 'train-focus-card-expanded'}`}
      onClick={isCollapsed ? onExpand : undefined}
      role={isCollapsed ? 'button' : undefined}
      tabIndex={isCollapsed ? 0 : undefined}
      onKeyDown={
        isCollapsed
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onExpand()
              }
            }
          : undefined
      }
      aria-label={isCollapsed ? 'Expand workout selector' : undefined}
    >
      <div className="section-head section-head-inline">
        <div className="section-title">
          <h2 className="section-title-nowrap train-focus-title">
            {title}
            {selectedMuscle ? <span className="train-focus-title-chevron">⌄</span> : null}
          </h2>
        </div>
        <div
          className="train-focus-header-actions"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <IntensityStepSlider
            intensity={intensity}
            hasMineOption={hasMineOption}
            isMineSelected={isMineSelected}
            mineLabel={mineLabel}
            onSelectIntensity={onSelectIntensity}
            onSelectMine={onSelectMine}
          />
        </div>
      </div>

      <div className={`train-focus-map-shell ${isCollapsed ? 'is-collapsed' : ''}`}>
        <MuscleMapSvg
          workedGroups={new Set<string>()}
          selectedGroups={selectedSet}
          view={view}
          focusGroup={selectedMuscle}
          activeAreas={selectedMuscle === 'Chest' ? chestAreaHighlights : []}
          compactFocus={isCollapsed}
          onToggle={(group) => onSelectMuscle(group as MuscleGroup)}
          onFlip={onFlip}
        />
      </div>
    </section>
  )
}
