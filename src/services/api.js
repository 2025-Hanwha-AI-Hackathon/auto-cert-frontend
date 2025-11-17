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
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  // sort 파라미터 추가 (Spring Boot는 배열 형태로 받음)
  sort.forEach((s, idx) => {
    params.append('sort', s);
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/certificates?${params}`);
  return handleResponse(response);
}

/**
 * 인증서 상세 조회
 * @param {number} id - 인증서 ID
 * @returns {Promise<Object>} 인증서 상세 정보
 */
export async function getCertificate(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}`);
  return handleResponse(response);
}

/**
 * 인증서 생성
 * @param {Object} certificateData - 인증서 생성 데이터
 * @param {string} certificateData.domain - 도메인 (필수)
 * @param {string} certificateData.challengeType - 챌린지 타입 (선택)
 * @returns {Promise<Object>} 생성된 인증서 정보
 */
export async function createCertificate(certificateData) {
  const response = await fetch(`${API_BASE_URL}/api/v1/certificates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(certificateData),
  });
  return handleResponse(response);
}

/**
 * 인증서 갱신
 * @param {number} id - 인증서 ID
 * @returns {Promise<Object>} 갱신된 인증서 정보
 */
export async function renewCertificate(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}/renew`, {
    method: 'POST',
  });
  return handleResponse(response);
}

/**
 * 인증서 삭제
 * @param {number} id - 인증서 ID
 * @returns {Promise<void>}
 */
export async function deleteCertificate(id) {
  const response = await fetch(`${API_BASE_URL}/api/v1/certificates/${id}`, {
    method: 'DELETE',
  });
  
  if (response.status === 204) {
    return;
  }
  
  return handleResponse(response);
}

/**
 * 헬스체크
 * @returns {Promise<Object>} 서버 상태 정보
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`);
  return handleResponse(response);
}

