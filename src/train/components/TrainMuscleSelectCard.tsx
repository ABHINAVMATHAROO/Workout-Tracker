import type { CSSProperties } from 'react'
import MuscleMapSvg from '../../MuscleMapSvg'
import type { Intensity, MuscleGroup } from '../types'

type TrainMuscleSelectCardProps = {
  selectedMuscle: MuscleGroup | null
  isExpanded: boolean
  intensity: Intensity
  view: 'front' | 'back'
  onSelectMuscle: (group: MuscleGroup) => void
  onExpand: () => void
  onFlip: () => void
  onSelectIntensity: (intensity: Intensity) => void
}

const INTENSITY_VALUES: Intensity[] = ['Beginner', 'Intermediate', 'Pro']
const INTENSITY_LABELS = ['Comfort', 'Evolve', 'Warrior'] as const

export default function TrainMuscleSelectCard({
  selectedMuscle,
  isExpanded,
  intensity,
  view,
  onSelectMuscle,
  onExpand,
  onFlip,
  onSelectIntensity,
}: TrainMuscleSelectCardProps) {
  const selectedIndex = INTENSITY_VALUES.indexOf(intensity)
  const progress = `${(selectedIndex / (INTENSITY_VALUES.length - 1)) * 100}%`
  const intensityColor =
    selectedIndex === 0
      ? 'rgb(var(--cadax-green-light) / 0.95)'
      : selectedIndex === 1
        ? 'rgb(var(--cadax-blue-light) / 0.95)'
        : 'rgb(var(--cadax-orange) / 0.95)'
  const selectedSet = selectedMuscle ? new Set<string>([selectedMuscle]) : new Set<string>()
  const isCollapsed = selectedMuscle !== null && !isExpanded
  const title = selectedMuscle ? `${selectedMuscle} day` : 'Select workout'

  return (
    <section
      className={`card ${isCollapsed ? 'train-focus-card-collapsed train-focus-card-clickable' : ''}`}
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
      </div>

      {!isCollapsed ? (
        <MuscleMapSvg
          workedGroups={new Set<string>()}
          selectedGroups={selectedSet}
          view={view}
          onToggle={(group) => onSelectMuscle(group as MuscleGroup)}
          onFlip={onFlip}
        />
      ) : null}

      <div
        className="train-intensity-block"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="label train-label">Intensity</p>
        <input
          className="train-intensity-slider"
          type="range"
          min={0}
          max={2}
          step={1}
          value={selectedIndex}
          style={
            {
              '--intensity-progress': progress,
              '--intensity-color': intensityColor,
            } as CSSProperties
          }
          onChange={(event) => onSelectIntensity(INTENSITY_VALUES[Number(event.target.value)] ?? 'Beginner')}
          aria-label="Select intensity"
        />
        <div className="train-intensity-scale">
          {INTENSITY_LABELS.map((level, index) => (
            <span
              key={level}
              className={`train-intensity-label ${index === selectedIndex ? 'is-active' : ''}`}
            >
              {level}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
