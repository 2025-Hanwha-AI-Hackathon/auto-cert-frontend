import { Link } from 'react-router-dom'
import '../App.css'

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1>404 — Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p>
        <Link to="/">Go back home</Link>
      </p>
    </div>
  )
}
