import { useEffect, useRef, useState, type CSSProperties } from 'react'
import MuscleMapSvg from '../../MuscleMapSvg'
import { mapActiveRegionsToAreas } from '../muscleAreaMapper'
import type { MuscleGroup } from '../types'
import { getFocusCorners, getFocusMaxXSpan } from '../../focusFraming'

type TrainFocusStageProps = {
  selectedMuscle: MuscleGroup
  view: 'front' | 'back'
  canFlip: boolean
  activeExerciseRegions: string[] | null
  onSuggestDrawerHeightVh?: (value: number) => void
  onBack: () => void
  onFlip: () => void
}

export default function TrainFocusStage({
  selectedMuscle,
  view,
  canFlip,
  activeExerciseRegions,
  onSuggestDrawerHeightVh,
  onBack,
  onFlip,
}: TrainFocusStageProps) {
  const activeAreas = mapActiveRegionsToAreas(selectedMuscle, activeExerciseRegions)
  const focusCorners = getFocusCorners(selectedMuscle, view)
  const maxXSpan = getFocusMaxXSpan(selectedMuscle, view)
  const labelRef = useRef<HTMLDivElement>(null)
  const [labelBottomPx, setLabelBottomPx] = useState(64)
  const [bottomAnchorPx, setBottomAnchorPx] = useState(520)

  useEffect(() => {
    const updateLabelBottom = () => {
      const rect = labelRef.current?.getBoundingClientRect()
      if (!rect) return
      setLabelBottomPx(rect.bottom)
    }

    updateLabelBottom()
    window.addEventListener('resize', updateLabelBottom)
    return () => window.removeEventListener('resize', updateLabelBottom)
  }, [selectedMuscle, view])

  useEffect(() => {
    if (!focusCorners) {
      const labelRect = labelRef.current?.getBoundingClientRect()
      if (!labelRect) return
      const topPx = labelRect.bottom
      const screenHeight = window.innerHeight || 1
      const fallbackBottomPx = topPx + (screenHeight - topPx) * 0.58
      setLabelBottomPx(topPx)
      setBottomAnchorPx(fallbackBottomPx)
      onSuggestDrawerHeightVh?.(Math.max(20, Math.min(90, 100 - (fallbackBottomPx / screenHeight) * 100)))
      return
    }

    const updateAnchors = () => {
      const labelRect = labelRef.current?.getBoundingClientRect()
      if (!labelRect) return

      const topPx = labelRect.bottom
      const screenWidth = window.innerWidth || 1
      const screenHeight = window.innerHeight || 1
      const mapHeight = Math.max(1, screenHeight - topPx)
      const viewportAspect = screenWidth / mapHeight

      const base = view === 'front' ? { width: 725, height: 1145 } : { width: 731, height: 1135 }
      const topLeftX = Math.min(base.width, Math.max(0, focusCorners.topLeft.x))
      const topLeftY = Math.min(base.height, Math.max(0, focusCorners.topLeft.y))
      const topRightX = Math.min(base.width, Math.max(0, focusCorners.topRight.x))
      const topRightY = Math.min(base.height, Math.max(0, focusCorners.topRight.y))
      const bottomLeftX = Math.min(base.width, Math.max(0, focusCorners.bottomLeft.x))
      const bottomLeftY = Math.min(base.height, Math.max(0, focusCorners.bottomLeft.y))
      const bottomRightX = Math.min(base.width, Math.max(0, focusCorners.bottomRight.x))
      const bottomRightY = Math.min(base.height, Math.max(0, focusCorners.bottomRight.y))

      const left = Math.min(topLeftX, bottomLeftX)
      const right = Math.max(topRightX, bottomRightX)
      const top = Math.min(topLeftY, topRightY)
      const bottom = Math.max(bottomLeftY, bottomRightY)
      const pad = Math.max(1, Math.min(2, focusCorners.pad ?? 1.08))

      const topSpanSvg = Math.max(1, Math.abs(topRightX - topLeftX))
      const boxWidth = Math.max(1, right - left)
      const boxHeight = Math.max(1, bottom - top)

      const paddedLeft = left - ((pad - 1) * boxWidth) / 2
      const paddedRight = right + ((pad - 1) * boxWidth) / 2
      const paddedTop = top
      const paddedBottom = bottom + (pad - 1) * boxHeight

      let width = Math.max(1, paddedRight - paddedLeft)
      let height = Math.max(1, paddedBottom - paddedTop)

      const targetAspect = width / height
      if (viewportAspect > targetAspect) {
        width = height * viewportAspect
      } else {
        height = width / viewportAspect
      }

      if (maxXSpan && screenWidth > 0) {
        const projectedTopSpanPx = (topSpanSvg / width) * screenWidth
        if (projectedTopSpanPx > maxXSpan) {
          width = (topSpanSvg * screenWidth) / maxXSpan
          height = width / viewportAspect
        }
      }

      const vbY = paddedTop

      const mapPointY = (y: number) => topPx + ((y - vbY) / height) * mapHeight
      const bottomPx = Math.max(mapPointY(bottom), topPx + 8)

      setLabelBottomPx(topPx)
      setBottomAnchorPx(bottomPx)

      const suggestedVh = Math.max(20, Math.min(90, 100 - (bottomPx / screenHeight) * 100))
      onSuggestDrawerHeightVh?.(suggestedVh)
    }

    updateAnchors()
    window.addEventListener('resize', updateAnchors)
    return () => window.removeEventListener('resize', updateAnchors)
  }, [focusCorners, maxXSpan, onSuggestDrawerHeightVh, selectedMuscle, view])

  return (
    <div
      className="train-focus-stage"
      style={
        {
          '--train-focus-top': `${labelBottomPx}px`,
          '--train-focus-bottom': `${bottomAnchorPx}px`,
        } as CSSProperties
      }
    >
      <button type="button" className="train-focus-back" onClick={onBack} aria-label="Back to train selection">
        {'<'}
      </button>
      {canFlip ? (
        <button type="button" className="train-focus-flip" onClick={onFlip} aria-label="Flip muscle map view">
          {view === 'front' ? 'Front' : 'Back'}
        </button>
      ) : null}
      <div ref={labelRef} className="train-focus-muscle-label">{selectedMuscle} day</div>
      <div className="train-focus-map-wrap">
        <MuscleMapSvg
          workedGroups={new Set<string>()}
          selectedGroups={new Set<string>([selectedMuscle])}
          view={view}
          focusGroup={selectedMuscle}
          activeAreas={activeAreas}
          compactFocus={true}
          showFocusCornerPoints={false}
          onToggle={() => {}}
          onFlip={() => {}}
        />
      </div>
    </div>
  )
}

