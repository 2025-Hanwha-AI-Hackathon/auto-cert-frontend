import React, { useState, useEffect } from 'react';
import { Server, Plus, X, Trash2, Edit, Loader2, Search } from 'lucide-react';
import '../styles/ServerManagement.css';

export function ServerManagement({ 
  servers, 
  onAddServer, 
  onUpdateServer, 
  onDeleteServer,
  isLoading,
  isAddingServer,
  serverToEdit: externalServerToEdit,
  onServerEditComplete
}) {
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // "name", "host", "type"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc", "desc"
  const [searchQuery, setSearchQuery] = useState("");
  const [serverFormData, setServerFormData] = useState({
    name: '',
    serverType: 'nginx',
    serverTypeOther: '', // '기타' 선택 시 입력값
    description: '',
    host: '', // SSH 정보로 이동
    sshUsername: '',
    sshPort: 22,
    deployPath: '',
    sshAuthType: 'password', // 'password' or 'key'
    sshPassword: '',
    sshPublicKey: ''
  });

  const handleAddServer = () => {
    // 필수 필드 검증
    if (!serverFormData.name.trim()) {
      alert('서버 이름은 필수 입력 항목입니다.');
      return;
    }
    
    if (!serverFormData.name.trim()) {
      alert('서버 이름은 필수 입력 항목입니다.');
      return;
    }
    
    if (!serverFormData.serverType) {
      alert('서버 타입은 필수 입력 항목입니다.');
      return;
    }

    // 서버 타입이 '기타'인 경우 입력값 확인
    if (serverFormData.serverType === '기타' && !serverFormData.serverTypeOther.trim()) {
      alert('서버 타입(기타)을 입력해주세요.');
      return;
    }
    
    // SSH 정보 필수 검증
    if (!serverFormData.host.trim()) {
      alert('호스트(IP 또는 도메인)는 필수 입력 항목입니다.');
      return;
    }
    
    if (!serverFormData.sshUsername.trim()) {
      alert('SSH 사용자명은 필수 입력 항목입니다.');
      return;
    }
    
    if (!serverFormData.sshPort || serverFormData.sshPort < 1 || serverFormData.sshPort > 65535) {
      alert('SSH 포트는 필수 입력 항목입니다. (1-65535 범위)');
      return;
    }
    
    if (!serverFormData.deployPath.trim()) {
      alert('배포 경로는 필수 입력 항목입니다.');
      return;
    }
    
    if (!serverFormData.sshPassword.trim()) {
      alert('비밀번호는 필수 입력 항목입니다.');
      return;
    }

    const serverDataToSave = {
      ...serverFormData,
      port: parseInt(serverFormData.sshPort) || 22, // port는 sshPort 값을 사용
      sshPort: parseInt(serverFormData.sshPort) || 22,
      serverType: serverFormData.serverType === '기타' ? serverFormData.serverTypeOther : serverFormData.serverType
    };
    // serverTypeOther는 저장하지 않음
    delete serverDataToSave.serverTypeOther;

    if (selectedServer) {
      onUpdateServer({ ...selectedServer, ...serverDataToSave });
    } else {
      onAddServer(serverDataToSave);
    }

    setServerDialogOpen(false);
    // 외부 편집 모드 종료
    if (onServerEditComplete) {
      onServerEditComplete();
    }
    setServerFormData({ 
      name: '', 
      serverType: 'nginx',
      serverTypeOther: '',
      description: '',
      host: '',
      sshUsername: '',
      sshPort: 22,
      deployPath: '',
      sshAuthType: 'password',
      sshPassword: '',
      sshPublicKey: ''
    });
    setSelectedServer(null);
  };


  const handleEditServer = (server) => {
    setSelectedServer(server);
    const isOtherType = server.serverType && !['nginx', '웹투비', 'tomcat'].includes(server.serverType);
    setServerFormData({
      name: server.name || '',
      serverType: isOtherType ? '기타' : (server.serverType || 'nginx'),
      serverTypeOther: isOtherType ? server.serverType : '',
      description: server.description || '',
      host: server.host || '',
      sshUsername: server.sshUsername || '',
      sshPort: server.sshPort || server.port || 22,
      deployPath: server.deployPath || '',
      sshAuthType: server.sshAuthType || 'password',
      sshPassword: '', // 보안을 위해 비밀번호는 표시하지 않음
      sshPublicKey: '' // 보안을 위해 공개키는 표시하지 않음
    });
    setServerDialogOpen(true);
  };

  const handleDeleteServer = (serverId) => {
    if (window.confirm('정말로 이 서버를 삭제하시겠습니까?')) {
      onDeleteServer(serverId);
    }
  };

  // 외부에서 서버 편집 요청이 있을 때 다이얼로그 열기
  useEffect(() => {
    if (externalServerToEdit) {
      setSelectedServer(externalServerToEdit);
      const isOtherType = externalServerToEdit.serverType && !['nginx', '웹투비', 'tomcat'].includes(externalServerToEdit.serverType);
      setServerFormData({
        name: externalServerToEdit.name || '',
        serverType: isOtherType ? '기타' : (externalServerToEdit.serverType || 'nginx'),
        serverTypeOther: isOtherType ? externalServerToEdit.serverType : '',
        description: externalServerToEdit.description || '',
        host: externalServerToEdit.host || '',
        sshUsername: externalServerToEdit.sshUsername || '',
        sshPort: externalServerToEdit.sshPort || externalServerToEdit.port || 22,
        deployPath: externalServerToEdit.deployPath || '',
        sshAuthType: externalServerToEdit.sshAuthType || 'password',
        sshPassword: '', // 보안을 위해 비밀번호는 표시하지 않음
        sshPublicKey: '' // 보안을 위해 공개키는 표시하지 않음
      });
      setServerDialogOpen(true);
    }
  }, [externalServerToEdit]);

  return (
    <div className="server-management">
      <div className="server-management-header">
        <h2>서버 관리</h2>
          <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedServer(null);
            setServerFormData({ 
              name: '', 
              serverType: 'nginx',
              serverTypeOther: '',
              description: '',
              host: '',
              sshUsername: '',
              sshPort: 22,
              deployPath: '',
              sshAuthType: 'password',
              sshPassword: '',
              sshPublicKey: ''
            });
            setServerDialogOpen(true);
          }}
        >
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          서버 추가
        </button>
      </div>

      {/* 검색 및 정렬 컨트롤 */}
      <div className="filter-section" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-controls">
          <div className="search-wrapper">
            <Search className="search-icon" style={{ width: '1rem', height: '1rem' }} />
            <input
              type="text"
              placeholder="서버 이름, 호스트로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            style={{ maxWidth: '200px' }}
          >
            <option value="name">이름 순</option>
            <option value="host">호스트(IP) 순</option>
            <option value="type">서버 타입 순</option>
          </select>
          <button
            className="btn btn-outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            style={{ marginLeft: '0.5rem' }}
          >
            {sortOrder === "asc" ? "↑ 오름차순" : "↓ 내림차순"}
          </button>
        </div>
      </div>

      <div className="servers-list">
        {isLoading ? (
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <Loader2 className="empty-icon" style={{ width: '3rem', height: '3rem', color: '#f97316', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ marginTop: '1rem' }}>{isAddingServer ? '서버 정보를 추가 중입니다.' : '서버 데이터를 불러오는 중...'}</h3>
          </div>
        ) : servers && servers.length > 0 ? (
          [...servers]
            .filter(server => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              return (
                (server.name || '').toLowerCase().includes(query) ||
                (server.host || '').toLowerCase().includes(query) ||
                (server.serverType || '').toLowerCase().includes(query) ||
                (server.description || '').toLowerCase().includes(query)
              );
            })
            .sort((a, b) => {
              let comparison = 0;
              
              switch (sortBy) {
                case "name":
                  comparison = (a.name || '').localeCompare(b.name || '');
                  break;
                case "host":
                  comparison = (a.host || '').localeCompare(b.host || '');
                  break;
                case "type":
                  comparison = (a.serverType || '').localeCompare(b.serverType || '');
                  break;
                default:
                  comparison = 0;
              }
              
              return sortOrder === "asc" ? comparison : -comparison;
            })
            .map((server) => (
            <div key={server.id} className="server-card">
              <div className="server-card-header">
                <div className="server-card-info">
                  <Server size={20} className="server-icon" />
                  <div>
                    <h3>{server.name}</h3>
                    <p>{server.host}:{server.sshPort || server.port}</p>
                    {server.description && (
                      <p className="server-description">{server.description}</p>
                    )}
                  </div>
                </div>
                <div className="server-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEditServer(server)}
                    title="서버 수정"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDeleteServer(server.id)}
                    title="서버 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Server size={48} className="empty-icon" />
            <p>등록된 서버가 없습니다. 서버를 추가해주세요.</p>
          </div>
        )}
      </div>

      {/* 서버 추가/수정 다이얼로그 */}
      {serverDialogOpen && (
        <div 
          className="dialog-overlay" 
          onMouseDown={(e) => {
            // 다이얼로그 내부에서 마우스 다운이 시작되었는지 확인
            if (e.target === e.currentTarget) {
              setMouseDownTarget(e.target);
            } else {
              setMouseDownTarget(null);
            }
          }}
          onClick={(e) => {
            // 다이얼로그 오버레이에서 직접 클릭한 경우에만 닫기
            // (다이얼로그 내부에서 드래그 후 바깥에서 마우스를 떼는 경우 방지)
            if (e.target === e.currentTarget && mouseDownTarget === e.target) {
              setServerDialogOpen(false);
            }
            setMouseDownTarget(null);
          }}
        >
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">
                {selectedServer ? '서버 수정' : '서버 추가'}
              </h2>
              <button 
                className="btn-icon-close"
                onClick={() => setServerDialogOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">
                  서버 이름 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={serverFormData.name}
                  onChange={(e) => setServerFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 프로덕션 서버"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  서버 타입 <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={serverFormData.serverType}
                  onChange={(e) => setServerFormData(prev => ({ 
                    ...prev, 
                    serverType: e.target.value,
                    serverTypeOther: e.target.value === '기타' ? prev.serverTypeOther : ''
                  }))}
                >
                  <option value="nginx">Nginx</option>
                  <option value="웹투비">WebtoB</option>
                  <option value="tomcat">Tomcat</option>
                  <option value="기타">기타</option>
                </select>
                {serverFormData.serverType === '기타' && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '0.5rem' }}
                    value={serverFormData.serverTypeOther}
                    onChange={(e) => setServerFormData(prev => ({ ...prev, serverTypeOther: e.target.value }))}
                    placeholder="서버 타입을 입력하세요"
                  />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">설명 (선택사항)</label>
                <textarea
                  className="form-input"
                  value={serverFormData.description}
                  onChange={(e) => setServerFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="서버에 대한 설명을 입력하세요"
                  rows="3"
                />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>SSH 정보</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    호스트 (IP 또는 도메인) <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={serverFormData.host}
                    onChange={(e) => setServerFormData(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="예: 192.168.1.100 또는 server.example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    SSH 사용자명 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={serverFormData.sshUsername}
                    onChange={(e) => setServerFormData(prev => ({ ...prev, sshUsername: e.target.value }))}
                    placeholder="예: root, ubuntu, admin"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    SSH 포트 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={serverFormData.sshPort}
                    onChange={(e) => setServerFormData(prev => ({ ...prev, sshPort: parseInt(e.target.value) || 22 }))}
                    placeholder="22"
                    min="1"
                    max="65535"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    배포 경로 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={serverFormData.deployPath}
                    onChange={(e) => setServerFormData(prev => ({ ...prev, deployPath: e.target.value }))}
                    placeholder="예: /etc/nginx/ssl, /opt/tomcat/conf"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    비밀번호 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div>
                    <input
                      type="password"
                      className="form-input"
                      value={serverFormData.sshPassword}
                      onChange={(e) => setServerFormData(prev => ({ ...prev, sshPassword: e.target.value }))}
                      placeholder="SSH 비밀번호를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setServerDialogOpen(false)}
              >
                취소
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddServer}
              >
                {selectedServer ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

