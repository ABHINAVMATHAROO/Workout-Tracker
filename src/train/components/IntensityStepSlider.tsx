import { useMemo, useRef, type CSSProperties } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import type { Intensity } from '../types'

type IntensityStepSliderProps = {
  intensity: Intensity
  hasMineOption: boolean
  isMineSelected: boolean
  mineLabel: string
  onSelectIntensity: (intensity: Intensity) => void
  onSelectMine: () => void
}

type StepOption = {
  key: string
  label: string
  kind: 'preset' | 'mine'
}

const PRESET_OPTIONS: StepOption[] = [
  { key: 'Beginner', label: 'Comfort', kind: 'preset' },
  { key: 'Intermediate', label: 'Evolve', kind: 'preset' },
  { key: 'Pro', label: 'Warrior', kind: 'preset' },
]

const MINE_KEY = '__mine__'
const MAX_OVERFLOW = 50

export default function IntensityStepSlider({
  intensity,
  hasMineOption,
  isMineSelected,
  mineLabel,
  onSelectIntensity,
  onSelectMine,
}: IntensityStepSliderProps) {
  const steps = useMemo<StepOption[]>(
    () => (hasMineOption ? [...PRESET_OPTIONS, { key: MINE_KEY, label: mineLabel, kind: 'mine' }] : PRESET_OPTIONS),
    [hasMineOption, mineLabel]
  )

  const currentKey = isMineSelected && hasMineOption ? MINE_KEY : intensity
  const currentIndex = Math.max(0, steps.findIndex((step) => step.key === currentKey))
  const currentStep = steps[currentIndex] ?? steps[0]
  const maxLabelLength = steps.reduce((max, step) => Math.max(max, step.label.length), 8)
  const meterWidth = `${Math.max(10, Math.min(16, maxLabelLength + 3))}ch`
  const fillPercent = `${Math.round(((currentIndex + 1) / steps.length) * 100)}%`
  const scale = useMotionValue(1)
  const overflow = useMotionValue(0)
  const pointerDownRef = useRef(false)

  const trackScaleX = useTransform(overflow, [0, MAX_OVERFLOW], [1, 1.16])
  const trackScaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.82])
  const trackHeight = useTransform(scale, [1, 1.2], [12, 16])
  const trackMarginTop = useTransform(scale, [1, 1.2], [0, -2])
  const trackMarginBottom = useTransform(scale, [1, 1.2], [0, -2])

  const selectByIndex = (index: number) => {
    const target = steps[index]
    if (!target) return
    if (target.kind === 'mine') {
      onSelectMine()
      return
    }
    onSelectIntensity(target.key as Intensity)
  }

  const handleTap = () => {
    const next = (currentIndex + 1) % steps.length
    selectByIndex(next)
    animate(overflow, MAX_OVERFLOW, { duration: 0.16, ease: 'easeOut' }).then(() => {
      animate(overflow, 0, { type: 'spring', bounce: 0.5 })
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointerDownRef.current = true
    animate(scale, 1.2)
  }

  const handlePointerUp = () => {
    animate(scale, 1)
    if (!pointerDownRef.current) return
    pointerDownRef.current = false
    handleTap()
  }

  const handlePointerCancel = () => {
    pointerDownRef.current = false
    animate(scale, 1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleTap()
  }

  return (
    <div
      className="intensity-step-slider"
      style={
        {
          '--intensity-meter-width': meterWidth,
          '--intensity-fill': fillPercent,
        } as CSSProperties
      }
    >
      <button
        type="button"
        className={`intensity-step-track ${currentStep.kind === 'mine' ? 'is-mine' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
        onKeyDown={handleKeyDown}
        aria-label={`Intensity: ${currentStep.label}. Tap to cycle.`}
      >
        <span className="intensity-step-value">{`Intensity : ${currentStep.label}`}</span>
        <span className="intensity-step-range-shell">
          <motion.span
            className="intensity-step-range"
            style={{
              scaleX: trackScaleX,
              scaleY: trackScaleY,
              height: trackHeight,
              marginTop: trackMarginTop,
              marginBottom: trackMarginBottom,
              transformOrigin: 'center',
            }}
          />
        </span>
      </button>
    </div>
  )
}
