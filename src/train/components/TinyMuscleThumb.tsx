type TinyMuscleThumbProps = {
  muscleGroup: string
  targetAreas?: string[]
  size?: 'sm' | 'lg'
}

const FRONT_SVG_URL = `${import.meta.env.BASE_URL}front.svg`
const BACK_SVG_URL = `${import.meta.env.BASE_URL}back.svg`

const pickPoint = (muscleGroup: string, targetAreas: string[]) => {
  const joined = `${muscleGroup} ${targetAreas.join(' ')}`.toLowerCase()

  if (joined.includes('back') || joined.includes('rear') || joined.includes('lat') || joined.includes('trap')) {
    return { x: 50, y: 38, back: true }
  }
  if (joined.includes('chest') || joined.includes('pec')) {
    if (joined.includes('upper')) return { x: 50, y: 30, back: false }
    if (joined.includes('lower')) return { x: 50, y: 46, back: false }
    if (joined.includes('inner')) return { x: 50, y: 38, back: false }
    if (joined.includes('outer')) return { x: 63, y: 38, back: false }
    return { x: 50, y: 38, back: false }
  }
  if (joined.includes('biceps')) return { x: 32, y: 35, back: false }
  if (joined.includes('triceps')) return { x: 32, y: 36, back: true }
  if (joined.includes('shoulder') || joined.includes('delt')) return { x: 30, y: 28, back: false }
  if (joined.includes('forearm') || joined.includes('wrist')) return { x: 30, y: 48, back: false }
  if (joined.includes('leg') || joined.includes('quad') || joined.includes('ham')) return { x: 48, y: 70, back: false }
  if (joined.includes('core') || joined.includes('ab')) return { x: 50, y: 50, back: false }

  return { x: 50, y: 50, back: false }
}

export default function TinyMuscleThumb({
  muscleGroup,
  targetAreas = [],
  size = 'sm',
}: TinyMuscleThumbProps) {
  const point = pickPoint(muscleGroup, targetAreas)
  const source = point.back ? BACK_SVG_URL : FRONT_SVG_URL

  return (
    <div className={`tiny-muscle-thumb ${size === 'lg' ? 'is-lg' : ''}`} aria-hidden="true">
      <img src={source} alt="" />
      <span
        className="tiny-muscle-dot"
        style={{ left: `${point.x}%`, top: `${point.y}%` }}
      />
    </div>
  )
}
