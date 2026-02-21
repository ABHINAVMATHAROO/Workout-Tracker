type FloatingModeNavProps = {
  mode: 'log' | 'train'
  onChangeMode: (mode: 'log' | 'train') => void
}

export default function FloatingModeNav({ mode, onChangeMode }: FloatingModeNavProps) {
  return (
    <nav className="floating-mode-nav" aria-label="Mode navigation">
      <button
        type="button"
        className={`floating-mode-btn mode-log ${mode === 'log' ? 'is-active' : ''}`}
        onClick={() => onChangeMode('log')}
        aria-pressed={mode === 'log'}
      >
        Log
      </button>
      <button
        type="button"
        className={`floating-mode-btn mode-train ${mode === 'train' ? 'is-active' : ''}`}
        onClick={() => onChangeMode('train')}
        aria-pressed={mode === 'train'}
      >
        Train
      </button>
    </nav>
  )
}
