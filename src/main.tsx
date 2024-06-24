import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'

import ServerProvider from './providers/server/ServerProvider.js'
import BabylonProvider from './providers/babylon/BabylonProvider.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ServerProvider>
    <BabylonProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BabylonProvider>
  </ServerProvider>,
)
