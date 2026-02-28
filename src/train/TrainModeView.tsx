import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TrainPlanCard from './components/TrainPlanCard'
import TrainMuscleSelectCard from './components/TrainMuscleSelectCard'
import { generateWorkout } from './generateWorkout'
import { fromCustomRoutineToWorkout, fromPresetToCustomRoutine } from './routineMapper'
import { getCustomRoutine, getUserLoadUnit, saveCustomRoutine } from './trainRoutineStore'
import type { CustomTrainRoutine, GeneratedTrainWorkout, Intensity, LoadUnit, MuscleGroup, RepsPreset } from './types'

type TrainModeViewProps = {
  userId: string | null
  userName: string | null
}

const getFirstName = (name: string | null) => {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return 'Mine'
  return trimmed.split(/\s+/)[0] ?? 'Mine'
}

export default function TrainModeView({ userId: _userId, userName }: TrainModeViewProps) {
  const userId = _userId
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest')
  const [intensity, setIntensity] = useState<Intensity>('Beginner')
  const [muscleView, setMuscleView] = useState<'front' | 'back'>('front')
  const [hasSelectedFromMap, setHasSelectedFromMap] = useState(false)
  const [isFocusExpanded, setIsFocusExpanded] = useState(true)
  const [workout, setWorkout] = useState<GeneratedTrainWorkout | null>(null)
  const [customRoutine, setCustomRoutine] = useState<CustomTrainRoutine | null>(null)
  const [isPresetSession, setIsPresetSession] = useState(false)
  const [loadUnit, setLoadUnit] = useState<LoadUnit>('kg')
  const [hasPendingSave, setHasPendingSave] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [trainStatus, setTrainStatus] = useState('Tap a muscle region above to load your training plan.')
  const loadRef = useRef(0)
  const mineLabel = useMemo(() => getFirstName(userName), [userName])

  const applyPresetWorkout = useCallback((nextMuscleGroup: MuscleGroup, nextIntensity: Intensity) => {
    const nextWorkout = generateWorkout({ muscleGroup: nextMuscleGroup, intensity: nextIntensity })
    setWorkout(nextWorkout)
    setTrainStatus(nextWorkout.plan.source === 'unavailable' ? 'Sorry, we are working on it.' : 'Workout loaded.')
  }, [])

  const applyWorkout = useCallback(async (nextMuscleGroup: MuscleGroup, nextIntensity: Intensity) => {
    const requestId = ++loadRef.current
    try {
      if (userId) {
        let savedRoutine: CustomTrainRoutine | null = null
        try {
          savedRoutine = await getCustomRoutine(userId, nextMuscleGroup)
        } catch {
          // Non-blocking: still show preset workout if custom routine read fails.
          setTrainStatus('Could not load custom routine. Showing preset plan.')
        }
        if (requestId !== loadRef.current) return
        if (savedRoutine) {
          setCustomRoutine(savedRoutine)
          setWorkout(fromCustomRoutineToWorkout(savedRoutine, nextIntensity))
          setIsPresetSession(false)
          setTrainStatus('Loaded your custom routine.')
          return
        }
      }

      setCustomRoutine(null)
      setIsPresetSession(false)
      applyPresetWorkout(nextMuscleGroup, nextIntensity)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate workout.'
      setTrainStatus(message)
    }
  }, [applyPresetWorkout, userId])

  useEffect(() => {
    if (!userId) {
      setLoadUnit('kg')
      return
    }

    void (async () => {
      try {
        const unit = await getUserLoadUnit(userId)
        setLoadUnit(unit)
      } catch {
        setLoadUnit('kg')
      }
    })()
  }, [userId])

  useEffect(() => {
    if (!userId || !customRoutine || !hasPendingSave) return
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          await saveCustomRoutine(userId, customRoutine)
          setHasPendingSave(false)
          setSaveState('saved')
          setTrainStatus('Saved custom routine.')
        } catch {
          setSaveState('error')
          setTrainStatus('Could not save. Retrying on next edit.')
        }
      })()
    }, 500)

    return () => window.clearTimeout(timer)
  }, [customRoutine, hasPendingSave, userId])

  const presetReference = useMemo(() => {
    const baseIntensity = customRoutine?.baseIntensity ?? intensity
    return generateWorkout({ muscleGroup, intensity: baseIntensity })
  }, [customRoutine?.baseIntensity, intensity, muscleGroup])

  const upsertCustomRoutine = useCallback(
    (recipe: (value: CustomTrainRoutine) => CustomTrainRoutine) => {
      if (!workout) return
      const sourceRoutine =
        !customRoutine || isPresetSession || workout.planVariant === 'preset'
          ? fromPresetToCustomRoutine(
              workout,
              userId ?? '',
              loadUnit,
              muscleGroup,
              customRoutine?.baseIntensity ?? intensity
            )
          : customRoutine
      const nextRoutine = recipe(sourceRoutine)
      setCustomRoutine(nextRoutine)
      setWorkout(fromCustomRoutineToWorkout(nextRoutine, intensity))
      setHasPendingSave(Boolean(userId))
      setIsPresetSession(false)
      setSaveState('saving')
      setTrainStatus('Editing your custom routine...')
    },
    [customRoutine, intensity, isPresetSession, loadUnit, muscleGroup, userId, workout]
  )

  const handleSetChange = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      patch: { repsPreset?: RepsPreset; load?: number; loadUnit?: LoadUnit }
    ) => {
      upsertCustomRoutine((value) => ({
        ...value,
        mainExercises: value.mainExercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) return exercise
          const setDetails = (exercise.setDetails ?? []).length > 0
            ? (exercise.setDetails ?? [])
            : Array.from({ length: exercise.sets }, () => ({
                repsPreset: exercise.repsPreset,
                load: exercise.load,
                loadUnit: exercise.loadUnit,
                loadType: exercise.loadType,
              }))
          return {
            ...exercise,
            setDetails: setDetails.map((setDetail, currentSetIndex) =>
              currentSetIndex !== setIndex ? setDetail : { ...setDetail, ...patch }
            ),
          }
        }),
      }))
    },
    [upsertCustomRoutine]
  )

  const handleAddSet = useCallback(
    (exerciseIndex: number) => {
      upsertCustomRoutine((value) => ({
        ...value,
        mainExercises: value.mainExercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) return exercise
          const fallback = {
            repsPreset: exercise.repsPreset,
            load: exercise.load,
            loadUnit: exercise.loadUnit,
            loadType: exercise.loadType,
          }
          const setDetails = (exercise.setDetails ?? []).length > 0
            ? (exercise.setDetails ?? [])
            : Array.from({ length: exercise.sets }, () => fallback)
          const nextSet = setDetails[setDetails.length - 1] ?? fallback
          return {
            ...exercise,
            setDetails: [...setDetails, { ...nextSet }],
          }
        }),
      }))
    },
    [upsertCustomRoutine]
  )

  const handleRemoveSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      upsertCustomRoutine((value) => ({
        ...value,
        mainExercises: value.mainExercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) return exercise
          const setDetails = (exercise.setDetails ?? []).length > 0
            ? (exercise.setDetails ?? [])
            : Array.from({ length: exercise.sets }, () => ({
                repsPreset: exercise.repsPreset,
                load: exercise.load,
                loadUnit: exercise.loadUnit,
                loadType: exercise.loadType,
              }))
          if (setDetails.length <= 1) return exercise
          return {
            ...exercise,
            setDetails: setDetails.filter((_, currentSetIndex) => currentSetIndex !== setIndex),
          }
        }),
      }))
    },
    [upsertCustomRoutine]
  )

  const handleRemoveExercise = useCallback(
    (exerciseIndex: number) => {
      upsertCustomRoutine((value) => {
        if (value.mainExercises.length <= 1) return value
        return {
          ...value,
          mainExercises: value.mainExercises.filter((_, currentExerciseIndex) => currentExerciseIndex !== exerciseIndex),
        }
      })
    },
    [upsertCustomRoutine]
  )

  const handleReplaceExercise = useCallback(
    (exerciseIndex: number, replacement: GeneratedTrainWorkout['plan']['mainExercises'][number]) => {
      upsertCustomRoutine((value) => ({
        ...value,
        mainExercises: value.mainExercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) return exercise
          const currentSetCount =
            (exercise.setDetails ?? []).length > 0 ? (exercise.setDetails ?? []).length : Math.max(1, exercise.sets)
          const fallbackReps: RepsPreset =
            replacement.reps === '5' ||
            replacement.reps === '6-8' ||
            replacement.reps === '8-10' ||
            replacement.reps === '10-12' ||
            replacement.reps === '12-15' ||
            replacement.reps === '15-20' ||
            replacement.reps === 'Max'
              ? replacement.reps
              : '10-12'
          const replacementSeed = replacement.setDetails[0] ?? {
            repsPreset: fallbackReps,
            load: replacement.load,
            loadUnit: replacement.loadUnit,
            loadType: replacement.loadType,
          }
          return {
            ...exercise,
            exercise: replacement.exercise,
            equipment: replacement.equipment,
            activatedRegion: replacement.activatedRegion,
            repsPreset: replacementSeed.repsPreset,
            load: replacementSeed.load,
            loadUnit: replacementSeed.loadUnit,
            loadType: replacementSeed.loadType ?? 'machine',
            setDetails: Array.from({ length: currentSetCount }, () => ({
              repsPreset: replacementSeed.repsPreset,
              load: replacementSeed.load,
              loadUnit: replacementSeed.loadUnit,
              loadType: replacementSeed.loadType ?? 'machine',
            })),
          }
        }),
      }))
    },
    [upsertCustomRoutine]
  )

  const handleSelectIntensity = (nextIntensity: Intensity) => {
    setIntensity(nextIntensity)
    if (!hasSelectedFromMap) return
    if (customRoutine && !isPresetSession) {
      setIsPresetSession(true)
      applyPresetWorkout(muscleGroup, nextIntensity)
      setTrainStatus('Showing preset plan.')
      return
    }
    applyPresetWorkout(muscleGroup, nextIntensity)
  }

  const handleSelectMine = () => {
    if (!customRoutine) return
    setIsPresetSession(false)
    setWorkout(fromCustomRoutineToWorkout(customRoutine, intensity))
    setTrainStatus('Loaded your custom routine.')
  }

  const handleSelectMuscleFromMap = (group: MuscleGroup) => {
    setMuscleGroup(group)
    setHasSelectedFromMap(true)
    setIsFocusExpanded(false)
    void applyWorkout(group, intensity)
  }

  return (
    <>
      <TrainMuscleSelectCard
        selectedMuscle={hasSelectedFromMap ? muscleGroup : null}
        isExpanded={isFocusExpanded}
        intensity={intensity}
        hasMineOption={Boolean(customRoutine)}
        isMineSelected={Boolean(customRoutine) && !isPresetSession}
        mineLabel={mineLabel}
        view={muscleView}
        onSelectMuscle={handleSelectMuscleFromMap}
        onExpand={() => setIsFocusExpanded(true)}
        onFlip={() => setMuscleView((prev) => (prev === 'front' ? 'back' : 'front'))}
        onSelectIntensity={handleSelectIntensity}
        onSelectMine={handleSelectMine}
      />

      {hasSelectedFromMap ? (
        <TrainPlanCard
          workout={workout}
          saveState={saveState}
          alternativeOptions={presetReference.plan.alternatives}
          warmupOptions={presetReference.plan.warmup}
          stretchOptions={presetReference.plan.postWorkoutStretch}
          onChangeSet={handleSetChange}
          onAddSet={handleAddSet}
          onRemoveSet={handleRemoveSet}
          onRemoveExercise={handleRemoveExercise}
          onReplaceExercise={handleReplaceExercise}
        />
      ) : (
        <section className="card">
          <p className="muted">{trainStatus}</p>
        </section>
      )}
    </>
  )
}
