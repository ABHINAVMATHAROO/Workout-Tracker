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
  const STEP_POSITIONS = ['16.666%', '50%', '83.333%'] as const
  const thumbPosition = STEP_POSITIONS[selectedIndex] ?? STEP_POSITIONS[0]
  const fillWidth = thumbPosition
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
        <div
          className="train-intensity-slider-shell"
          style={
            {
              '--intensity-progress': fillWidth,
              '--intensity-thumb-pos': thumbPosition,
              '--intensity-color': intensityColor,
            } as CSSProperties
          }
        >
          <div className="train-intensity-rail" aria-hidden="true" />
          <div className="train-intensity-fill" aria-hidden="true" />
          <div className="train-intensity-thumb" aria-hidden="true" />
          <input
            className="train-intensity-slider"
            type="range"
            min={0}
            max={2}
            step={1}
            value={selectedIndex}
            onChange={(event) => onSelectIntensity(INTENSITY_VALUES[Number(event.target.value)] ?? 'Beginner')}
            aria-label="Select intensity"
          />
        </div>
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
