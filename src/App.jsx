import React, { useState, useEffect } from "react";
import { CertificateCard } from "./components/CertificateCard";
import { CertificateStats } from "./components/CertificateStats";
import ChatSidebar from "./components/ChatSidebar";
import { Plus, Search, Shield } from "lucide-react";
import { 
  getCertificates, 
  createCertificate, 
  renewCertificate, 
  deleteCertificate,
  getCertificate as fetchCertificate 
} from "./services/api";
import "./styles/App.css";

/**
 * API 응답을 프론트엔드 데이터 형식으로 변환
 */
function transformCertificateFromAPI(apiCert) {
  // 날짜 형식 변환 (ISO 8601 -> YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 도메인에서 이름 생성 (도메인이 없으면 "인증서 ID" 사용)
  const name = apiCert.domain || `인증서 #${apiCert.id}`;
  
  return {
    id: String(apiCert.id),
    name: name,
    type: apiCert.domain ? "SSL/TLS 인증서" : "Code Signing 인증서",
    domain: apiCert.domain || null,
    issuer: apiCert.issuer || 'Unknown',
    issueDate: formatDate(apiCert.issuedAt),
    expiryDate: formatDate(apiCert.expiresAt),
    status: apiCert.status || 'valid',
    // API의 추가 필드 유지
    renewalAttempts: apiCert.renewalAttempts,
    lastError: apiCert.lastError,
    createdAt: apiCert.createdAt,
    updatedAt: apiCert.updatedAt,
  };
}

export default function App() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    domain: '',
    challengeType: ''
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [renewMethod, setRenewMethod] = useState("auto");
  const [notificationDays, setNotificationDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API에서 인증서 목록 가져오기
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCertificates(0, 100); // 첫 페이지, 최대 100개
      const transformedCerts = response.content.map(transformCertificateFromAPI);
      setCertificates(transformedCerts);
    } catch (err) {
      console.error('인증서 목록 조회 실패:', err);
      setError(err.message || '인증서 목록을 불러오는데 실패했습니다.');
      // 에러가 발생해도 빈 배열로 설정
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === 'valid').length,
    expiringSoon: certificates.filter(c => c.status === 'expiring-soon').length,
    expired: certificates.filter(c => c.status === 'expired').length
  };

  // 필터링된 인증서
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || cert.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleRenew = (id) => {
    setSelectedCertId(id);
    setRenewDialogOpen(true);
  };

  const confirmRenew = async () => {
    if (!selectedCertId) return;

    try {
      const certId = parseInt(selectedCertId);
      const renewedCert = await renewCertificate(certId);
      const transformed = transformCertificateFromAPI(renewedCert);
      
      setCertificates(prev => prev.map(cert => 
        cert.id === selectedCertId ? transformed : cert
      ));
      
      alert("인증서가 성공적으로 갱신되었습니다!");
      setRenewDialogOpen(false);
      setSelectedCertId(null);
    } catch (err) {
      console.error('인증서 갱신 실패:', err);
      alert(`인증서 갱신에 실패했습니다: ${err.message}`);
    }
  };

  // AI 채팅에서 사용할 인증서 갱신 함수
  const handleChatRenew = async (certificateId) => {
    try {
      const certId = parseInt(certificateId);
      const renewedCert = await renewCertificate(certId);
      const transformed = transformCertificateFromAPI(renewedCert);
      
      setCertificates(prev => prev.map(c => 
        c.id === certificateId ? transformed : c
      ));
      return true;
    } catch (err) {
      console.error('인증서 갱신 실패:', err);
      return false;
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const certId = parseInt(id);
      const certData = await fetchCertificate(certId);
      const transformed = transformCertificateFromAPI(certData);
      setSelectedCertificate(transformed);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('인증서 상세 조회 실패:', err);
      alert(`인증서 상세 정보를 불러오는데 실패했습니다: ${err.message}`);
    }
  };

  const handleAddCertificate = async () => {
    if (!addFormData.domain.trim()) {
      alert('도메인은 필수 입력 항목입니다.');
      return;
    }

    // 도메인 형식 검증
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainPattern.test(addFormData.domain)) {
      alert('올바른 도메인 형식을 입력해주세요. (예: example.com)');
      return;
    }

    try {
      setIsSubmitting(true);
      const newCert = await createCertificate({
        domain: addFormData.domain.trim(),
        challengeType: addFormData.challengeType || undefined
      });
      
      const transformed = transformCertificateFromAPI(newCert);
      setCertificates(prev => [transformed, ...prev]);
      
      alert("새 인증서가 성공적으로 추가되었습니다!");
      setAddDialogOpen(false);
      setAddFormData({ domain: '', challengeType: '' });
    } catch (err) {
      console.error('인증서 생성 실패:', err);
      alert(`인증서 추가에 실패했습니다: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('정말로 이 인증서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const certId = parseInt(id);
      await deleteCertificate(certId);
      
      setCertificates(prev => prev.filter(cert => cert.id !== id));
      alert("인증서가 성공적으로 삭제되었습니다!");
      
      // 상세 다이얼로그가 열려있으면 닫기
      if (detailDialogOpen && selectedCertificate?.id === id) {
        setDetailDialogOpen(false);
        setSelectedCertificate(null);
      }
    } catch (err) {
      console.error('인증서 삭제 실패:', err);
      alert(`인증서 삭제에 실패했습니다: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-left">
              <div className="header-icon">
                <Shield style={{ width: '2rem', height: '2rem', color: 'white' }} />
              </div>
              <div className="header-title">
                <h1>인증서 관리 시스템</h1>
                <p className="header-subtitle">Certificate Management Dashboard</p>
              </div>
            </div>
            <button 
              onClick={() => setAddDialogOpen(true)}
              className="btn btn-primary"
            >
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              새 인증서 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {/* 통계 */}
        <div className="stats-section">
          <CertificateStats {...stats} />
        </div>

        {/* 필터 및 검색 */}
        <div className="filter-section">
          <div className="filter-controls">
            <div className="search-wrapper">
              <Search className="search-icon" style={{ width: '1rem', height: '1rem' }} />
              <input
                type="text"
                placeholder="인증서 이름, 도메인으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">전체</option>
              <option value="valid">유효</option>
              <option value="expiring-soon">곧 만료</option>
              <option value="expired">만료됨</option>
            </select>
          </div>
        </div>

        {/* 인증서 목록 */}
        <div className="certificates-grid">
          {filteredCertificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onRenew={handleRenew}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {loading && (
          <div className="empty-state">
            <Shield className="empty-state-icon" />
            <h3>로딩 중...</h3>
            <p>인증서 정보를 불러오는 중입니다.</p>
          </div>
        )}

        {error && !loading && (
          <div className="empty-state">
            <Shield className="empty-state-icon" />
            <h3>오류 발생</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadCertificates} style={{ marginTop: '1rem' }}>
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && filteredCertificates.length === 0 && (
          <div className="empty-state">
            <Shield className="empty-state-icon" />
            <h3>인증서가 없습니다</h3>
            <p>검색 조건을 변경하거나 새 인증서를 추가해보세요.</p>
          </div>
        )}
      </main>

      {/* 갱신 다이얼로그 */}
      {renewDialogOpen && (
        <div className="dialog-overlay" onClick={() => setRenewDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">인증서 갱신</h2>
              <p className="dialog-description">
                이 인증서를 갱신하시겠습니까? 갱신 후 새로운 만료일이 설정됩니다.
              </p>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">갱신 방법</label>
                <select 
                  value={renewMethod}
                  onChange={(e) => setRenewMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="auto">자동 갱신</option>
                  <option value="manual">수동 갱신</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">알림 설정</label>
                <select 
                  value={notificationDays}
                  onChange={(e) => setNotificationDays(e.target.value)}
                  className="form-select"
                >
                  <option value="7">7일 전</option>
                  <option value="30">30일 전</option>
                  <option value="60">60일 전</option>
                </select>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={() => setRenewDialogOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={confirmRenew}>
                갱신 확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추가 다이얼로그 */}
      {addDialogOpen && (
        <div className="dialog-overlay" onClick={() => setAddDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">새 인증서 추가</h2>
              <p className="dialog-description">
                새로운 인증서 정보를 입력하세요.
              </p>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">
                  도메인 <span style={{ color: 'red' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="example.com" 
                  className="form-input"
                  value={addFormData.domain}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, domain: e.target.value }))}
                  disabled={isSubmitting}
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  인증서를 발급받을 도메인을 입력하세요. (예: example.com, www.example.com)
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">챌린지 타입 (선택사항)</label>
                <select 
                  className="form-select"
                  value={addFormData.challengeType}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, challengeType: e.target.value }))}
                  disabled={isSubmitting}
                >
                  <option value="">선택 안함</option>
                  <option value="HTTP">HTTP-01</option>
                  <option value="DNS">DNS-01</option>
                </select>
                <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  ACME 챌린지 타입을 선택하세요. 비워두면 기본값이 사용됩니다.
                </small>
              </div>
            </div>
            <div className="dialog-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setAddDialogOpen(false);
                  setAddFormData({ domain: '', challengeType: '' });
                }}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddCertificate}
                disabled={isSubmitting || !addFormData.domain.trim()}
              >
                {isSubmitting ? '추가 중...' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 정보 다이얼로그 */}
      {detailDialogOpen && selectedCertificate && (
        <div className="dialog-overlay" onClick={() => setDetailDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">인증서 상세 정보</h2>
              <p className="dialog-description">
                {selectedCertificate.name}의 상세 정보입니다.
              </p>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">인증서 ID</label>
                <div className="form-value">{selectedCertificate.id}</div>
              </div>
              <div className="form-group">
                <label className="form-label">도메인</label>
                <div className="form-value">{selectedCertificate.domain || 'N/A'}</div>
              </div>
              <div className="form-group">
                <label className="form-label">유형</label>
                <div className="form-value">{selectedCertificate.type}</div>
              </div>
              <div className="form-group">
                <label className="form-label">발급 기관</label>
                <div className="form-value">{selectedCertificate.issuer}</div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">발급일</label>
                  <div className="form-value">{selectedCertificate.issueDate || 'N/A'}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">만료일</label>
                  <div className="form-value">{selectedCertificate.expiryDate || 'N/A'}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">상태</label>
                <div className="form-value">
                  <span className={`badge ${
                    selectedCertificate.status === 'valid' ? 'badge-valid' :
                    selectedCertificate.status === 'expiring-soon' ? 'badge-expiring' :
                    'badge-expired'
                  }`}>
                    {selectedCertificate.status === 'valid' ? '유효' :
                     selectedCertificate.status === 'expiring-soon' ? '곧 만료' :
                     '만료됨'}
                  </span>
                </div>
              </div>
              {selectedCertificate.renewalAttempts !== undefined && (
                <div className="form-group">
                  <label className="form-label">갱신 시도 횟수</label>
                  <div className="form-value">{selectedCertificate.renewalAttempts || 0}</div>
                </div>
              )}
              {selectedCertificate.lastError && (
                <div className="form-group">
                  <label className="form-label">최근 오류</label>
                  <div className="form-value" style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                    {selectedCertificate.lastError}
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-footer" style={{ justifyContent: 'space-between' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => handleDeleteCertificate(selectedCertificate.id)}
                style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}
              >
                삭제
              </button>
              <button className="btn btn-outline" onClick={() => setDetailDialogOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT 사이드바 */}
      <ChatSidebar 
        onFilterChange={setFilterStatus}
        stats={stats}
        certificates={certificates}
        onRenewCertificate={handleChatRenew}
      />
    </div>
  );
}
