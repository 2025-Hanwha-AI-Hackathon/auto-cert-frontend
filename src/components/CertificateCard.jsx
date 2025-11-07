import { Shield, Calendar, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import "../styles/CertificateCard.css";

export function CertificateCard({ certificate, onRenew, onViewDetails }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return (
          <span className="badge badge-valid">
            <CheckCircle2 className="badge-icon" />
            유효
          </span>
        );
      case 'expiring-soon':
        return (
          <span className="badge badge-expiring">
            <AlertTriangle className="badge-icon" />
            곧 만료
          </span>
        );
      case 'expired':
        return (
          <span className="badge badge-expired">
            <XCircle className="badge-icon" />
            만료됨
          </span>
        );
    }
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const expiry = new Date(certificate.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="certificate-card">
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon-wrapper">
            <Shield className="card-icon" />
          </div>
          <div className="card-info">
            <h3>{certificate.name}</h3>
            <p>{certificate.type}</p>
            {certificate.domain && (
              <p>{certificate.domain}</p>
            )}
          </div>
        </div>
        {getStatusBadge(certificate.status)}
      </div>

      <div className="card-body">
        <div className="card-details">
          <div className="detail-row">
            <span className="detail-label">발급 기관</span>
            <span className="detail-value">{certificate.issuer}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">발급일</span>
            <span className="detail-value">{certificate.issueDate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">만료일</span>
            <div className="detail-with-icon">
              <Calendar className="detail-icon" />
              <span className="detail-value">{certificate.expiryDate}</span>
            </div>
          </div>
          {certificate.status !== 'expired' && (
            <div className="detail-row remaining-days-row">
              <span className="detail-label">남은 기간</span>
              <span className={daysRemaining <= 30 ? "detail-value remaining-days-warning" : "detail-value"}>
                {daysRemaining}일
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button
          onClick={() => onViewDetails(certificate.id)}
          className="btn btn-outline"
        >
          상세 보기
        </button>
        <button
          onClick={() => onRenew(certificate.id)}
          className="btn btn-primary"
          disabled={certificate.status === 'valid' && daysRemaining > 30}
        >
          갱신하기
        </button>
      </div>
    </div>
  );
}
