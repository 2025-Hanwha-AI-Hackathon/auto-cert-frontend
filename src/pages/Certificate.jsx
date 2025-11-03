import { useState } from 'react'
import CertificateCard from '../components/CertificateCard'
import '../App.css'

// Sample certificate data (replace with real data or fetch from API)
const SAMPLE_CERTS = [
  {
    id: 'cert-1',
    name: 'example.com',
    issuer: 'Let\'s Encrypt',
    validFrom: '2025-01-01',
    validTo: '2026-01-01',
    status: 'valid',
  },
  {
    id: 'cert-2',
    name: 'api.example.com',
    issuer: 'Acme CA',
    validFrom: '2024-08-15',
    validTo: '2025-08-15',
    status: 'expiring',
  },
]

export default function Certificate() {
  const [certs] = useState(SAMPLE_CERTS)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(certs[0]?.id || null)

  const filtered = certs.filter(
    (c) => c.name.includes(query) || c.issuer.includes(query),
  )

  const selected = certs.find((c) => c.id === selectedId) || filtered[0]

  return (
    <div className="cert-page">
      <div className="cert-header">
        <h2>Certificates</h2>
        <div className="cert-actions">
          <input
            aria-label="Search certificates"
            placeholder="Search by domain or issuer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="cert-search"
          />
        </div>
      </div>

      <div className="cert-grid">
        <aside className="cert-list">
          {filtered.length === 0 && <p>No certificates found.</p>}
          {filtered.map((c) => (
            <button
              key={c.id}
              className={`cert-list-item ${c.id === selectedId ? 'active' : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              <CertificateCard cert={c} compact />
            </button>
          ))}
        </aside>

        <section className="cert-detail">
          {selected ? (
            <div>
              <h3>{selected.name}</h3>
              <p>
                <strong>Issuer:</strong> {selected.issuer}
              </p>
              <p>
                <strong>Valid from:</strong> {selected.validFrom}
              </p>
              <p>
                <strong>Valid to:</strong> {selected.validTo}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge badge-${selected.status}`}>{selected.status}</span>
              </p>

              <div style={{ marginTop: 16 }}>
                <button className="btn-primary">Download PEM</button>
                <button className="btn-ghost" style={{ marginLeft: 8 }}>
                  Re-check
                </button>
              </div>
            </div>
          ) : (
            <p>Select a certificate to view details.</p>
          )}
        </section>
      </div>
    </div>
  )
}
