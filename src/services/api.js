// API 베이스 URL 설정
// 개발 모드: 로컬 백엔드 사용 (localhost:8080)
// 프로덕션: 프로덕션 서버 사용
const IS_DEV_MODE = false; // AI 기능을 사용하려면 false로 설정

// 개발 환경에서는 로컬 백엔드 사용
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://auto-cert-backend-production.up.railway.app'
  : 'http://localhost:8080';

// 디버깅용 (개발 시에만 콘솔 출력)
if (import.meta.env.DEV) {
  console.log('API Mode:', {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    IS_DEV_MODE: IS_DEV_MODE,
    API_BASE_URL: API_BASE_URL
  });
}

/**
 * API 응답 처리를 위한 헬퍼 함수
 */
async function handleResponse(response) {
  // 204 No Content는 응답 본문이 없음
  if (response.status === 204) {
    return;
  }
  
  // 응답 본문이 비어있을 수 있음
  const text = await response.text();
  if (!text) {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return;
  }
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${text}`);
    }
    return text;
  }
  
  if (!response.ok) {
    throw new Error(data.message || data.errorCode || `API Error: ${response.status}`);
  }
  
  // API 응답 형식에 따라 data 필드 반환 또는 전체 반환
  return data.success !== undefined ? data.data : data;
}

/**
 * 인증서 목록 조회 (페이지네이션 지원)
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 * @param {string[]} sort - 정렬 기준 (예: ["createdAt,DESC"])
 * @returns {Promise<Object>} 인증서 목록 및 페이지네이션 정보 (PageResponse 형식)
 */
export async function getCertificates(page = 0, size = 20, sort = ['createdAt,DESC']) {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    // sort 파라미터 추가 (Spring Boot는 배열 형태로 받음)
    sort.forEach((s) => {
      params.append('sort', s);
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates?${params}`);
      return handleResponse(response);
    } catch (error) {
      console.error('인증서 목록 조회 실패:', error);
      // API 호출 실패 시 빈 결과 반환
      return {
        content: [],
        page: page,
        size: size,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false
      };
    }
  }
  
  // 개발 모드: 더미 데이터 반환
  return Promise.resolve({
    content: [
      {
        id: 1,
        domain: 'example.com',
        issuer: "Let's Encrypt",
        issuedAt: '2024-01-15T00:00:00Z',
        expiresAt: '2024-04-15T00:00:00Z',
        status: 'ACTIVE',
        renewalAttempts: 0,
        lastError: null,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 2,
        domain: 'test.example.com',
        issuer: "Let's Encrypt",
        issuedAt: '2024-01-10T00:00:00Z',
        expiresAt: '2024-03-10T00:00:00Z',
        status: 'EXPIRING_SOON',
        renewalAttempts: 0,
        lastError: null,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      },
      {
        id: 3,
        domain: 'expired.example.com',
        issuer: "Let's Encrypt",
        issuedAt: '2023-01-01T00:00:00Z',
        expiresAt: '2024-01-01T00:00:00Z',
        status: 'EXPIRED',
        renewalAttempts: 1,
        lastError: null,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    page: page,
    size: size,
    totalElements: 3,
    totalPages: 1,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false
  });
}

/**
 * 인증서 상세 조회
 * @param {number} id - 인증서 ID
 * @returns {Promise<Object>} 인증서 상세 정보 (CertificateResponse 형식)
 */
export async function getCertificate(id) {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error('인증서 상세 조회 실패:', error);
      throw error;
    }
  }
  
  // 개발 모드: 더미 데이터 반환
  return Promise.resolve({
    id: parseInt(id),
    domain: 'example.com',
    issuer: "Let's Encrypt",
    issuedAt: '2024-01-15T00:00:00Z',
    expiresAt: '2024-04-15T00:00:00Z',
    status: 'ACTIVE',
    renewalAttempts: 0,
    lastError: null,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  });
}

/**
 * 인증서 생성
 * @param {Object} certificateData - 인증서 생성 데이터
 * @param {string} certificateData.domain - 도메인 (필수)
 * @param {string} certificateData.challengeType - 챌린지 타입 (선택, "dns-01" 또는 "http-01")
 * @returns {Promise<Object>} 생성된 인증서 정보 (CertificateResponse 형식)
 */
export async function createCertificate(certificateData) {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    // 백엔드 API 형식에 맞게 변환
    const requestBody = {
      domain: certificateData.domain,
      challengeType: certificateData.challengeType || null
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('인증서 생성 실패:', error);
      throw error;
    }
  }
  
  // 개발 모드: 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.resolve({
    id: Date.now(),
    domain: certificateData.domain,
    issuer: "Let's Encrypt",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    renewalAttempts: 0,
    lastError: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

/**
 * 인증서 갱신
 * @param {number} id - 인증서 ID
 * @returns {Promise<Object>} 갱신된 인증서 정보 (CertificateResponse 형식)
 */
export async function renewCertificate(id) {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}/renew`, {
        method: 'POST',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('인증서 갱신 실패:', error);
      throw error;
    }
  }
  
  // 개발 모드: 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.resolve({
    id: parseInt(id),
    domain: 'example.com',
    issuer: "Let's Encrypt",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    renewalAttempts: 1,
    lastError: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

/**
 * 인증서 삭제
 * @param {number} id - 인증서 ID
 * @returns {Promise<void>}
 */
export async function deleteCertificate(id) {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}`, {
        method: 'DELETE',
      });
      
      // 204 No Content 또는 200 OK 모두 처리
      if (response.status === 204 || response.status === 200) {
        return;
      }
      
      return handleResponse(response);
    } catch (error) {
      console.error('인증서 삭제 실패:', error);
      throw error;
    }
  }
  
  // 개발 모드: 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve();
}

/**
 * 헬스체크
 * @returns {Promise<Object>} 서버 상태 정보
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`);
  return handleResponse(response);
}

/**
 * 서버 목록 조회
 * @returns {Promise<Array>} 서버 목록
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function getServers() {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/servers`);
      return handleResponse(response);
    } catch (error) {
      console.error('서버 목록 조회 실패:', error);
      return [];
    }
  }
  
  // 개발 모드: 더미 데이터 반환 (백엔드 미구현)
  return Promise.resolve([
    {
      id: 1,
      name: '프로덕션 서버',
      host: '192.168.1.100',
      port: 22,
      serverType: 'nginx',
      description: '메인 프로덕션 서버',
      sshUsername: 'root',
      sshPort: 22,
      deployPath: '/etc/nginx/ssl',
      sshAuthType: 'password',
      sshPassword: '',
      sshPublicKey: '',
      sshUsers: [
        { id: 1, username: 'root', serverId: 1 },
        { id: 2, username: 'ubuntu', serverId: 1 }
      ]
    },
    {
      id: 2,
      name: '스테이징 서버',
      host: '192.168.1.101',
      port: 22,
      serverType: 'tomcat',
      description: '스테이징 환경 서버',
      sshUsername: 'admin',
      sshPort: 22,
      deployPath: '/opt/tomcat/conf',
      sshAuthType: 'key',
      sshPassword: '',
      sshPublicKey: '',
      sshUsers: [
        { id: 3, username: 'admin', serverId: 2 }
      ]
    }
  ]);
}

/**
 * 서버 추가
 * @param {Object} serverData - 서버 데이터
 * @returns {Promise<Object>} 생성된 서버 정보
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function createServer(serverData) {
  // TODO: 백엔드 API 구현 후 주석 해제
  // try {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/servers`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(serverData),
  //   });
  //   return handleResponse(response);
  // } catch (error) {
  //   console.error('서버 추가 실패:', error);
  //   throw error;
  // }
  
  // 더미 데이터 반환 (백엔드 미구현)
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve({
    id: Date.now(),
    ...serverData,
    sshUsers: []
  });
}

/**
 * 서버 수정
 * @param {number} id - 서버 ID
 * @param {Object} serverData - 서버 데이터
 * @returns {Promise<Object>} 수정된 서버 정보
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function updateServer(id, serverData) {
  // TODO: 백엔드 API 구현 후 주석 해제
  // try {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/servers/${id}`, {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(serverData),
  //   });
  //   return handleResponse(response);
  // } catch (error) {
  //   console.error('서버 수정 실패:', error);
  //   throw error;
  // }
  
  // 더미 데이터 반환 (백엔드 미구현)
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve({ id: parseInt(id), ...serverData });
}

/**
 * 서버 삭제
 * @param {number} id - 서버 ID
 * @returns {Promise<void>}
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function deleteServer(id) {
  // TODO: 백엔드 API 구현 후 주석 해제
  // try {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/servers/${id}`, {
  //     method: 'DELETE',
  //   });
  //   
  //   if (response.status === 204 || response.status === 200) {
  //     return;
  //   }
  //   
  //   return handleResponse(response);
  // } catch (error) {
  //   console.error('서버 삭제 실패:', error);
  //   throw error;
  // }
  
  // 더미 데이터 반환 (백엔드 미구현)
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve();
}

/**
 * SSH 유저 추가
 * @param {number} serverId - 서버 ID
 * @param {Object} sshUserData - SSH 유저 데이터
 * @returns {Promise<Object>} 생성된 SSH 유저 정보
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function addSshUser(serverId, sshUserData) {
  // TODO: 백엔드 API 구현 후 주석 해제
  // try {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/servers/${serverId}/ssh-users`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(sshUserData),
  //   });
  //   return handleResponse(response);
  // } catch (error) {
  //   console.error('SSH 유저 추가 실패:', error);
  //   throw error;
  // }
  
  // 더미 데이터 반환 (백엔드 미구현)
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve({
    id: Date.now(),
    username: sshUserData.username,
    serverId: parseInt(serverId)
  });
}

/**
 * 인증서 배포 상태 확인
 * @param {number} certificateId - 인증서 ID
 * @returns {Promise<Object>} 배포 상태 정보
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function getDeploymentStatus(certificateId) {
  // TODO: 백엔드 API 구현 후 주석 해제
  // try {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${certificateId}/deployment-status`);
  //   return handleResponse(response);
  // } catch (error) {
  //   console.error('배포 상태 확인 실패:', error);
  //   throw error;
  // }
  
  // 더미 데이터 반환 (백엔드 미구현)
  return Promise.resolve({
    deployed: Math.random() > 0.3,
    deployedAt: new Date().toISOString(),
    serverName: '프로덕션 서버'
  });
}

/**
 * 인증서 배포
 * @param {number} certificateId - 인증서 ID
 * @param {Object} deploymentData - 배포 데이터 (serverId, sshUserId 등)
 * @returns {Promise<Object>} 배포 결과
 * @note 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
 */
export async function deployCertificate(certificateId, deploymentData) {
  // TODO: 백엔드 API 구현 후 주석 해제
  // try {
  //   const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${certificateId}/deploy`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(deploymentData),
  //   });
  //   return handleResponse(response);
  // } catch (error) {
  //   console.error('인증서 배포 실패:', error);
  //   throw error;
  // }
  
  // 더미 데이터 반환 (백엔드 미구현)
  await new Promise(resolve => setTimeout(resolve, 1500));
  return Promise.resolve({
    success: true,
    deployedAt: new Date().toISOString()
  });
}

/**
 * AI 채팅 메시지 전송
 * @param {string} message - 사용자 메시지
 * @param {string} sessionId - 세션 ID (선택, 기본값: "default")
 * @returns {Promise<Object>} 채팅 응답
 */
export async function sendChatMessage(message, sessionId = 'default') {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    const requestBody = {
      message: message,
      sessionId: sessionId
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('채팅 메시지 전송 실패:', error);
      throw error;
    }
  }
  
  // 개발 모드: 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.resolve({
    message: "테스트 응답입니다. 실제 AI 기능은 프로덕션 모드에서 동작합니다.",
    role: "assistant",
    timestamp: new Date().toISOString(),
    sessionId: sessionId,
    success: true
  });
}

/**
 * 채팅 히스토리 조회
 * @param {string} sessionId - 세션 ID (기본값: "default")
 * @returns {Promise<Array>} 채팅 히스토리
 */
export async function getChatHistory(sessionId = 'default') {
  // 개발 모드가 아닐 때 실제 API 호출 (테스트 모드 및 프로덕션)
  if (!IS_DEV_MODE) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/history/${sessionId}`);
      return handleResponse(response);
    } catch (error) {
      console.error('채팅 히스토리 조회 실패:', error);
      return [];
    }
  }
  
  // 개발 모드: 빈 배열 반환
  return Promise.resolve([]);
}


