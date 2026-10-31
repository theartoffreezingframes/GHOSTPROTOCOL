import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Only the weights the design actually renders are shipped.
// Display (Space Grotesk): 300 light numerals, 400 default, 500 for headlines.
// Body (Inter): 300 for long-form copy. Labels (JetBrains Mono): 400.
import '@fontsource/space-grotesk/latin-300.css'
import '@fontsource/space-grotesk/latin-400.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/inter/latin-300.css'
import '@fontsource/jetbrains-mono/latin-400.css'

import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
