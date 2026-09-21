import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { unlockAudio } from './audio.js'
import './styles.css'

// iOS only allows audio after a tap, so unlock it on the first one
for (const type of ['touchend', 'click']) {
  window.addEventListener(type, () => unlockAudio(), { once: true })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
