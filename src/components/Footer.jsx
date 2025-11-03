import '../App.css'

export default function Footer() {
  return (
    <footer style={{ padding: 12, marginTop: 24, borderTop: '1px solid #eee' }}>
      <small>© {new Date().getFullYear()} My React App</small>
    </footer>
  )
}
