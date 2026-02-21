import { useMemo, useState } from 'react'
import TrainInputCard from './components/TrainInputCard'
import TrainPlanCard from './components/TrainPlanCard'
import TrainCoachCard from './components/TrainCoachCard'
import { createCoachWeb } from './coachWeb'
import { generateWorkout } from './generateWorkout'
import type { GeneratedTrainWorkout, Intensity, MuscleGroup } from './types'

const getPromptForIndex = (workout: GeneratedTrainWorkout, index: number) => {
  if (workout.plan.mainExercises.length === 0) {
    return 'Sorry, we are working on it.'
  }
  const safeIndex = Math.max(0, Math.min(index, workout.plan.mainExercises.length - 1))
  const item = workout.plan.mainExercises[safeIndex]
  return `Great pace. Up next: ${item.exercise}. ${item.sets} sets of ${item.reps} reps.`
}

export default function TrainModeView() {
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest')
  const [intensity, setIntensity] = useState<Intensity>('Beginner')
  const [workout, setWorkout] = useState<GeneratedTrainWorkout | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [coachStarted, setCoachStarted] = useState(false)
  const [coachStatus, setCoachStatus] = useState(
    'Tap Start Coach to enable voice prompts. If audio is blocked, prompts stay visible as text.'
  )

  const coach = useMemo(() => createCoachWeb(), [])

  const applyWorkout = (nextMuscleGroup: MuscleGroup, nextIntensity: Intensity) => {
    try {
      const nextWorkout = generateWorkout({ muscleGroup: nextMuscleGroup, intensity: nextIntensity })
      setWorkout(nextWorkout)
      setActiveIndex(0)
      setCoachStatus(
        nextWorkout.plan.source === 'unavailable'
          ? 'Sorry, we are working on it.'
          : 'Workout ready. Start Coach for spoken prompts, then use Next prompt per exercise.'
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate workout.'
      setCoachStatus(message)
    }
  }

  const handleGenerate = () => {
    applyWorkout(muscleGroup, intensity)
  }

  const handleSelectMuscleGroup = (group: MuscleGroup) => {
    setMuscleGroup(group)
    if (!workout) return
    applyWorkout(group, intensity)
  }

  const handleSelectIntensity = (nextIntensity: Intensity) => {
    setIntensity(nextIntensity)
    if (!workout) return
    applyWorkout(muscleGroup, nextIntensity)
  }

  const handleStartCoach = () => {
    void (async () => {
      const available = await coach.start()
      setCoachStarted(true)

      if (!available) {
        setCoachStatus('Speech is unavailable on this browser/device. Use text prompts in the workout plan.')
        return
      }

      if (!workout) {
        setCoachStatus('Coach is ready. Generate a workout to begin prompts.')
        return
      }
      if (workout.plan.mainExercises.length === 0) {
        setCoachStatus('Sorry, we are working on it.')
        return
      }

      const line = getPromptForIndex(workout, 0)
      setCoachStatus(line)
      await coach.speak(line)
    })()
  }

  const handleNextPrompt = () => {
    if (!workout) {
      setCoachStatus('Generate a workout first.')
      return
    }
    if (workout.plan.mainExercises.length === 0) {
      setCoachStatus('Sorry, we are working on it.')
      return
    }

    const maxIndex = workout.plan.mainExercises.length - 1
    const nextIndex = Math.min(activeIndex + 1, maxIndex)
    setActiveIndex(nextIndex)
    const line = getPromptForIndex(workout, nextIndex)
    setCoachStatus(line)

    void (async () => {
      const result = await coach.speak(line)
      if (!result.spoken && result.reason) {
        setCoachStatus(`${line} ${result.reason}`)
      }
    })()
  }

  const handleStopCoach = () => {
    coach.stop()
    setCoachStarted(false)
    setCoachStatus('Coach stopped. Tap Start Coach to resume prompts.')
  }

  return (
    <>
      <TrainInputCard
        muscleGroup={muscleGroup}
        intensity={intensity}
        onSelectMuscleGroup={handleSelectMuscleGroup}
        onSelectIntensity={handleSelectIntensity}
        onGenerate={handleGenerate}
      />
      <TrainPlanCard workout={workout} activeIndex={activeIndex} />
      <TrainCoachCard
        canStart={!coachStarted}
        canAdvance={coachStarted && workout !== null && workout.plan.mainExercises.length > 0}
        onStartCoach={handleStartCoach}
        onNextPrompt={handleNextPrompt}
        onStopCoach={handleStopCoach}
        status={coachStatus}
      />
    </>
  )
}
