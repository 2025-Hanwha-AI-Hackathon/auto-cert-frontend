import React, { useState } from 'react';
import { Server, Plus, X, Trash2, Edit } from 'lucide-react';
import '../styles/ServerManagement.css';

export function ServerManagement({ 
  servers, 
  onAddServer, 
  onUpdateServer, 
  onDeleteServer
}) {
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [serverFormData, setServerFormData] = useState({
    name: '',
    host: '',
    port: 22,
    serverType: 'nginx',
    serverTypeOther: '', // '기타' 선택 시 입력값
    description: '',
    sshUsername: '',
    sshPort: 22,
    deployPath: '',
    sshAuthType: 'password', // 'password' or 'key'
    sshPassword: '',
    sshPrivateKey: ''
  });

  const handleAddServer = () => {
    if (!serverFormData.name.trim() || !serverFormData.host.trim()) {
      alert('서버 이름과 호스트는 필수 입력 항목입니다.');
      return;
    }

    // 서버 타입이 '기타'인 경우 입력값 확인
    if (serverFormData.serverType === '기타' && !serverFormData.serverTypeOther.trim()) {
      alert('서버 타입(기타)을 입력해주세요.');
      return;
    }

    // SSH 정보는 서버 추가 시 필수가 아님

    const serverDataToSave = {
      ...serverFormData,
      port: parseInt(serverFormData.port) || 22,
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
    setServerFormData({ 
      name: '', 
      host: '', 
      port: 22, 
      serverType: 'nginx',
      serverTypeOther: '',
      description: '',
      sshUsername: '',
      sshPort: 22,
      deployPath: '',
      sshAuthType: 'password',
      sshPassword: '',
      sshPrivateKey: ''
    });
    setSelectedServer(null);
  };


  const handleEditServer = (server) => {
    setSelectedServer(server);
    const isOtherType = server.serverType && !['nginx', '웹투비', 'tomcat'].includes(server.serverType);
    setServerFormData({
      name: server.name || '',
      host: server.host || '',
      port: server.port || 22,
      serverType: isOtherType ? '기타' : (server.serverType || 'nginx'),
      serverTypeOther: isOtherType ? server.serverType : '',
      description: server.description || '',
      sshUsername: server.sshUsername || '',
      sshPort: server.sshPort || 22,
      deployPath: server.deployPath || '',
      sshAuthType: server.sshAuthType || 'password',
      sshPassword: '', // 보안을 위해 비밀번호는 표시하지 않음
      sshPrivateKey: '' // 보안을 위해 개인키는 표시하지 않음
    });
    setServerDialogOpen(true);
  };

  const handleDeleteServer = (serverId) => {
    if (window.confirm('정말로 이 서버를 삭제하시겠습니까?')) {
      onDeleteServer(serverId);
    }
  };

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
              host: '', 
              port: 22, 
              serverType: 'nginx',
              serverTypeOther: '',
              description: '',
              sshUsername: '',
              sshPort: 22,
              deployPath: '',
              sshAuthType: 'password',
              sshPassword: '',
              sshPrivateKey: ''
            });
            setServerDialogOpen(true);
          }}
        >
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          서버 추가
        </button>
      </div>

      <div className="servers-list">
        {servers && servers.length > 0 ? (
          servers.map((server) => (
            <div key={server.id} className="server-card">
              <div className="server-card-header">
                <div className="server-card-info">
                  <Server size={20} className="server-icon" />
                  <div>
                    <h3>{server.name}</h3>
                    <p>{server.host}:{server.port}</p>
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
        <div className="dialog-overlay" onClick={() => setServerDialogOpen(false)}>
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
                <label className="form-label">SSH 포트</label>
                <input
                  type="number"
                  className="form-input"
                  value={serverFormData.port}
                  onChange={(e) => setServerFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 22 }))}
                  placeholder="22"
                  min="1"
                  max="65535"
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
                  <option value="nginx">nginx</option>
                  <option value="웹투비">웹투비</option>
                  <option value="tomcat">tomcat</option>
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
                    SSH 사용자명
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
                  <label className="form-label">SSH 포트</label>
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
                    배포 경로
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
                    인증 방식
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sshAuthType"
                        checked={serverFormData.sshAuthType === 'password'}
                        onChange={() => setServerFormData(prev => ({ 
                          ...prev, 
                          sshAuthType: 'password',
                          sshPrivateKey: '' // 전환 시 개인키 초기화
                        }))}
                        style={{ accentColor: '#FF6600' }}
                      />
                      <span>비밀번호</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sshAuthType"
                        checked={serverFormData.sshAuthType === 'key'}
                        onChange={() => setServerFormData(prev => ({ 
                          ...prev, 
                          sshAuthType: 'key',
                          sshPassword: '' // 전환 시 비밀번호 초기화
                        }))}
                        style={{ accentColor: '#FF6600' }}
                      />
                      <span>KEY 방식</span>
                    </label>
                  </div>

                  {serverFormData.sshAuthType === 'password' ? (
                    <div>
                      <input
                        type="password"
                        className="form-input"
                        value={serverFormData.sshPassword}
                        onChange={(e) => setServerFormData(prev => ({ ...prev, sshPassword: e.target.value }))}
                        placeholder="SSH 비밀번호를 입력하세요"
                      />
                    </div>
                  ) : (
                    <div>
                      <textarea
                        className="form-input"
                        value={serverFormData.sshPrivateKey}
                        onChange={(e) => setServerFormData(prev => ({ ...prev, sshPrivateKey: e.target.value }))}
                        placeholder="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
                        rows="6"
                      />
                      <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        SSH 개인키를 입력하세요
                      </small>
                    </div>
                  )}
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

