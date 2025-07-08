import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './style.css'

// Remove problematic utility imports that cause errors
// These will be loaded only when needed by specific admin pages

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
)
