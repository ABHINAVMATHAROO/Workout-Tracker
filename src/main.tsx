import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// Temporary manifest debugging to diagnose "manifest syntax" errors in browser.
if (typeof window !== 'undefined') {
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  const manifestHref = manifestLink?.href ?? '(missing manifest link)'
  console.info('[manifest-debug] href:', manifestHref)

  if (manifestLink?.href) {
    fetch(manifestLink.href, { cache: 'no-store' })
      .then(async (response) => {
        const contentType = response.headers.get('content-type') ?? '(none)'
        const body = await response.text()
        console.info('[manifest-debug] status:', response.status)
        console.info('[manifest-debug] content-type:', contentType)
        console.info('[manifest-debug] first-120:', body.slice(0, 120))
        try {
          JSON.parse(body)
          console.info('[manifest-debug] JSON parse: ok')
        } catch (error) {
          console.error('[manifest-debug] JSON parse failed:', error)
        }
      })
      .catch((error) => {
        console.error('[manifest-debug] fetch failed:', error)
      })
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

const bootSplash = document.getElementById('boot-splash')
if (bootSplash) {
  requestAnimationFrame(() => {
    bootSplash.classList.add('hidden')
    window.setTimeout(() => bootSplash.remove(), 220)
  })
}
