export type FocusSide = 'front' | 'back'

export type FocusAnchor = {
  cx: number
  cy: number
  zoom: number
}

export type FocusAnchorBySide = {
  front?: FocusAnchor
  back?: FocusAnchor
}

export type FocusBox = {
  left: number
  top: number
  right: number
  bottom: number
  pad?: number
}

export type FocusBoxBySide = {
  front?: FocusBox
  back?: FocusBox
}

export type FocusPoint = {
  x: number
  y: number
}

export type FocusCorners = {
  topLeft: FocusPoint
  topRight: FocusPoint
  bottomLeft: FocusPoint
  bottomRight: FocusPoint
  pad?: number
}

export type FocusCornersBySide = {
  front?: FocusCorners
  back?: FocusCorners
}

export type FocusLimitBySide = {
  front?: number
  back?: number
}

const DEFAULT_ANCHOR: FocusAnchor = { cx: 0.5, cy: 0.5, zoom: 1.8 }

export const MUSCLE_FOCUS_ANCHORS: Record<string, FocusAnchorBySide> = {
  Chest: { front: { cx: 0.5, cy: 0.49, zoom: 1.8 } },
  Back: { back: { cx: 0.5, cy: 0.23, zoom: 2.5 } },
  Shoulder: {
    front: { cx: 0.5, cy: 0.2, zoom: 2.35 },
    back: { cx: 0.5, cy: 0.2, zoom: 2.35 },
  },
  Biceps: {
    front: { cx: 0.5, cy: 0.3, zoom: 2.15 },
    back: { cx: 0.5, cy: 0.32, zoom: 2.05 },
  },
  Triceps: {
    front: { cx: 0.5, cy: 0.3, zoom: 2.0 },
    back: { cx: 0.5, cy: 0.3, zoom: 2.15 },
  },
  Forearms: {
    front: { cx: 0.5, cy: 0.43, zoom: 2.0 },
    back: { cx: 0.5, cy: 0.43, zoom: 2.0 },
  },
  Legs: {
    front: { cx: 0.5, cy: 0.73, zoom: 1.9 },
    back: { cx: 0.5, cy: 0.73, zoom: 1.9 },
  },
  Core: {
    front: { cx: 0.5, cy: 0.42, zoom: 2.1 },
    back: { cx: 0.5, cy: 0.42, zoom: 1.95 },
  },
}

export const MUSCLE_FOCUS_BOXES: Record<string, FocusBoxBySide> = {
  Chest: { front: { left: 0.5, top: 0.1, right: 0.75, bottom: 0.4, pad: 1.08 } },
  Back: { back: { left: 0.17, top: 0.15, right: 0.84, bottom: 0.43, pad: 1.08 } },
  Shoulder: {
    front: { left: 0.15, top: 0.1, right: 0.86, bottom: 0.33, pad: 1.08 },
    back: { left: 0.14, top: 0.1, right: 0.87, bottom: 0.34, pad: 1.08 },
  },
  Biceps: {
    front: { left: 0.06, top: 0.15, right: 0.94, bottom: 0.41, pad: 1.08 },
    back: { left: 0.05, top: 0.16, right: 0.95, bottom: 0.41, pad: 1.08 },
  },
  Triceps: {
    front: { left: 0.03, top: 0.17, right: 0.98, bottom: 0.45, pad: 1.08 },
    back: { left: 0.03, top: 0.17, right: 0.98, bottom: 0.43, pad: 1.08 },
  },
  Forearms: {
    front: { left: 0.0, top: 0.28, right: 1.0, bottom: 0.59, pad: 1.08 },
    back: { left: 0.0, top: 0.28, right: 1.0, bottom: 0.6, pad: 1.08 },
  },
  Legs: {
    front: { left: 0.2, top: 0.44, right: 0.83, bottom: 0.98, pad: 1.05 },
    back: { left: 0.18, top: 0.44, right: 0.82, bottom: 0.99, pad: 1.05 },
  },
  Core: {
    front: { left: 0.3, top: 0.23, right: 0.7, bottom: 0.54, pad: 1.08 },
    back: { left: 0.25, top: 0.23, right: 0.76, bottom: 0.54, pad: 1.08 },
  },
}

const FRONT_BASE = { width: 725, height: 1145 }
const BACK_BASE = { width: 731, height: 1135 }

const toCorners = (
  side: FocusSide,
  box: FocusBox
): FocusCorners => {
  const base = side === 'front' ? FRONT_BASE : BACK_BASE
  const left = box.left * base.width
  const right = box.right * base.width
  const top = box.top * base.height
  const bottom = box.bottom * base.height
  return {
    topLeft: { x: left, y: top },
    topRight: { x: right, y: top },
    bottomLeft: { x: left, y: bottom },
    bottomRight: { x: right, y: bottom },
    pad: box.pad,
  }
}

export const MUSCLE_FOCUS_CORNERS: Record<string, FocusCornersBySide> = {
  Chest: {
    front: {
      topLeft: { x: 190, y: 150 },
      topRight: { x: 530, y: 150 },
      bottomLeft: { x: 190, y: 350 },
      bottomRight: { x: 530, y: 350 },
      pad: 1.08,
    },
  },
  Back: {
    back: {
      topLeft: { x: 160, y: 130 },
      topRight: { x: 590, y: 130 },
      bottomLeft: { x: 160, y: 520 },
      bottomRight: { x: 590, y: 520 },
      pad: 1.08,
    },
  },
  Shoulder: {
    front: {
      topLeft: { x: 0, y: 90 },
      topRight: { x: 330, y: 90 },
      bottomLeft: { x: 0, y: 290 },
      bottomRight: { x: 330, y: 290 },
      pad: 1.08,
    },
    back: {
      topLeft: { x: 0, y: 130 },
      topRight: { x: 330, y: 130 },
      bottomLeft: { x: 0, y: 330 },
      bottomRight: { x: 330, y: 330 },
      pad: 1.08,
    },
  },
  Biceps: {
    front: {
      topLeft: { x: 0, y: 125 },
      topRight: { x: 330, y: 125 },
      bottomLeft: { x: 0, y: 325 },
      bottomRight: { x: 330, y: 325 },
      pad: 1.08,
    },
    back: {
      topLeft: { x: 0, y: 120 },
      topRight: { x: 330, y: 120 },
      bottomLeft: { x: 0, y: 320 },
      bottomRight: { x: 330, y: 320 },
      pad: 1.08,
    },
  },
  Triceps: {
    front: {
      topLeft: { x: 0, y: 120 },
      topRight: { x: 330, y: 120 },
      bottomLeft: { x: 0, y: 320 },
      bottomRight: { x: 330, y: 320 },
      pad: 1.08,
    },
    back: {
      topLeft: { x: 0, y: 130 },
      topRight: { x: 330, y: 130 },
      bottomLeft: { x: 0, y: 330 },
      bottomRight: { x: 330, y: 330 },
      pad: 1.08,
    },
  },
  Forearms: {
    front: {
      topLeft: { x: 0, y: 70 },
      topRight: { x: 330, y: 70 },
      bottomLeft: { x: 0, y: 270 },
      bottomRight: { x: 330, y: 270 },
      pad: 1.08,
    },
    back: {
      topLeft: { x: 0, y: 70 },
      topRight: { x: 330, y: 70 },
      bottomLeft: { x: 0, y: 270 },
      bottomRight: { x: 330, y: 270 },
      pad: 1.08,
    },
  },
  Legs: {
    front: {
      topLeft: { x: 130, y: 520 },
      topRight: { x: 600, y: 520 },
      bottomLeft: { x: 130, y: 1000 },
      bottomRight: { x: 600, y: 1000},
      pad: 1.05,
    },
    back: {
      topLeft: { x: 130, y: 500 },
      topRight: { x: 600, y: 500 },
      bottomLeft: { x: 130, y: 980 },
      bottomRight: { x: 600, y: 980 },
      pad: 1.05,
    },
  },
  Core: {
    front: {
      topLeft: { x: 217.5, y: 300 },
      topRight: { x: 507.5, y: 300 },
      bottomLeft: { x: 217.5, y: 560 },
      bottomRight: { x: 507.5, y: 560 },
      pad: 1.08,
    },
    back: {
      topLeft: { x: 217.5, y: 300 },
      topRight: { x: 507.5, y: 300 },
      bottomLeft: { x: 217.5, y: 560 },
      bottomRight: { x: 507.5, y: 560 },
      pad: 1.08,
    },
  },
}

// Max on-screen pixel distance between topLeft.x and topRight.x.
export const MUSCLE_FOCUS_MAX_X_SPAN: Record<string, FocusLimitBySide> = {
  Chest: {
    front: 500,
  },
}

export const getFocusAnchor = (
  focusGroup: string | null | undefined,
  side: FocusSide
): FocusAnchor => {
  if (!focusGroup) return DEFAULT_ANCHOR
  return MUSCLE_FOCUS_ANCHORS[focusGroup]?.[side] ?? DEFAULT_ANCHOR
}

export const getFocusBox = (
  focusGroup: string | null | undefined,
  side: FocusSide
): FocusBox | null => {
  if (!focusGroup) return null
  return MUSCLE_FOCUS_BOXES[focusGroup]?.[side] ?? null
}

export const getFocusCorners = (
  focusGroup: string | null | undefined,
  side: FocusSide
): FocusCorners | null => {
  if (!focusGroup) return null
  const corners = MUSCLE_FOCUS_CORNERS[focusGroup]?.[side]
  if (corners) return corners

  const box = MUSCLE_FOCUS_BOXES[focusGroup]?.[side]
  if (!box) return null
  return toCorners(side, box)
}

export const getFocusMaxXSpan = (
  focusGroup: string | null | undefined,
  side: FocusSide
): number | null => {
  if (!focusGroup) return null
  return MUSCLE_FOCUS_MAX_X_SPAN[focusGroup]?.[side] ?? null
}
