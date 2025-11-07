import React, { useState } from "react";
import { CertificateCard } from "./components/CertificateCard";
import { CertificateStats } from "./components/CertificateStats";
import ChatSidebar from "./components/ChatSidebar";
import { Plus, Search, Shield } from "lucide-react";
import "./styles/App.css";

// 목업 데이터
const initialCertificates = [
  {
    id: "1",
    name: "메인 웹사이트 SSL",
    type: "SSL/TLS 인증서",
    domain: "www.example.com",
    issuer: "Let's Encrypt",
    issueDate: "2024-05-01",
    expiryDate: "2025-05-01",
    status: "valid"
  },
  {
    id: "2",
    name: "API 서버 인증서",
    type: "SSL/TLS 인증서",
    domain: "api.example.com",
    issuer: "DigiCert",
    issueDate: "2024-10-15",
    expiryDate: "2025-12-15",
    status: "valid"
  },
  {
    id: "3",
    name: "개발 환경 인증서",
    type: "SSL/TLS 인증서",
    domain: "dev.example.com",
    issuer: "Let's Encrypt",
    issueDate: "2024-11-01",
    expiryDate: "2025-11-20",
    status: "expiring-soon"
  },
  {
    id: "4",
    name: "모바일 앱 코드 사이닝",
    type: "Code Signing 인증서",
    issuer: "Apple Developer",
    issueDate: "2023-11-01",
    expiryDate: "2024-11-01",
    status: "expired"
  },
  {
    id: "5",
    name: "스테이징 서버",
    type: "SSL/TLS 인증서",
    domain: "staging.example.com",
    issuer: "Let's Encrypt",
    issueDate: "2024-09-10",
    expiryDate: "2025-11-30",
    status: "expiring-soon"
  },
  {
    id: "6",
    name: "Admin 대시보드",
    type: "SSL/TLS 인증서",
    domain: "admin.example.com",
    issuer: "Comodo",
    issueDate: "2024-03-01",
    expiryDate: "2026-03-01",
    status: "valid"
  }
];

export default function App() {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [renewMethod, setRenewMethod] = useState("auto");
  const [notificationDays, setNotificationDays] = useState("30");

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

  const confirmRenew = () => {
    if (selectedCertId) {
      setCertificates(prev => prev.map(cert => 
        cert.id === selectedCertId 
          ? { ...cert, status: 'valid', expiryDate: '2026-11-05' }
          : cert
      ));
      alert("인증서가 성공적으로 갱신되었습니다!");
      setRenewDialogOpen(false);
      setSelectedCertId(null);
    }
  };

  const handleViewDetails = (id) => {
    const cert = certificates.find(c => c.id === id);
    if (cert) {
      alert(`${cert.name}의 상세 정보를 조회합니다.`);
    }
  };

  const handleAddCertificate = () => {
    alert("새 인증서가 추가되었습니다!");
    setAddDialogOpen(false);
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

        {filteredCertificates.length === 0 && (
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
                <label className="form-label">인증서 이름</label>
                <input type="text" placeholder="예: 메인 웹사이트 SSL" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">인증서 유형</label>
                <select className="form-select">
                  <option value="ssl">SSL/TLS 인증서</option>
                  <option value="code">Code Signing 인증서</option>
                  <option value="email">Email 인증서</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">도메인 (선택사항)</label>
                <input type="text" placeholder="www.example.com" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">발급 기관</label>
                <input type="text" placeholder="Let's Encrypt, DigiCert 등" className="form-input" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">발급일</label>
                  <input type="date" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">만료일</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={() => setAddDialogOpen(false)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={handleAddCertificate}>
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT 사이드바 */}
      <ChatSidebar 
        onFilterChange={setFilterStatus}
        stats={stats}
      />
    </div>
  );
}
