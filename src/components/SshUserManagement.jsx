import React, { useState } from 'react';
import { User, Plus, X, Edit, Trash2 } from 'lucide-react';
import '../styles/SshUserManagement.css';

export function SshUserManagement({ 
  sshUsers, 
  onAddSshUser, 
  onUpdateSshUser, 
  onDeleteSshUser 
}) {
  const [sshUserDialogOpen, setSshUserDialogOpen] = useState(false);
  const [selectedSshUser, setSelectedSshUser] = useState(null);
  const [sshUserFormData, setSshUserFormData] = useState({
    username: '',
    password: '',
    privateKey: '',
    description: ''
  });

  const handleAddSshUser = () => {
    if (!sshUserFormData.username.trim()) {
      alert('SSH 사용자명은 필수 입력 항목입니다.');
      return;
    }

    if (!sshUserFormData.password && !sshUserFormData.privateKey) {
      alert('비밀번호 또는 개인키 중 하나는 입력해야 합니다.');
      return;
    }

    if (selectedSshUser) {
      onUpdateSshUser({
        ...selectedSshUser,
        ...sshUserFormData
      });
    } else {
      onAddSshUser({
        ...sshUserFormData
      });
    }

    setSshUserDialogOpen(false);
    setSshUserFormData({ username: '', password: '', privateKey: '', description: '' });
    setSelectedSshUser(null);
  };

  const handleEditSshUser = (sshUser) => {
    setSelectedSshUser(sshUser);
    setSshUserFormData({
      username: sshUser.username || '',
      password: '', // 보안을 위해 비밀번호는 표시하지 않음
      privateKey: '', // 보안을 위해 개인키는 표시하지 않음
      description: sshUser.description || ''
    });
    setSshUserDialogOpen(true);
  };

  const handleDeleteSshUser = (sshUserId) => {
    if (window.confirm('정말로 이 SSH 유저를 삭제하시겠습니까?')) {
      onDeleteSshUser(sshUserId);
    }
  };

  return (
    <div className="ssh-user-management">
      <div className="ssh-user-management-header">
        <h2>SSH 유저 관리</h2>
          <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedSshUser(null);
            setSshUserFormData({ username: '', password: '', privateKey: '', description: '' });
            setSshUserDialogOpen(true);
          }}
        >
          <Plus size={16} style={{ marginRight: '0.5rem' }} />
          SSH 유저 추가
        </button>
      </div>

      <div className="ssh-users-list">
        {sshUsers && sshUsers.length > 0 ? (
          sshUsers.map((sshUser) => (
            <div key={sshUser.id} className="ssh-user-card">
              <div className="ssh-user-card-header">
                <div className="ssh-user-card-info">
                  <User size={20} className="ssh-user-icon" />
                  <div>
                    <h3>{sshUser.username}</h3>
                    {sshUser.description && (
                      <p className="ssh-user-description">{sshUser.description}</p>
                    )}
                    <div className="ssh-user-meta">
                      <span className={`auth-method ${sshUser.privateKey ? 'key-auth' : 'password-auth'}`}>
                        {sshUser.privateKey ? '🔑 키 인증' : '🔒 비밀번호 인증'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ssh-user-card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEditSshUser(sshUser)}
                    title="SSH 유저 수정"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDeleteSshUser(sshUser.id)}
                    title="SSH 유저 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <User size={48} className="empty-icon" style={{ marginBottom: '0.75rem' }} />
              <p style={{ margin: 0 }}>등록된 SSH 유저가 없습니다. SSH 유저를 추가해주세요.</p>
            </div>
          </div>
        )}
      </div>

      {/* SSH 유저 추가/수정 다이얼로그 */}
      {sshUserDialogOpen && (
        <div className="dialog-overlay" onClick={() => setSshUserDialogOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">
                {selectedSshUser ? 'SSH 유저 수정' : 'SSH 유저 추가'}
              </h2>
              <button 
                className="btn-icon-close"
                onClick={() => setSshUserDialogOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">
                  SSH 사용자명 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={sshUserFormData.username}
                  onChange={(e) => setSshUserFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="예: root, ubuntu, admin"
                />
              </div>
              <div className="form-group">
                <label className="form-label">설명 (선택사항)</label>
                <input
                  type="text"
                  className="form-input"
                  value={sshUserFormData.description}
                  onChange={(e) => setSshUserFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="SSH 유저에 대한 설명을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input
                  type="password"
                  className="form-input"
                  value={sshUserFormData.password}
                  onChange={(e) => setSshUserFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={selectedSshUser ? '변경하려면 입력하세요 (비워두면 변경 안 함)' : '비밀번호 인증 사용 시'}
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  비밀번호 또는 개인키 중 하나를 입력하세요
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">개인키 (Private Key)</label>
                <textarea
                  className="form-input"
                  value={sshUserFormData.privateKey}
                  onChange={(e) => setSshUserFormData(prev => ({ ...prev, privateKey: e.target.value }))}
                  placeholder={selectedSshUser ? '변경하려면 입력하세요 (비워두면 변경 안 함)' : '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----'}
                  rows="6"
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  SSH 개인키를 입력하세요 (비밀번호 없이 키 인증 사용 시)
                </small>
              </div>
            </div>
            <div className="dialog-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setSshUserDialogOpen(false)}
              >
                취소
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddSshUser}
              >
                {selectedSshUser ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

