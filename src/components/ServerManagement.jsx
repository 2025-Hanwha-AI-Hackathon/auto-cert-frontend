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
    description: ''
  });

  const handleAddServer = () => {
    if (!serverFormData.name.trim() || !serverFormData.host.trim()) {
      alert('서버 이름과 호스트는 필수 입력 항목입니다.');
      return;
    }

    if (selectedServer) {
      onUpdateServer({ ...selectedServer, ...serverFormData });
    } else {
      onAddServer({
        ...serverFormData,
        port: parseInt(serverFormData.port) || 22
      });
    }

    setServerDialogOpen(false);
    setServerFormData({ name: '', host: '', port: 22, description: '' });
    setSelectedServer(null);
  };


  const handleEditServer = (server) => {
    setSelectedServer(server);
    setServerFormData({
      name: server.name || '',
      host: server.host || '',
      port: server.port || 22,
      description: server.description || ''
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
            setServerFormData({ name: '', host: '', port: 22, description: '' });
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
                <label className="form-label">설명 (선택사항)</label>
                <textarea
                  className="form-input"
                  value={serverFormData.description}
                  onChange={(e) => setServerFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="서버에 대한 설명을 입력하세요"
                  rows="3"
                />
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

