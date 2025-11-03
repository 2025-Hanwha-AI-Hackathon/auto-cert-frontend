import '../App.css'

export default function CertificateCard({ cert, compact }) {
  return (
    <div className={`cert-card ${compact ? 'compact' : ''}`}>
      <div className="cert-card-main">
        <div className="cert-name">{cert.name}</div>
        <div className="cert-issuer">{cert.issuer}</div>
      </div>
      <div className="cert-meta">
        <small>{cert.validTo}</small>
        <span className={`badge badge-${cert.status}`}>{cert.status}</span>
      </div>
    </div>
  )
}
