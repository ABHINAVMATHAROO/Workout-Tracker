import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { CustomTrainRoutine, LoadUnit, MuscleGroup } from './types'

const normalizeLoadUnit = (value: unknown): LoadUnit => (value === 'lb' ? 'lb' : 'kg')

const normalizeRoutine = (value: unknown): CustomTrainRoutine | null => {
  if (!value || typeof value !== 'object') return null
  const parsed = value as Partial<CustomTrainRoutine>
  if (!parsed.userId || !parsed.muscleGroup || parsed.variant !== 'mine' || !parsed.baseIntensity) return null
  if (!Array.isArray(parsed.mainExercises)) return null

  return {
    userId: parsed.userId,
    muscleGroup: parsed.muscleGroup,
    variant: 'mine',
    baseIntensity: parsed.baseIntensity,
    focus: typeof parsed.focus === 'string' ? parsed.focus : '',
    regions: Array.isArray(parsed.regions) ? parsed.regions : [],
    mainExercises: parsed.mainExercises,
    warmup: Array.isArray(parsed.warmup) ? parsed.warmup : [],
    postWorkoutStretch: Array.isArray(parsed.postWorkoutStretch) ? parsed.postWorkoutStretch : [],
  }
}

export const getCustomRoutine = async (userId: string, muscleGroup: MuscleGroup) => {
  const ref = doc(db, 'users', userId, 'trainRoutines', muscleGroup)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return normalizeRoutine(snap.data())
}

export const saveCustomRoutine = async (userId: string, routine: CustomTrainRoutine) => {
  const ref = doc(db, 'users', userId, 'trainRoutines', routine.muscleGroup)
  await setDoc(ref, { ...routine, userId, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true })
}

export const getUserLoadUnit = async (userId: string): Promise<LoadUnit> => {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  return normalizeLoadUnit(snap.data()?.trainPreferences?.loadUnit)
}

export const saveUserLoadUnit = async (userId: string, unit: LoadUnit) => {
  const userRef = doc(db, 'users', userId)
  await setDoc(
    userRef,
    {
      trainPreferences: {
        loadUnit: unit,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  )
}
