import { Shield, Calendar, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "../styles/CertificateCard.css";

export function CertificateCard({ certificate, onRenew, onViewDetails, hasServer, httpsTestFailed }) {
  const badgeRef = useRef(null);
  const warningRef = useRef(null);
  const [badgeWrapped, setBadgeWrapped] = useState(false);
  const [warningWrapped, setWarningWrapped] = useState(false);

  // 줄바꿈 감지 함수
  const checkWrapping = (element, setWrapped, textSelector) => {
    if (!element) return;
    const textElement = element.querySelector(textSelector);
    if (textElement) {
      // 텍스트 요소의 실제 너비가 부모 요소의 너비보다 크면 줄바꿈 발생
      const textWidth = textElement.scrollWidth;
      const containerWidth = element.clientWidth;
      
      // 약간의 여유를 두고 비교 (1px 여유)
      if (textWidth > containerWidth + 1) {
        setWrapped(true);
      } else {
        setWrapped(false);
      }
    }
  };

  useEffect(() => {
    const checkElements = () => {
      if (badgeRef.current) {
        checkWrapping(badgeRef.current, setBadgeWrapped, '.badge-text');
      }
      if (warningRef.current) {
        checkWrapping(warningRef.current, setWarningWrapped, '.warning-text');
      }
    };

    checkElements();
    window.addEventListener('resize', checkElements);
    // 약간의 지연 후 다시 체크 (렌더링 완료 후)
    const timeout = setTimeout(checkElements, 100);

    return () => {
      window.removeEventListener('resize', checkElements);
      clearTimeout(timeout);
    };
  }, [certificate]);
  const getStatusBadge = (status) => {
    const badgeClass = `badge responsive-badge ${badgeWrapped ? 'wrapped' : ''}`;
    switch (status) {
      case 'valid':
        return (
          <span ref={badgeRef} className={`${badgeClass} badge-valid`}>
            <CheckCircle2 className="badge-icon" />
            <span className="badge-text">유효</span>
          </span>
        );
      case 'expiring-soon':
        return (
          <span ref={badgeRef} className={`${badgeClass} badge-expiring`}>
            <AlertTriangle className="badge-icon" />
            <span className="badge-text">곧 만료</span>
          </span>
        );
      case 'expired':
        return (
          <span ref={badgeRef} className={`${badgeClass} badge-expired`}>
            <XCircle className="badge-icon" />
            <span className="badge-text">만료됨</span>
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
          <div className="card-info">
            <h3>{certificate.name}</h3>
            {certificate.domain && (
              <p>{certificate.domain}</p>
            )}
            {(!hasServer || httpsTestFailed) && (
              <p ref={warningRef} className={`card-warning-message responsive-warning ${warningWrapped ? 'wrapped' : ''}`}>
                <AlertCircle size={18} className="warning-icon" />
                <span className="warning-text">인증서가 서버에 적용되지 않았습니다.</span>
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
          {getStatusBadge(certificate.status)}
        </div>
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
          <div className="detail-row remaining-days-row">
            <span className="detail-label">남은 기간</span>
            {certificate.status === 'expired' ? (
              <span className="detail-value remaining-days-expired">만료됨</span>
            ) : (
              <span className={daysRemaining <= 30 ? "detail-value remaining-days-warning" : "detail-value"}>
                {daysRemaining}일
              </span>
            )}
          </div>
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
        >
          {hasServer ? '인증서 갱신' : '인증서 적용'}
        </button>
      </div>
    </div>
  );
}
