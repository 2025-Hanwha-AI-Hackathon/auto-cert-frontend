// 개발 환경에서는 프록시 사용, 프로덕션에서는 직접 URL 사용
const API_BASE_URL = import.meta.env.DEV 
  ? '' // 개발 환경: Vite 프록시 사용
  : 'https://auto-cert-backend-production.up.railway.app'; // 프로덕션 환경: 직접 URL

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
 * @returns {Promise<Object>} 인증서 목록 및 페이지네이션 정보
 */
export async function getCertificates(page = 0, size = 20, sort = ['createdAt,DESC']) {
  // TODO: 백엔드 연동 시 주석 해제
  // const params = new URLSearchParams({
  //   page: page.toString(),
  //   size: size.toString()
  // });
  // 
  // // sort 파라미터 추가 (Spring Boot는 배열 형태로 받음)
  // sort.forEach((s, idx) => {
  //   params.append('sort', s);
  // });
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates?${params}`);
  // return handleResponse(response);
  
  // 더미 데이터 반환 (테스트용)
  return Promise.resolve({
    content: [
      {
        id: 1,
        domain: 'example.com',
        issuer: "Let's Encrypt",
        issuedAt: '2024-01-15T00:00:00Z',
        expiresAt: '2024-04-15T00:00:00Z',
        status: 'valid',
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
        status: 'expiring-soon',
        renewalAttempts: 0,
        lastError: null,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      }
    ],
    totalElements: 2,
    totalPages: 1,
    size: size,
    number: page
  });
}

/**
 * 인증서 상세 조회
 * @param {number} id - 인증서 ID
 * @returns {Promise<Object>} 인증서 상세 정보
 */
export async function getCertificate(id) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}`);
  // return handleResponse(response);
  
  // 더미 데이터 반환
  return Promise.resolve({
    id: parseInt(id),
    domain: 'example.com',
    issuer: "Let's Encrypt",
    issuedAt: '2024-01-15T00:00:00Z',
    expiresAt: '2024-04-15T00:00:00Z',
    status: 'valid'
  });
}

/**
 * 인증서 생성
 * @param {Object} certificateData - 인증서 생성 데이터
 * @param {string} certificateData.domain - 도메인 (필수)
 * @param {string} certificateData.challengeType - 챌린지 타입 (선택)
 * @returns {Promise<Object>} 생성된 인증서 정보
 */
export async function createCertificate(certificateData) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(certificateData),
  // });
  // return handleResponse(response);
  
  // 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.resolve({
    id: Date.now(),
    domain: certificateData.domain,
    issuer: "Let's Encrypt",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'valid',
    renewalAttempts: 0,
    lastError: null
  });
}

/**
 * 인증서 갱신
 * @param {number} id - 인증서 ID
 * @returns {Promise<Object>} 갱신된 인증서 정보
 */
export async function renewCertificate(id) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}/renew`, {
  //   method: 'POST',
  // });
  // return handleResponse(response);
  
  // 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.resolve({
    id: parseInt(id),
    domain: 'example.com',
    issuer: "Let's Encrypt",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'valid',
    renewalAttempts: 1
  });
}

/**
 * 인증서 삭제
 * @param {number} id - 인증서 ID
 * @returns {Promise<void>}
 */
export async function deleteCertificate(id) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}`, {
  //   method: 'DELETE',
  // });
  // 
  // if (response.status === 204) {
  //   return;
  // }
  // 
  // return handleResponse(response);
  
  // 더미 데이터 반환
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
 */
export async function getServers() {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/servers`);
  // return handleResponse(response);
  
  // 더미 데이터 반환
  return Promise.resolve([
    {
      id: 1,
      name: '프로덕션 서버',
      host: '192.168.1.100',
      port: 22,
      description: '메인 프로덕션 서버',
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
      description: '스테이징 환경 서버',
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
 */
export async function createServer(serverData) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/servers`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(serverData),
  // });
  // return handleResponse(response);
  
  // 더미 데이터 반환
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
 */
export async function updateServer(id, serverData) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/servers/${id}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(serverData),
  // });
  // return handleResponse(response);
  
  // 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve({ id: parseInt(id), ...serverData });
}

/**
 * 서버 삭제
 * @param {number} id - 서버 ID
 * @returns {Promise<void>}
 */
export async function deleteServer(id) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/servers/${id}`, {
  //   method: 'DELETE',
  // });
  // 
  // if (response.status === 204) {
  //   return;
  // }
  // 
  // return handleResponse(response);
  
  // 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve();
}

/**
 * SSH 유저 추가
 * @param {number} serverId - 서버 ID
 * @param {Object} sshUserData - SSH 유저 데이터
 * @returns {Promise<Object>} 생성된 SSH 유저 정보
 */
export async function addSshUser(serverId, sshUserData) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/servers/${serverId}/ssh-users`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(sshUserData),
  // });
  // return handleResponse(response);
  
  // 더미 데이터 반환
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
 */
export async function getDeploymentStatus(certificateId) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${certificateId}/deployment-status`);
  // return handleResponse(response);
  
  // 더미 데이터 반환
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
 */
export async function deployCertificate(certificateId, deploymentData) {
  // TODO: 백엔드 연동 시 주석 해제
  // const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${certificateId}/deploy`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(deploymentData),
  // });
  // return handleResponse(response);
  
  // 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1500));
  return Promise.resolve({
    success: true,
    deployedAt: new Date().toISOString()
  });
}

