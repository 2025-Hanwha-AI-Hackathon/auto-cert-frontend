import { Link } from 'react-router-dom'
import '../App.css'

export default function Header() {
  return (
    <header>
      <nav style={{ padding: 12 }}>
        <Link to="/" style={{ marginRight: 8 }}>
          Home
        </Link>
        <Link to="/about" style={{ marginRight: 8 }}>
          About
        </Link>
        <Link to="/certificates">Certificates</Link>
      </nav>
    </header>
  )
}
