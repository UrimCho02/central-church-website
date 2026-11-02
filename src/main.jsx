import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PastorPage from './PastorPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).has('pastor') ? <PastorPage /> : <App />}
  </StrictMode>,
)
