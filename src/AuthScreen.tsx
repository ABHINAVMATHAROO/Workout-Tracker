import Hyperspeed, { type HyperspeedOptions } from './hyperspeed/background'

type AuthVariant = 'loading' | 'signed-out' | 'pending-profile'

type AuthScreenProps = {
  variant: AuthVariant
  onSignIn: () => void
  onCreateProfile: () => void
  onDeclineProfile: () => void
  effectOptions?: Partial<HyperspeedOptions>
}

export default function AuthScreen({
  variant,
  onSignIn,
  onCreateProfile,
  onDeclineProfile,
  effectOptions,
}: AuthScreenProps) {
  return (
    <div className="auth-screen">
      <div className="auth-bg" aria-hidden="true">
        <Hyperspeed effectOptions={effectOptions} />
      </div>
      {variant === 'signed-out' ? (
        <div className="auth-screen-content auth-screen-full">
          <div className="auth-layout">
            <div className="auth-top">
              <div className="auth-logo">
                <span className="auth-logo-mark-wrap" aria-hidden="true">
                  <img
                    className="auth-logo-mark"
                    src={`${import.meta.env.BASE_URL}cadax.svg`}
                    alt=""
                  />
                </span>
                <span className="auth-logo-text">CADAX</span>
              </div>
            </div>
            <div className="auth-middle">
              <p className="muted auth-tagline">No nonsense workout tracker</p>
            </div>
            <div className="auth-bottom">
              <button className="cta auth-cta" onClick={onSignIn}>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      ) : variant === 'loading' ? (
        <div className="auth-screen-content auth-screen-full">
          <div className="auth-layout">
            <div className="auth-top">
              <div className="auth-logo">
                <span className="auth-logo-mark-wrap" aria-hidden="true">
                  <img
                    className="auth-logo-mark"
                    src={`${import.meta.env.BASE_URL}cadax.svg`}
                    alt=""
                  />
                </span>
                <span className="auth-logo-text">CADAX</span>
              </div>
            </div>
            <div className="auth-middle">
              <p className="muted auth-tagline">No nonsense workout tracker</p>
            </div>
            <div className="auth-bottom">
              <button className="cta auth-cta auth-cta-loading" type="button" disabled>
                <span className="auth-cta-title">Welcome back</span>
                <span className="auth-cta-subtitle">
                  Signing you in with your Google account
                  <span className="auth-cta-spinner" aria-hidden="true" />
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="app auth-screen-content">
          <div className="card auth-card auth-card--transparent">
            {variant === 'pending-profile' ? (
              <>
                <p className="eyebrow">Almost there</p>
                <h1>Create your account?</h1>
                <p className="muted">
                  We found your Google account but not an app profile yet. Want to create
                  one now?
                </p>
                <div className="auth-actions">
                  <button className="cta" onClick={onCreateProfile}>
                    Create account
                  </button>
                  <button className="ghost" onClick={onDeclineProfile}>
                    Not now
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
