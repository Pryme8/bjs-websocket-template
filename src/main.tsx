import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'

import ServerProvider from './providers/ServerProvider.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ServerProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ServerProvider>,
)
