import React, { useState, useEffect, useRef } from "react";
import { CertificateCard } from "./components/CertificateCard";
import { CertificateStats } from "./components/CertificateStats";
import { ServerManagement } from "./components/ServerManagement";
import ChatSidebar from "./components/ChatSidebar";
import { Plus, Search, Shield, Server as ServerIcon, Users, CheckCircle2, ExternalLink, AlertCircle, XCircle, Loader2 } from "lucide-react";
import hanwhaLogo from "./assets/ci_logo_b.png";
import { 
  getCertificates as getCertificatesAPI,
  getCertificate as getCertificateAPI,
  createCertificate as createCertificateAPI,
  renewCertificate as renewCertificateAPI,
  deleteCertificate as deleteCertificateAPI,
  getServers,
  createServer,
  updateServer as updateServerAPI,
  deleteServer as deleteServerAPI,
  addSshUser,
  deployCertificate as deployCertificateAPI
} from "./services/api";
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
    status: "valid",
    alarmDaysBefore: 7, // 만료 전 알람 발송 일자
    managerName: "홍길동"
  },
  {
    id: "2",
    name: "API 서버 인증서",
    type: "SSL/TLS 인증서",
    domain: "api.example.com",
    issuer: "DigiCert",
    issueDate: "2024-10-15",
    expiryDate: "2025-12-15",
    status: "valid",
    managerName: "김철수"
  },
  {
    id: "3",
    name: "개발 환경 인증서",
    type: "SSL/TLS 인증서",
    domain: "dev.example.com",
    issuer: "Let's Encrypt",
    issueDate: "2024-11-01",
    expiryDate: "2025-11-20",
    status: "expiring-soon",
    managerName: "이영희"
  },
  {
    id: "4",
    name: "모바일 앱 코드 사이닝",
    type: "Code Signing 인증서",
    issuer: "Apple Developer",
    issueDate: "2023-11-01",
    expiryDate: "2024-11-01",
    status: "expired",
    managerName: "박민수"
  },
  {
    id: "5",
    name: "스테이징 서버",
    type: "SSL/TLS 인증서",
    domain: "staging.example.com",
    issuer: "Let's Encrypt",
    issueDate: "2024-09-10",
    expiryDate: "2025-11-30",
    status: "expiring-soon",
    managerName: "최지영"
  },
  {
    id: "6",
    name: "Admin 대시보드",
    type: "SSL/TLS 인증서",
    domain: "admin.example.com",
    issuer: "Comodo",
    issueDate: "2024-03-01",
    expiryDate: "2026-03-01",
    status: "valid",
    managerName: "정수진"
  }
];

export default function App() {
  // 테스트 모드 여부 확인 (로컬 백엔드 사용 여부)
  const IS_DEV_MODE = import.meta.env.DEV === true;
  
  // 서버 타입 표시 이름 변환 함수
  const formatServerType = (serverType) => {
    if (!serverType) return null;
    const typeMap = {
      'nginx': 'Nginx',
      '웹투비': 'WebtoB',
      'tomcat': 'Tomcat'
    };
    return typeMap[serverType] || serverType;
  };
  
  // 인증서는 API에서 로드하므로 빈 배열로 시작
  const [certificates, setCertificates] = useState([]);
  const [servers, setServers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("certificates"); // "certificates" or "servers"
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [renewFormData, setRenewFormData] = useState({
    serverId: '',
    deployImmediately: false
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    domain: '',
    challengeType: 'DNS',
    serverId: '',
    alarmDaysBefore: 7, // 만료 전 알람 발송 일자
    managerName: '',
    deployImmediately: false
  });
  const [sshEditMode, setSshEditMode] = useState(false);
  const [sshEditServerId, setSshEditServerId] = useState(null);
  const [sshEditData, setSshEditData] = useState({
    sshUsername: '',
    sshPort: 22,
    deployPath: '',
    sshAuthType: 'password',
    sshPassword: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [deployConfirmDialogOpen, setDeployConfirmDialogOpen] = useState(false);
  const [pendingDeployData, setPendingDeployData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [renewProgressDialogOpen, setRenewProgressDialogOpen] = useState(false);
  const [renewProgress, setRenewProgress] = useState({
    step: 0, // 0: 대기, 1: 인증서 갱신 중, 2: 파일 배포 중, 3: 갱신 완료, -1: 실패
    message: '',
    error: null, // 오류 메시지
    type: 'renew' // 'renew' or 'add'
  });
  const renewCancelledRef = useRef(false); // 갱신 취소 플래그 (ref 사용)
  const addCancelledRef = useRef(false); // 추가 취소 플래그 (ref 사용)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [httpsTestResult, setHttpsTestResult] = useState(null);
  const [isTestingHttps, setIsTestingHttps] = useState(false);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true);

  // 페이지 진입 시 서버 목록 및 인증서 목록 로드
  useEffect(() => {
    // 페이지 진입과 동시에 인증서 정보 로드
    loadCertificates();
    loadServers();
  }, []);

  /**
   * 인증서 목록을 API에서 가져오는 함수
   * 페이지 진입 시 자동으로 호출됨
   */
  const loadCertificates = async () => {
    try {
      setIsLoadingCertificates(true);
      console.log('인증서 목록 조회 시작...');
      const response = await getCertificatesAPI(0, 100);
      
      if (response && response.content) {
        // API 응답을 프론트엔드 형식으로 변환
        const transformedCertificates = response.content.map(cert => {
          // 백엔드 CertificateStatus를 프론트엔드 상태로 변환
          let status = 'expired';
          if (cert.status === 'ACTIVE') {
            status = 'valid';
          } else if (cert.status === 'EXPIRING_SOON') {
            status = 'expiring-soon';
          } else if (cert.status === 'EXPIRED' || cert.status === 'REVOKED' || cert.status === 'FAILED' || cert.status === 'INACTIVE') {
            status = 'expired';
          } else if (cert.status === 'PENDING' || cert.status === 'ISSUING' || cert.status === 'RENEWING') {
            // 처리 중인 상태는 valid로 표시 (UI에서 처리 중 표시 가능)
            status = 'valid';
          }
          
          return {
            id: String(cert.id),
            name: cert.domain || `인증서 #${cert.id}`,
            type: "SSL/TLS 인증서",
            domain: cert.domain,
            issuer: cert.issuer || "Let's Encrypt",
            issueDate: cert.issuedAt ? new Date(cert.issuedAt).toISOString().split('T')[0] : '',
            expiryDate: cert.expiresAt ? new Date(cert.expiresAt).toISOString().split('T')[0] : '',
            status: status,
            alarmDaysBefore: 7,
            managerName: '',
            serverId: cert.serverId,
            deployedAt: cert.deployedAt,
            // 백엔드 원본 상태도 저장 (필요시 사용)
            rawStatus: cert.status,
            renewalAttempts: cert.renewalAttempts || 0,
            lastError: cert.lastError || null
          };
        });
        
        setCertificates(transformedCertificates);
        console.log(`인증서 목록 로드 완료: ${transformedCertificates.length}개`);
      } else {
        console.log('인증서 목록이 비어있습니다.');
        setCertificates([]);
      }
    } catch (err) {
      console.error('인증서 목록 조회 실패:', err);
      setCertificates([]);
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  const loadServers = async () => {
    try {
      // 서버 API는 백엔드에 아직 구현되지 않음 - 더미 데이터 사용
      // TODO: 백엔드 API 구현 후 실제 API 호출로 변경
      const serversData = await getServers(); // getServers는 내부적으로 더미 데이터 반환
      setServers(serversData || []);
    } catch (err) {
      console.error('서버 목록 조회 실패:', err);
      setServers([]);
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
    const cert = certificates.find(c => c.id === id);
    setSelectedCertId(id);
    
    // 기존 서버 정보가 있으면 설정
    if (cert && cert.serverId) {
      setRenewFormData({
        serverId: String(cert.serverId),
        deployImmediately: false
      });
    } else {
      // 서버 정보가 없으면 초기화
      setRenewFormData({
        serverId: '',
        deployImmediately: false
      });
    }
    
    // SSH 편집 모드 초기화
    setSshEditMode(false);
    setSshEditServerId(null);
    
    setRenewDialogOpen(true);
  };

  const confirmRenew = async () => {
    if (!selectedCertId) return;

    const cert = certificates.find(c => c.id === selectedCertId);
    if (!cert) return;

    // 서버 정보가 없고 배포 설정도 안 되어 있으면
    if (!cert.serverId && !renewFormData.serverId) {
      alert('서버 배포 설정을 선택해주세요.');
      return;
    }

    // 서버 정보 검증 (서버 선택 시 서버에 SSH 정보가 있는지 확인)
    if (renewFormData.serverId) {
      const selectedServer = servers.find(s => String(s.id) === String(renewFormData.serverId));
      if (!selectedServer) {
        alert('선택한 서버를 찾을 수 없습니다.');
        return;
      }
      // 갱신 시에는 항상 배포하므로 SSH 정보 필수
      if (!selectedServer.sshUsername || !selectedServer.deployPath) {
        alert('인증서 갱신 시 배포를 위해 서버에 SSH 정보가 설정되어 있어야 합니다. 서버 관리에서 SSH 정보를 설정해주세요.');
        return;
      }
    }

    // 서버 배포 설정이 있으면 인증서에 업데이트
    if (renewFormData.serverId) {
      setCertificates(prev => prev.map(c => 
        c.id === selectedCertId 
          ? { 
              ...c, 
              serverId: renewFormData.serverId
            }
          : c
      ));
    }

    // 갱신 다이얼로그 닫기
    setRenewDialogOpen(false);
    
    // 진행 다이얼로그 열기
    setRenewProgressDialogOpen(true);
    setRenewProgress({ step: 0, message: '갱신을 시작합니다...', error: null, type: 'renew' });
    renewCancelledRef.current = false; // 취소 플래그 초기화

    try {
      // 1. 인증서 갱신 중
      setRenewProgress({ step: 1, message: '인증서 갱신 중...', error: null, type: 'renew' });
      
      // 백엔드 API로 인증서 갱신 (비개발 모드에서만)
      let renewedCert = null;
      if (!IS_DEV_MODE) {
        try {
          renewedCert = await renewCertificateAPI(Number(selectedCertId));
        } catch (error) {
          console.error('인증서 갱신 실패:', error);
          setRenewProgress({ 
            step: -1, 
            message: '갱신 실패', 
            error: error.message || '인증서 갱신에 실패했습니다.', 
            type: 'renew' 
          });
          setTimeout(() => {
            setRenewProgressDialogOpen(false);
            setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
            renewCancelledRef.current = false;
            setSelectedCertId(null);
            setRenewFormData({ 
              serverId: '', 
              deployImmediately: false 
            });
          }, 3000);
          return;
        }
      } else {
        // 개발 모드: 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // 취소 확인
      if (renewCancelledRef.current) {
        setRenewProgress({ step: -1, message: '갱신 취소됨', error: '사용자에 의해 갱신이 취소되었습니다.', type: 'renew' });
        setTimeout(() => {
          setRenewProgressDialogOpen(false);
          setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
          renewCancelledRef.current = false;
          setSelectedCertId(null);
          setRenewFormData({ 
        serverId: '', 
        deployImmediately: false 
      });
        }, 3000);
        return;
      }

      // API 응답을 프론트엔드 형식으로 변환하여 인증서 업데이트
      if (renewedCert) {
        let status = 'valid';
        if (renewedCert.status === 'ACTIVE') {
          status = 'valid';
        } else if (renewedCert.status === 'EXPIRING_SOON') {
          status = 'expiring-soon';
        } else if (renewedCert.status === 'EXPIRED' || renewedCert.status === 'REVOKED' || renewedCert.status === 'FAILED' || renewedCert.status === 'INACTIVE') {
          status = 'expired';
        } else if (renewedCert.status === 'PENDING' || renewedCert.status === 'ISSUING' || renewedCert.status === 'RENEWING') {
          status = 'valid';
        }
        
        setCertificates(prev => prev.map(cert => 
          cert.id === selectedCertId 
            ? { 
                ...cert, 
                status: status,
                expiryDate: renewedCert.expiresAt ? new Date(renewedCert.expiresAt).toISOString().split('T')[0] : cert.expiryDate,
                rawStatus: renewedCert.status,
                renewalAttempts: renewedCert.renewalAttempts || cert.renewalAttempts || 0,
                lastError: renewedCert.lastError || null
              }
            : cert
        ));
      } else {
        // 개발 모드: 더미 데이터 업데이트
        setCertificates(prev => prev.map(cert => 
          cert.id === selectedCertId 
            ? { 
                ...cert, 
                status: 'valid', 
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              }
            : cert
        ));
      }

      // 2. 파일 배포 중
      setRenewProgress({ step: 2, message: '파일 배포 중...', error: null, type: 'renew' });
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션 지연
      
      // 취소 확인
      if (renewCancelledRef.current) {
        setRenewProgress({ step: -1, message: '갱신 취소됨', error: '사용자에 의해 갱신이 취소되었습니다.', type: 'renew' });
        setTimeout(() => {
          setRenewProgressDialogOpen(false);
          setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
          renewCancelledRef.current = false;
          setSelectedCertId(null);
          setRenewFormData({ 
        serverId: '', 
        deployImmediately: false 
      });
        }, 3000);
        return;
      }

      // 3. 갱신 완료
      setRenewProgress({ step: 3, message: '갱신 완료!', error: null, type: 'renew' });
      await new Promise(resolve => setTimeout(resolve, 2000)); // 완료 메시지 표시 시간 (2초)

      // 취소 확인 (완료 전 마지막 확인)
      if (renewCancelledRef.current) {
        setRenewProgress({ step: -1, message: '갱신 취소됨', error: '사용자에 의해 갱신이 취소되었습니다.', type: 'renew' });
        setTimeout(() => {
          setRenewProgressDialogOpen(false);
          setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
          renewCancelledRef.current = false;
          setSelectedCertId(null);
          setRenewFormData({ 
        serverId: '', 
        deployImmediately: false 
      });
        }, 3000);
        return;
      }

      // 인증서 목록 재로드 (최신 상태 가져오기)
      if (!IS_DEV_MODE) {
        await loadCertificates();
      }
      
      // HTTPS 테스트 자동 실행
      const updatedCert = certificates.find(c => c.id === selectedCertId);
      if (updatedCert && updatedCert.domain) {
        await handleHttpsTest(updatedCert.domain, selectedCertId);
      }

      // 다이얼로그 닫기
      setRenewProgressDialogOpen(false);
      setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
      renewCancelledRef.current = false;
      setSelectedCertId(null);
      setRenewFormData({ 
        serverId: '', 
        sshUserId: '', 
        sshUserInputMode: 'select',
        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
        deployImmediately: false 
      });
    } catch (err) {
      console.error('인증서 갱신 실패:', err);
      // 실패 상태로 변경
      setRenewProgress({ 
        step: -1, 
        message: '갱신 실패', 
        error: err.message || '인증서 갱신 중 오류가 발생했습니다.',
        type: 'renew'
      });
      // 3초 후 다이얼로그 닫기
      setTimeout(() => {
        setRenewProgressDialogOpen(false);
        setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
        renewCancelledRef.current = false;
        setSelectedCertId(null);
        setRenewFormData({ 
        serverId: '', 
        sshUserId: '', 
        sshUserInputMode: 'select',
        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
        deployImmediately: false 
      });
      }, 3000);
    }
  };

  // AI 채팅에서 사용할 인증서 갱신 함수
  const handleChatRenew = async (certificateId) => {
    const cert = certificates.find(c => c.id === certificateId);
    if (!cert) return false;
    
    setCertificates(prev => prev.map(c => 
      c.id === certificateId 
        ? { ...c, status: 'valid', expiryDate: '2026-11-05' }
        : c
    ));
    
    // HTTPS 테스트 자동 실행
    if (cert.domain) {
      setTimeout(() => {
        handleHttpsTest(cert.domain, certificateId);
      }, 100);
    }
    
    return true;
  };

  const handleViewDetails = async (id) => {
    try {
      // 로컬 상태에서 먼저 확인
      let cert = certificates.find(c => c.id === id);
      
      // API에서 최신 정보 가져오기 (비개발 모드에서만)
      if (!IS_DEV_MODE && id) {
        try {
          const apiCert = await getCertificateAPI(Number(id));
          if (apiCert) {
            // API 응답을 프론트엔드 형식으로 변환
            let status = 'expired';
            if (apiCert.status === 'ACTIVE') {
              status = 'valid';
            } else if (apiCert.status === 'EXPIRING_SOON') {
              status = 'expiring-soon';
            } else if (apiCert.status === 'EXPIRED' || apiCert.status === 'REVOKED' || apiCert.status === 'FAILED' || apiCert.status === 'INACTIVE') {
              status = 'expired';
            } else if (apiCert.status === 'PENDING' || apiCert.status === 'ISSUING' || apiCert.status === 'RENEWING') {
              status = 'valid';
            }
            
            cert = {
              id: String(apiCert.id),
              name: apiCert.domain || `인증서 #${apiCert.id}`,
              type: "SSL/TLS 인증서",
              domain: apiCert.domain,
              issuer: apiCert.issuer || "Let's Encrypt",
              issueDate: apiCert.issuedAt ? new Date(apiCert.issuedAt).toISOString().split('T')[0] : '',
              expiryDate: apiCert.expiresAt ? new Date(apiCert.expiresAt).toISOString().split('T')[0] : '',
              status: status,
              alarmDaysBefore: cert?.alarmDaysBefore || 7,
              managerName: cert?.managerName || '',
              serverId: apiCert.serverId || cert?.serverId,
              deployedAt: apiCert.deployedAt || cert?.deployedAt,
              rawStatus: apiCert.status,
              renewalAttempts: apiCert.renewalAttempts || 0,
              lastError: apiCert.lastError || null
            };
            
            // 로컬 상태도 업데이트
            setCertificates(prev => prev.map(c => 
              c.id === id ? cert : c
            ));
          }
        } catch (error) {
          console.error('인증서 상세 조회 실패:', error);
          // API 호출 실패 시 로컬 상태 사용
        }
      }
      
      if (cert) {
        setSelectedCertificate(cert);
        setDetailDialogOpen(true);
        setHttpsTestResult(null);
      }
    } catch (error) {
      console.error('상세보기 로드 실패:', error);
      alert('인증서 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleHttpsTest = async (domain, certificateId = null) => {
    if (!domain) return;
    
    // certificateId가 없으면 도메인으로 인증서 찾기
    const certToUpdate = certificateId 
      ? certificates.find(c => c.id === certificateId)
      : certificates.find(c => c.domain === domain);
    
    // 상세보기 다이얼로그가 열려있을 때만 테스트 결과 표시
    if (selectedCertificate && selectedCertificate.domain === domain) {
      setIsTestingHttps(true);
      setHttpsTestResult(null);
    }
    
    try {
      const url = `https://${domain}`;
      const startTime = Date.now();
      
      // Image 객체를 사용하여 HTTPS 연결 테스트 (CORS 제약 없음)
      const testImage = new Image();
      
      const testPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('타임아웃'));
        }, 10000);
        
        testImage.onload = () => {
          clearTimeout(timeout);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          resolve({
            success: true,
            message: `HTTPS 연결 성공 (응답 시간: ${responseTime}ms)`,
            responseTime
          });
        };
        
        testImage.onerror = () => {
          clearTimeout(timeout);
          // Image 로드 실패는 HTTPS 실패를 의미하지 않을 수 있으므로 fetch로 재시도
          fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          })
            .then(() => {
              const endTime = Date.now();
              const responseTime = endTime - startTime;
              resolve({
                success: true,
                message: `HTTPS 연결 성공 (응답 시간: ${responseTime}ms)`,
                responseTime
              });
            })
            .catch(() => {
              reject(new Error('HTTPS 연결 실패'));
            });
        };
      });
      
      // favicon이나 작은 이미지 리소스로 테스트
      testImage.src = `${url}/favicon.ico?t=${Date.now()}`;
      
      const result = await testPromise;
      
      // 상세보기 다이얼로그가 열려있을 때만 테스트 결과 표시
      if (selectedCertificate && selectedCertificate.domain === domain) {
        setHttpsTestResult(result);
      }
      
      // 인증서에 테스트 결과 저장
      if (certToUpdate) {
        setCertificates(prev => prev.map(cert => 
          cert.id === certToUpdate.id 
            ? { ...cert, httpsTestFailed: false, httpsTestDate: new Date().toISOString() }
            : cert
        ));
      }
    } catch (error) {
      // fetch로 재시도
      try {
        const url = `https://${domain}`;
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch(url, {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        const result = {
          success: true,
          message: `HTTPS 연결 성공 (응답 시간: ${responseTime}ms)`,
          responseTime
        };
        
        // 상세보기 다이얼로그가 열려있을 때만 테스트 결과 표시
        if (selectedCertificate && selectedCertificate.domain === domain) {
          setHttpsTestResult(result);
        }
        
        // 인증서에 테스트 결과 저장
        if (certToUpdate) {
          setCertificates(prev => prev.map(cert => 
            cert.id === certToUpdate.id 
              ? { ...cert, httpsTestFailed: false, httpsTestDate: new Date().toISOString() }
              : cert
          ));
        }
      } catch (err) {
        const result = {
          success: false,
          message: `HTTPS 연결 실패: ${err.name === 'AbortError' ? '타임아웃 (5초 초과)' : '연결할 수 없습니다'}`,
          responseTime: null
        };
        
        // 상세보기 다이얼로그가 열려있을 때만 테스트 결과 표시
        if (selectedCertificate && selectedCertificate.domain === domain) {
          setHttpsTestResult(result);
        }
        
        // 인증서에 테스트 실패 결과 저장
        if (certToUpdate) {
          setCertificates(prev => prev.map(cert => 
            cert.id === certToUpdate.id 
              ? { ...cert, httpsTestFailed: true, httpsTestDate: new Date().toISOString() }
              : cert
          ));
        }
      }
    } finally {
      if (selectedCertificate && selectedCertificate.domain === domain) {
        setIsTestingHttps(false);
      }
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
      
      // 서버 정보 검증 (서버 선택 시 서버에 SSH 정보가 있는지 확인)
      if (addFormData.serverId) {
        const selectedServer = servers.find(s => String(s.id) === String(addFormData.serverId));
        if (!selectedServer) {
          alert('선택한 서버를 찾을 수 없습니다.');
          setIsSubmitting(false);
          return;
        }
        if (!selectedServer.sshUsername || !selectedServer.deployPath) {
          alert('선택한 서버에 SSH 정보가 설정되지 않았습니다. 서버 관리에서 SSH 정보를 설정해주세요.');
          setIsSubmitting(false);
          return;
        }
      }

      // 담당자 정보 검증 (필수)
      if (!addFormData.managerName.trim()) {
        alert('담당자 이름은 필수 입력 항목입니다.');
        setIsSubmitting(false);
        return;
      }

      // 백엔드 API로 인증서 생성 (비개발 모드에서만)
      let createdCert = null;
      if (!IS_DEV_MODE) {
        try {
          createdCert = await createCertificateAPI({
            domain: addFormData.domain.trim(),
            challengeType: addFormData.challengeType === 'DNS' ? 'DNS-01' : 'HTTP-01'
          });
        } catch (error) {
          console.error('인증서 생성 실패:', error);
          alert(`인증서 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // API 응답을 프론트엔드 형식으로 변환
      let status = 'valid';
      if (createdCert) {
        if (createdCert.status === 'ACTIVE') {
          status = 'valid';
        } else if (createdCert.status === 'EXPIRING_SOON') {
          status = 'expiring-soon';
        } else if (createdCert.status === 'EXPIRED' || createdCert.status === 'REVOKED' || createdCert.status === 'FAILED' || createdCert.status === 'INACTIVE') {
          status = 'expired';
        } else if (createdCert.status === 'PENDING' || createdCert.status === 'ISSUING' || createdCert.status === 'RENEWING') {
          status = 'valid';
        }
      }
      
      const newCert = {
        id: createdCert ? String(createdCert.id) : String(Date.now()),
        name: addFormData.domain.trim(),
        type: "SSL/TLS 인증서",
        domain: addFormData.domain.trim(),
        issuer: createdCert?.issuer || "Let's Encrypt",
        issueDate: createdCert?.issuedAt ? new Date(createdCert.issuedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: createdCert?.expiresAt ? new Date(createdCert.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: status,
        serverId: addFormData.serverId || null,
        alarmDaysBefore: addFormData.alarmDaysBefore || 7,
        managerName: addFormData.managerName.trim(),
        rawStatus: createdCert?.status || 'ACTIVE',
        renewalAttempts: createdCert?.renewalAttempts || 0,
        lastError: createdCert?.lastError || null
      };
      
      setCertificates(prev => [newCert, ...prev]);
      
      // 배포 옵션이 선택되었으면 배포 프로세스 시작
      if (addFormData.deployImmediately && addFormData.serverId) {
        setAddDialogOpen(false);
        
        // 진행 다이얼로그 열기
        setRenewProgressDialogOpen(true);
        setRenewProgress({ step: 0, message: '인증서 생성 및 배포를 시작합니다...', error: null, type: 'add' });
        addCancelledRef.current = false;
        
        // 배포 프로세스 시작 (서버의 SSH 정보 사용)
        confirmAddAndDeploy(newCert.id, addFormData.serverId);
      } else {
        // 인증서 목록 재로드 (최신 상태 가져오기)
        if (!IS_DEV_MODE) {
          await loadCertificates();
        }
        
        alert("새 인증서가 성공적으로 추가되었습니다!");
        setAddDialogOpen(false);
        setAddFormData({ 
          domain: '', 
          challengeType: 'DNS', 
          serverId: '', 
          alarmDaysBefore: 7,
          managerName: '',
          deployImmediately: false 
        });
        
        // HTTPS 테스트 자동 실행
        if (newCert.domain) {
          // 인증서 목록이 업데이트된 후 HTTPS 테스트 실행
          setTimeout(() => {
            handleHttpsTest(newCert.domain, newCert.id);
          }, 100);
        }
      }
    } catch (err) {
      console.error('인증서 생성 실패:', err);
      alert(`인증서 추가에 실패했습니다: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmAddAndDeploy = async (certificateId, serverId) => {
    try {
      // 1. 인증서 생성 중
      setRenewProgress({ step: 1, message: '인증서 생성 중...', error: null, type: 'add' });
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션 지연
      
      // 취소 확인
      if (addCancelledRef.current) {
        setRenewProgress({ step: -1, message: '생성 취소됨', error: '사용자에 의해 인증서 생성이 취소되었습니다.', type: 'add' });
        setTimeout(() => {
          setRenewProgressDialogOpen(false);
          setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
          addCancelledRef.current = false;
          setAddFormData({ 
            domain: '', 
            challengeType: 'DNS', 
            serverId: '', 
            alarmDaysBefore: 7,
            deployImmediately: false 
          });
        }, 3000);
        return;
      }

      // 2. 파일 배포 중
      setRenewProgress({ step: 2, message: '파일 배포 중...', error: null, type: 'add' });
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션 지연
      
      // 취소 확인
      if (addCancelledRef.current) {
        setRenewProgress({ step: -1, message: '배포 취소됨', error: '사용자에 의해 배포가 취소되었습니다.', type: 'add' });
        setTimeout(() => {
          setRenewProgressDialogOpen(false);
          setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
          addCancelledRef.current = false;
          setAddFormData({ 
            domain: '', 
            challengeType: 'DNS', 
            serverId: '', 
            alarmDaysBefore: 7,
            deployImmediately: false 
          });
        }, 3000);
        return;
      }

      // 3. 완료
      setRenewProgress({ step: 3, message: '완료!', error: null, type: 'add' });
      await new Promise(resolve => setTimeout(resolve, 2000)); // 완료 메시지 표시 시간 (2초)

      // 취소 확인 (완료 전 마지막 확인)
      if (addCancelledRef.current) {
        setRenewProgress({ step: -1, message: '취소됨', error: '사용자에 의해 프로세스가 취소되었습니다.', type: 'add' });
        setTimeout(() => {
          setRenewProgressDialogOpen(false);
          setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
          addCancelledRef.current = false;
          setAddFormData({ 
            domain: '', 
            challengeType: 'DNS', 
            serverId: '', 
            alarmDaysBefore: 7,
            deployImmediately: false 
          });
        }, 3000);
        return;
      }

      // HTTPS 테스트 자동 실행
      const deployedCert = certificates.find(c => c.id === certificateId);
      if (deployedCert && deployedCert.domain) {
        await handleHttpsTest(deployedCert.domain, certificateId);
      }

      // 다이얼로그 닫기
      setRenewProgressDialogOpen(false);
      setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
      addCancelledRef.current = false;
      setAddFormData({ 
        domain: '', 
        challengeType: 'DNS', 
        serverId: '', 
        sshUserId: '', 
        sshUserInputMode: 'select',
        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
        deployImmediately: false 
      });
    } catch (err) {
      console.error('인증서 생성 및 배포 실패:', err);
      setRenewProgress({ 
        step: -1, 
        message: '생성 실패', 
        error: err.message || '인증서 생성 및 배포 중 오류가 발생했습니다.',
        type: 'add'
      });
      setTimeout(() => {
        setRenewProgressDialogOpen(false);
        setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
        addCancelledRef.current = false;
      }, 3000);
    }
  };

  const handleConfirmDeploy = async () => {
    if (!pendingDeployData) return;

    try {
      setIsSubmitting(true);
      
      // 더미 배포 결과 (테스트용)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const selectedServer = servers.find(s => String(s.id) === String(pendingDeployData.serverId));
      
      // 인증서에 서버 ID 및 SSH 유저 ID 업데이트
      const deployedCert = certificates.find(c => c.id === pendingDeployData.certificateId);
      if (deployedCert) {
        setCertificates(prev => prev.map(cert => 
          cert.id === pendingDeployData.certificateId 
            ? { 
                ...cert, 
                serverId: pendingDeployData.serverId,
              }
            : cert
        ));
      }
      
      alert(`인증서가 서버 "${selectedServer?.name || '알 수 없음'}"에 성공적으로 배포되었습니다!`);
      setDeployConfirmDialogOpen(false);
      setPendingDeployData(null);
      setAddFormData({ 
        domain: '', 
        challengeType: 'DNS', 
        serverId: '', 
        sshUserId: '', 
        sshUserInputMode: 'select',
        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
        deployImmediately: false 
      });
      
      // HTTPS 테스트 자동 실행
      if (deployedCert && deployedCert.domain) {
        setTimeout(() => {
          handleHttpsTest(deployedCert.domain, deployedCert.id);
        }, 100);
      }
    } catch (err) {
      console.error('배포 실패:', err);
      alert(`배포에 실패했습니다: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 서버 관리 핸들러
  const handleAddServer = async (serverData) => {
    try {
      // 더미 서버 데이터 생성
      await new Promise(resolve => setTimeout(resolve, 500));
      const newServer = {
        id: Date.now(),
        ...serverData,
      };
      
      setServers(prev => [...prev, newServer]);
      alert("서버가 성공적으로 추가되었습니다!");
    } catch (err) {
      console.error('서버 추가 실패:', err);
      alert(`서버 추가에 실패했습니다: ${err.message}`);
    }
  };

  const handleUpdateServer = async (serverData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedServer = { ...serverData };
      
      setServers(prev => prev.map(s => String(s.id) === String(updatedServer.id) ? updatedServer : s));
      alert("SSH 정보가 변경되었습니다!");
    } catch (err) {
      console.error('서버 수정 실패:', err);
      alert(`서버 수정에 실패했습니다: ${err.message}`);
    }
  };

  const handleDeleteServer = async (serverId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setServers(prev => prev.filter(s => String(s.id) !== String(serverId)));
      alert("서버가 성공적으로 삭제되었습니다!");
    } catch (err) {
      console.error('서버 삭제 실패:', err);
      alert(`서버 삭제에 실패했습니다: ${err.message}`);
    }
  };


  return (
    <div className="app-container">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <div 
              className="header-left" 
              onClick={() => setActiveTab('certificates')}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-icon">
                <img 
                  src={hanwhaLogo} 
                  alt="한화 로고" 
                  className="header-logo"
                />
              </div>
              <div className="header-title">
                <h1>인증서 관리 시스템</h1>
                <p className="header-subtitle">Certificate Management Dashboard</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('servers')}
                className={`btn ${activeTab === 'servers' ? 'btn-primary' : 'btn-outline'} responsive-icon-button`}
              >
                <ServerIcon style={{ width: '1rem', height: '1rem' }} className="button-icon" />
                <span className="button-text">서버 관리</span>
              </button>
              <button 
                onClick={() => {
                  setActiveTab('certificates');
                  setAddDialogOpen(true);
                }}
                className="btn btn-primary responsive-icon-button"
              >
                <Plus style={{ width: '1rem', height: '1rem' }} className="button-icon" />
                <span className="button-text">새 인증서 추가</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {/* 탭 전환 */}
        {activeTab === 'certificates' ? (
          <>
            {/* 통계 */}
            <div className="stats-section">
              <CertificateStats 
                {...stats} 
                onFilterChange={(status) => setFilterStatus(status)}
                currentFilter={filterStatus}
              />
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
        {isLoadingCertificates ? (
          <div className="empty-state-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <Loader2 className="empty-state-icon" style={{ width: '3rem', height: '3rem', color: '#f97316', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ marginTop: '1rem' }}>인증서 데이터를 불러오는 중...</h3>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="certificates-grid">
            {filteredCertificates.map((cert) => {
              const hasServer = cert.serverId !== null && cert.serverId !== undefined;
              const httpsTestFailed = cert.httpsTestFailed === true;
              return (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  onRenew={handleRenew}
                  onViewDetails={handleViewDetails}
                  hasServer={hasServer}
                  httpsTestFailed={httpsTestFailed}
                />
              );
            })}
          </div>
        ) : (
          <div className="empty-state-full">
            <Shield className="empty-state-icon" />
            <h3>인증서가 없습니다</h3>
            <p>검색 조건을 변경하거나 새 인증서를 추가해보세요.</p>
          </div>
        )}
          </>
        ) : activeTab === 'servers' && (
          <ServerManagement
            servers={servers}
            onAddServer={handleAddServer}
            onUpdateServer={handleUpdateServer}
            onDeleteServer={handleDeleteServer}
          />
        )}
      </main>

      {/* 갱신 다이얼로그 */}
      {renewDialogOpen && selectedCertId && (() => {
        const cert = certificates.find(c => c.id === selectedCertId);
        const hasServer = cert && cert.serverId;
        const needsServerSetup = !hasServer;
        
        return (
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
                setRenewDialogOpen(false);
                setRenewFormData({ 
                  serverId: '', 
                  deployImmediately: false 
                });
              }
              setMouseDownTarget(null);
            }}
          >
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <div>
                  <h2 className="dialog-title">인증서 갱신</h2>
                  <p className="dialog-description">
                    {needsServerSetup 
                      ? '배포된 서버 정보가 없습니다. 서버 배포 설정을 선택해주세요.'
                      : '이 인증서를 갱신하시겠습니까? 서버 정보를 확인하고 수정할 수 있습니다.'}
                  </p>
                </div>
              </div>
              
              <div className="dialog-body" style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>서버 배포 설정</h3>
                  
                  <div className="form-group">
                    <label className="form-label">서버 선택</label>
                    {servers.length === 0 ? (
                      <small style={{ color: '#dc2626', fontSize: '0.875rem', display: 'block' }}>
                        등록된 서버가 없습니다. 먼저 서버를 추가해주세요.
                      </small>
                    ) : (
                      <select 
                        className="form-select"
                        value={renewFormData.serverId}
                        onChange={(e) => {
                          setRenewFormData(prev => ({ 
                            ...prev, 
                            serverId: e.target.value
                          }));
                          // 서버 변경 시 SSH 편집 모드 초기화
                          setSshEditMode(false);
                          setSshEditServerId(null);
                        }}
                      >
                        <option value="">서버를 선택하세요</option>
                        {servers.map(server => (
                          <option key={server.id} value={server.id}>
                            {server.name} ({server.host}:{server.port})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                      {renewFormData.serverId && (() => {
                        const selectedServer = servers.find(s => String(s.id) === String(renewFormData.serverId));
                        const isEditingSsh = sshEditMode && sshEditServerId === renewFormData.serverId;
                        
                        return selectedServer && (
                          <div className="form-group">
                            <div style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #f97316',
                              borderRadius: '0.375rem',
                              marginBottom: '1rem',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <small style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                  선택한 서버의 SSH 정보
                                </small>
                                {!isEditingSsh && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSshEditMode(true);
                                      setSshEditServerId(renewFormData.serverId);
                                      setSshEditData({
                                        sshUsername: selectedServer.sshUsername || '',
                                        sshPort: selectedServer.sshPort || 22,
                                        deployPath: selectedServer.deployPath || '',
                                        sshAuthType: 'password',
                                        sshPassword: selectedServer.sshPassword || ''
                                      });
                                    }}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem',
                                      backgroundColor: '#f97316',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    수정하기
                                  </button>
                                )}
                              </div>
                              {isEditingSsh ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>SSH 사용자명</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={sshEditData.sshUsername}
                                      onChange={(e) => setSshEditData(prev => ({ ...prev, sshUsername: e.target.value }))}
                                      style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>SSH 포트</label>
                                    <input
                                      type="number"
                                      className="form-input"
                                      value={sshEditData.sshPort}
                                      onChange={(e) => setSshEditData(prev => ({ ...prev, sshPort: parseInt(e.target.value) || 22 }))}
                                      style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>배포 경로</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={sshEditData.deployPath}
                                      onChange={(e) => setSshEditData(prev => ({ ...prev, deployPath: e.target.value }))}
                                      style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>비밀번호</label>
                                    <input
                                      type="password"
                                      className="form-input"
                                      value={sshEditData.sshPassword}
                                      onChange={(e) => setSshEditData(prev => ({ ...prev, sshPassword: e.target.value }))}
                                      style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                      disabled={isSubmitting}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!sshEditData.sshUsername.trim() || !sshEditData.deployPath.trim()) {
                                          alert('SSH 사용자명과 배포 경로는 필수 입력 항목입니다.');
                                          return;
                                        }
                                        
                                        setIsSubmitting(true);
                                        try {
                                          await handleUpdateServer({
                                            ...selectedServer,
                                            ...sshEditData
                                          });
                                          setSshEditMode(false);
                                          setSshEditServerId(null);
                                        } catch (err) {
                                          console.error('SSH 정보 수정 실패:', err);
                                        } finally {
                                          setIsSubmitting(false);
                                        }
                                      }}
                                      disabled={isSubmitting}
                                      style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.75rem',
                                        backgroundColor: '#f97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      적용
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSshEditMode(false);
                                        setSshEditServerId(null);
                                        setSshEditData({
                                          sshUsername: '',
                                          sshPort: 22,
                                          deployPath: '',
                                          sshAuthType: 'password',
                                          sshPassword: '',
                                        });
                                      }}
                                      disabled={isSubmitting}
                                      style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.75rem',
                                        backgroundColor: 'white',
                                        color: '#f97316',
                                        border: '1px solid #f97316',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>서버 타입:</span>
                                    <span style={{ color: '#6b7280' }}>{formatServerType(selectedServer.serverType) || '미설정'}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>SSH 사용자명:</span>
                                    <span style={{ color: '#6b7280' }}>{selectedServer.sshUsername || '미설정'}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>SSH 포트:</span>
                                    <span style={{ color: '#6b7280' }}>{selectedServer.sshPort || 22}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>배포 경로:</span>
                                    <span style={{ color: '#6b7280' }}>{selectedServer.deployPath || '미설정'}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>인증 방식:</span>
                                    <span style={{ color: '#6b7280' }}>비밀번호</span>
                                  </div>
                                </div>
                              )}
                              {(!selectedServer.sshUsername || !selectedServer.deployPath) && !isEditingSsh && (
                                <small style={{ color: '#dc2626', fontSize: '0.75rem', display: 'block', marginTop: '0.5rem' }}>
                                  서버에 SSH 정보가 설정되지 않았습니다. 서버 관리에서 SSH 정보를 설정해주세요.
                                </small>
                              )}
                            </div>
                          </div>
                        );
                      })()}
              </div>
              
              <div className="dialog-footer">
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    setRenewDialogOpen(false);
                    setRenewFormData({ 
        serverId: '', 
        deployImmediately: false 
      });
                  }}
                >
                  취소
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={confirmRenew}
                  disabled={isSubmitting}
                >
                  갱신하기
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 추가 다이얼로그 */}
      {addDialogOpen && (
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
              setAddDialogOpen(false);
            }
            setMouseDownTarget(null);
          }}
        >
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">새 인증서 추가</h2>
                <p className="dialog-description">
                  새로운 인증서 정보를 입력하세요.
                </p>
              </div>
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
                <label className="form-label">챌린지 타입</label>
                <input
                  type="text"
                  className="form-input"
                  value="DNS-01"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  현재 DNS-01 챌린지 타입만 지원합니다.
                </small>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <div className="form-group">
                  <label className="form-label">
                    담당자 이름 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={addFormData.managerName}
                    onChange={(e) => setAddFormData(prev => ({
                      ...prev,
                      managerName: e.target.value
                    }))}
                    placeholder="담당자 이름을 입력하세요"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>서버 배포 설정</h3>
                
                <div className="form-group">
                  <label className="form-label">서버 선택</label>
                  {servers.length === 0 ? (
                    <small style={{ color: '#dc2626', fontSize: '0.875rem', display: 'block' }}>
                      등록된 서버가 없습니다. 먼저 서버를 추가해주세요.
                    </small>
                  ) : (
                    <select 
                      className="form-select"
                      value={addFormData.serverId}
                      onChange={(e) => {
                        setAddFormData(prev => ({ 
                          ...prev, 
                          serverId: e.target.value
                        }));
                      }}
                      disabled={isSubmitting}
                    >
                      <option value="">서버를 선택하세요</option>
                      {servers.map(server => (
                        <option key={server.id} value={server.id}>
                          {server.name} ({server.host}:{server.port})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {addFormData.serverId && (() => {
                  const selectedServer = servers.find(s => String(s.id) === String(addFormData.serverId));
                  const isEditingSsh = sshEditMode && sshEditServerId === addFormData.serverId;
                  
                  return selectedServer && (
                    <div className="form-group">
                      <div style={{ 
                        padding: '0.75rem', 
                        border: '1px solid #fed7aa',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <small style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            선택한 서버의 SSH 정보
                          </small>
                          {!isEditingSsh && (
                            <button
                              type="button"
                              onClick={() => {
                                setSshEditMode(true);
                                setSshEditServerId(addFormData.serverId);
                                setSshEditData({
                                  sshUsername: selectedServer.sshUsername || '',
                                  sshPort: selectedServer.sshPort || 22,
                                  deployPath: selectedServer.deployPath || '',
                                  sshAuthType: 'password',
                                  sshPassword: selectedServer.sshPassword || ''
                                });
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                backgroundColor: '#f97316',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              수정하기
                            </button>
                          )}
                        </div>
                        {isEditingSsh ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>SSH 사용자명</label>
                              <input
                                type="text"
                                className="form-input"
                                value={sshEditData.sshUsername}
                                onChange={(e) => setSshEditData(prev => ({ ...prev, sshUsername: e.target.value }))}
                                style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>SSH 포트</label>
                              <input
                                type="number"
                                className="form-input"
                                value={sshEditData.sshPort}
                                onChange={(e) => setSshEditData(prev => ({ ...prev, sshPort: parseInt(e.target.value) || 22 }))}
                                style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>배포 경로</label>
                              <input
                                type="text"
                                className="form-input"
                                value={sshEditData.deployPath}
                                onChange={(e) => setSshEditData(prev => ({ ...prev, deployPath: e.target.value }))}
                                style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>비밀번호</label>
                              <input
                                type="password"
                                className="form-input"
                                value={sshEditData.sshPassword}
                                onChange={(e) => setSshEditData(prev => ({ ...prev, sshPassword: e.target.value }))}
                                style={{ fontSize: '0.875rem', padding: '0.375rem' }}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!sshEditData.sshUsername.trim() || !sshEditData.deployPath.trim()) {
                                    alert('SSH 사용자명과 배포 경로는 필수 입력 항목입니다.');
                                    return;
                                  }
                                  
                                  setIsSubmitting(true);
                                  try {
                                    await handleUpdateServer({
                                      ...selectedServer,
                                      ...sshEditData
                                    });
                                    setSshEditMode(false);
                                    setSshEditServerId(null);
                                    // 서버 목록 업데이트 후 다시 로드
                                    const updatedServer = servers.find(s => String(s.id) === String(addFormData.serverId));
                                    if (updatedServer) {
                                      setAddFormData(prev => ({ ...prev, serverId: prev.serverId }));
                                    }
                                  } catch (err) {
                                    console.error('SSH 정보 수정 실패:', err);
                                  } finally {
                                    setIsSubmitting(false);
                                  }
                                }}
                                disabled={isSubmitting}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#f97316',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer'
                                }}
                              >
                                적용
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSshEditMode(false);
                                  setSshEditServerId(null);
                                  setSshEditData({
                                    sshUsername: '',
                                    sshPort: 22,
                                    deployPath: '',
                                    sshAuthType: 'password',
                                    sshPassword: '',
                                    sshPublicKey: ''
                                  });
                                }}
                                disabled={isSubmitting}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: 'white',
                                  color: '#f97316',
                                  border: '1px solid #f97316',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer'
                                }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>서버 타입:</span>
                              <span style={{ color: '#6b7280' }}>{formatServerType(selectedServer.serverType) || '미설정'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>SSH 사용자명:</span>
                              <span style={{ color: '#6b7280' }}>{selectedServer.sshUsername || '미설정'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>SSH 포트:</span>
                              <span style={{ color: '#6b7280' }}>{selectedServer.sshPort || 22}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>배포 경로:</span>
                              <span style={{ color: '#6b7280' }}>{selectedServer.deployPath || '미설정'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#374151', minWidth: '100px' }}>인증 방식:</span>
                              <span style={{ color: '#6b7280' }}>비밀번호</span>
                            </div>
                          </div>
                        )}
                        {(!selectedServer.sshUsername || !selectedServer.deployPath) && !isEditingSsh && (
                          <small style={{ color: '#dc2626', fontSize: '0.75rem', display: 'block', marginTop: '0.5rem' }}>
                            서버에 SSH 정보가 설정되지 않았습니다. 서버 관리에서 SSH 정보를 설정해주세요.
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="form-group">
                  <label className="form-label">
                    만료 전 알람 발송 일자 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={addFormData.alarmDaysBefore === null || addFormData.alarmDaysBefore === undefined ? '' : addFormData.alarmDaysBefore}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddFormData(prev => ({ ...prev, alarmDaysBefore: value === '' ? null : parseInt(value) || null }));
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value === '' || isNaN(parseInt(value)) || parseInt(value) < 1) {
                        setAddFormData(prev => ({ ...prev, alarmDaysBefore: 7 }));
                      } else {
                        const numValue = parseInt(value);
                        if (numValue > 365) {
                          setAddFormData(prev => ({ ...prev, alarmDaysBefore: 365 }));
                        } else if (numValue < 1) {
                          setAddFormData(prev => ({ ...prev, alarmDaysBefore: 7 }));
                        }
                      }
                    }}
                    placeholder="7"
                    min="1"
                    max="365"
                    disabled={isSubmitting}
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    인증서 만료 전 며칠 전에 알람을 발송할지 설정합니다. (기본값: 7일)
                  </small>
                </div>

                {addFormData.serverId && (() => {
                  const selectedServer = servers.find(s => String(s.id) === String(addFormData.serverId));
                  const hasSshInfo = selectedServer && selectedServer.sshUsername && selectedServer.deployPath;
                  return hasSshInfo && (
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={addFormData.deployImmediately}
                          onChange={(e) => setAddFormData(prev => ({ ...prev, deployImmediately: e.target.checked }))}
                          disabled={isSubmitting}
                        />
                        서버에 바로 적용하시겠습니까?
                      </label>
                      <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block', marginLeft: '1.5rem' }}>
                        체크 시 인증서 생성 후 즉시 서버에 배포하고 재기동합니다.
                      </small>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="dialog-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setAddDialogOpen(false);
                  setAddFormData({ 
                    domain: '', 
                    challengeType: 'DNS', 
                    serverId: '', 
                    alarmDaysBefore: 7,
                    managerName: '',
                    deployImmediately: false 
                  });
                }}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddCertificate}
                disabled={isSubmitting || !addFormData.domain.trim() || !addFormData.managerName.trim()}
              >
                {isSubmitting ? '추가 중...' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 갱신 진행 다이얼로그 */}
      {renewProgressDialogOpen && (
        <div className="dialog-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="dialog-content progress-dialog" onClick={(e) => e.stopPropagation()}>
            {/* 테스트 버튼 (개발용 - npm run dev일 때만 표시) */}
            {IS_DEV_MODE && (
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  // 프로세스 취소
                  if (renewProgress.type === 'add') {
                    addCancelledRef.current = true;
                  } else {
                    renewCancelledRef.current = true;
                  }
                  // 단계 1에서 실패 시뮬레이션
                  setRenewProgress({ 
                    step: -1, 
                    message: renewProgress.type === 'add' ? '생성 실패' : '갱신 실패', 
                    error: renewProgress.type === 'add' ? '인증서 발급 기관 연결 실패: 타임아웃 오류가 발생했습니다.' : '인증서 발급 기관 연결 실패: 타임아웃 오류가 발생했습니다.',
                    type: renewProgress.type || 'renew'
                  });
                  setTimeout(() => {
                    setRenewProgressDialogOpen(false);
                    setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
                    if (renewProgress.type === 'add') {
                      addCancelledRef.current = false;
                      setAddFormData({ 
                        domain: '', 
                        challengeType: 'DNS', 
                        serverId: '', 
                        sshUserId: '', 
                        sshUserInputMode: 'select',
                        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
                        deployImmediately: false 
                      });
                    } else {
                      renewCancelledRef.current = false;
                      setSelectedCertId(null);
                      setRenewFormData({ 
                        serverId: '', 
                        sshUserId: '', 
                        sshUserInputMode: 'select',
                        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
                        deployImmediately: false 
                      });
                    }
                  }, 3000);
                }}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderColor: '#dc2626'
                }}
                disabled={renewProgress.step === -1 || renewProgress.step >= 3}
              >
                단계1 실패 테스트
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  // 프로세스 취소
                  if (renewProgress.type === 'add') {
                    addCancelledRef.current = true;
                  } else {
                    renewCancelledRef.current = true;
                  }
                  // 단계 2에서 실패 시뮬레이션
                  setRenewProgress({ step: 1, message: renewProgress.type === 'add' ? '인증서 생성 중...' : '인증서 갱신 중...', error: null, type: renewProgress.type || 'renew' });
                  setTimeout(() => {
                    setRenewProgress({ 
                      step: -1, 
                      message: renewProgress.type === 'add' ? '생성 실패' : '갱신 실패', 
                      error: '서버 배포 실패: SSH 연결을 할 수 없습니다.',
                      type: renewProgress.type || 'renew'
                    });
                    setTimeout(() => {
                      setRenewProgressDialogOpen(false);
                      setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
                      if (renewProgress.type === 'add') {
                        addCancelledRef.current = false;
                        setAddFormData({ 
                          domain: '', 
                          challengeType: 'DNS', 
                          serverId: '', 
                          alarmDaysBefore: 7,
                          deployImmediately: false 
                        });
                      } else {
                        renewCancelledRef.current = false;
                        setSelectedCertId(null);
                        setRenewFormData({ 
                          serverId: '', 
                          deployImmediately: false 
                        });
                      }
                    }, 3000);
                  }, 500);
                }}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderColor: '#dc2626'
                }}
                disabled={renewProgress.step === -1 || renewProgress.step >= 3}
              >
                단계2 실패 테스트
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  // 프로세스 취소
                  if (renewProgress.type === 'add') {
                    addCancelledRef.current = true;
                  } else {
                    renewCancelledRef.current = true;
                  }
                  // 즉시 실패 시뮬레이션
                  setRenewProgress({ 
                    step: -1, 
                    message: renewProgress.type === 'add' ? '생성 실패' : '갱신 실패', 
                    error: renewProgress.type === 'add' ? '인증서 생성 중 예기치 않은 오류가 발생했습니다.' : '인증서 갱신 중 예기치 않은 오류가 발생했습니다.',
                    type: renewProgress.type || 'renew'
                  });
                  setTimeout(() => {
                    setRenewProgressDialogOpen(false);
                    setRenewProgress({ step: 0, message: '', error: null, type: 'renew' });
                    if (renewProgress.type === 'add') {
                      addCancelledRef.current = false;
                      setAddFormData({ 
                        domain: '', 
                        challengeType: 'DNS', 
                        serverId: '', 
                        sshUserId: '', 
                        sshUserInputMode: 'select',
                        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
                        deployImmediately: false 
                      });
                    } else {
                      renewCancelledRef.current = false;
                      setSelectedCertId(null);
                      setRenewFormData({ 
                        serverId: '', 
                        sshUserId: '', 
                        sshUserInputMode: 'select',
                        sshUserInputData: { username: '', password: '', privateKey: '', description: '' },
                        deployImmediately: false 
                      });
                    }
                  }, 3000);
                }}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderColor: '#dc2626'
                }}
                disabled={renewProgress.step === -1 || renewProgress.step >= 3}
              >
                즉시 실패 테스트
              </button>
              </div>
            )}
            <div className="dialog-body" style={{ padding: '2rem', textAlign: 'center' }}>
              {/* 인증서 생성/갱신 애니메이션 */}
              <div className="certificate-animation-container">
                <div className="certificate-animation-wrapper">
                  {/* 단계 1: 인증서 받아오는 중 */}
                  {renewProgress.step === 1 && (
                    <>
                      <Shield className="certificate-icon animating" size={80} />
                      <div className="certificate-particles">
                        <div className="particle particle-1"></div>
                        <div className="particle particle-2"></div>
                        <div className="particle particle-3"></div>
                        <div className="particle particle-4"></div>
                      </div>
                    </>
                  )}
                  
                  {/* 단계 2: 파일 배포 중 */}
                  {renewProgress.step === 2 && (
                    <>
                      <ServerIcon className="certificate-icon animating deploying" size={80} />
                      <div className="deploy-particles">
                        <div className="deploy-arrow deploy-arrow-1">→</div>
                        <div className="deploy-arrow deploy-arrow-2">→</div>
                        <div className="deploy-arrow deploy-arrow-3">→</div>
                      </div>
                    </>
                  )}
                  
                  {/* 단계 3: 완료 */}
                  {renewProgress.step >= 3 && (
                    <>
                      <Shield className="certificate-icon completed" size={80} />
                      <CheckCircle2 className="success-check-icon" size={32} />
                    </>
                  )}
                  
                  {/* 실패 상태 */}
                  {renewProgress.step === -1 && (
                    <>
                      <Shield className="certificate-icon failed" size={80} />
                      <XCircle className="error-check-icon" size={32} />
                    </>
                  )}
                  
                  {/* 단계 0: 시작 */}
                  {renewProgress.step === 0 && (
                    <Shield className="certificate-icon animating" size={80} />
                  )}
                </div>
                {/* 진행 상태 설명 */}
                <p className="progress-status-text">
                  {renewProgress.step === 1 && (
                    <>
                      {renewProgress.type === 'add' 
                        ? 'SSL/TLS 인증서를 발급 기관으로부터 생성하는 중입니다.'
                        : 'SSL/TLS 인증서를 발급 기관으로부터 받아오는 중입니다.'}
                      <br />
                      잠시만 기다려주세요.
                    </>
                  )}
                  {renewProgress.step === 2 && (
                    <>
                      발급받은 인증서 파일을 서버에 배포하고
                      <br />
                      웹서버 설정을 업데이트하는 중입니다.
                    </>
                  )}
                  {renewProgress.step === 3 && (
                    <>
                      {renewProgress.type === 'add' 
                        ? '인증서 생성 및 배포가 성공적으로 완료되었습니다.'
                        : '인증서 갱신이 성공적으로 완료되었습니다.'}
                      <br />
                      웹서버가 새로운 인증서로 재기동되었습니다.
                    </>
                  )}
                  {renewProgress.step === -1 && (
                    <span style={{ color: '#dc2626' }}>
                      {renewProgress.error || (renewProgress.type === 'add' ? "인증서 생성 중 오류가 발생했습니다." : "인증서 갱신 중 오류가 발생했습니다.")}
                    </span>
                  )}
                  {renewProgress.step === 0 && (
                    <>
                      {renewProgress.type === 'add' 
                        ? '인증서 생성 및 배포 프로세스를 시작합니다.'
                        : '인증서 갱신 프로세스를 시작합니다.'}
                      <br />
                      이 작업은 몇 분이 소요될 수 있습니다.
                    </>
                  )}
                </p>
              </div>

              {/* 진행 바 컨테이너 */}
              <div className="renew-progress-bar-container">
                {/* 전체 진행 바 */}
                <div className="progress-bar-wrapper">
                  <div 
                    className={`progress-bar-fill ${renewProgress.step === -1 ? 'progress-bar-fill-error' : ''}`}
                    style={{ 
                      width: renewProgress.step === -1 ? '100%' : `${Math.max(0, (renewProgress.step / 3) * 100)}%`,
                      transition: 'width 0.5s ease',
                      backgroundColor: renewProgress.step === -1 ? '#dc2626' : undefined
                    }}
                  ></div>
                </div>

                {/* 단계 표시 */}
                <div className="progress-steps-labels">
                  <div className={`progress-step-label ${renewProgress.step >= 1 && renewProgress.step !== -1 ? 'active' : ''} ${renewProgress.step > 1 && renewProgress.step !== -1 ? 'completed' : ''} ${renewProgress.step === -1 ? 'failed' : ''}`}>
                    <div className="progress-step-dot">
                      {renewProgress.step === -1 ? (
                        <XCircle className="progress-error-icon" size={20} />
                      ) : renewProgress.step > 1 ? (
                        <CheckCircle2 className="progress-check-icon" size={20} />
                      ) : renewProgress.step === 1 ? (
                        <div className="progress-spinner"></div>
                      ) : (
                        <span className="progress-step-number">1</span>
                      )}
                    </div>
                    <span className="progress-step-text">
                      {renewProgress.type === 'add' ? '인증서 생성 중' : '인증서 갱신 중'}
                    </span>
                  </div>

                  <div className={`progress-step-label ${renewProgress.step >= 2 && renewProgress.step !== -1 ? 'active' : ''} ${renewProgress.step > 2 && renewProgress.step !== -1 ? 'completed' : ''} ${renewProgress.step === -1 ? 'failed' : ''}`}>
                    <div className="progress-step-dot">
                      {renewProgress.step === -1 ? (
                        <XCircle className="progress-error-icon" size={20} />
                      ) : renewProgress.step > 2 ? (
                        <CheckCircle2 className="progress-check-icon" size={20} />
                      ) : renewProgress.step === 2 ? (
                        <div className="progress-spinner"></div>
                      ) : (
                        <span className="progress-step-number">2</span>
                      )}
                    </div>
                    <span className="progress-step-text">파일 배포 중</span>
                  </div>

                  <div className={`progress-step-label ${renewProgress.step >= 3 ? 'active completed' : ''} ${renewProgress.step === -1 ? 'failed' : ''}`}>
                    <div className="progress-step-dot">
                      {renewProgress.step === -1 ? (
                        <XCircle className="progress-error-icon" size={20} />
                      ) : renewProgress.step >= 3 ? (
                        <CheckCircle2 className="progress-check-icon success-icon" size={20} />
                      ) : (
                        <span className="progress-step-number">3</span>
                      )}
                    </div>
                    <span className="progress-step-text">
                      {renewProgress.type === 'add' ? '완료' : '갱신 완료'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배포 확인 다이얼로그 */}
      {deployConfirmDialogOpen && pendingDeployData && (
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
              setDeployConfirmDialogOpen(false);
            }
            setMouseDownTarget(null);
          }}
        >
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">서버에 인증서 배포</h2>
                <p className="dialog-description">
                  선택한 서버에 인증서를 배포하고 웹서버를 재기동하시겠습니까?
                </p>
              </div>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">인증서</label>
                <div className="form-value">
                  {certificates.find(c => c.id === pendingDeployData.certificateId)?.name || 'N/A'}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">서버</label>
                <div className="form-value">
                  {servers.find(s => String(s.id) === String(pendingDeployData.serverId))?.name || 'N/A'}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#dbeafe', 
                border: '1px solid #3b82f6',
                borderRadius: '0.375rem',
                marginTop: '1rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                  ⚠️ 이 작업은 다음을 수행합니다:
                  <br />• 인증서 파일을 서버로 전송
                  <br />• 웹서버 설정 업데이트
                  <br />• 웹서버 재기동 (Graceful reload)
                </p>
              </div>
            </div>
            <div className="dialog-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setDeployConfirmDialogOpen(false);
                  setPendingDeployData(null);
                  alert("인증서가 추가되었습니다. 나중에 배포할 수 있습니다.");
                }}
                disabled={isSubmitting}
              >
                취소 (인증서만 추가)
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmDeploy}
                disabled={isSubmitting}
              >
                {isSubmitting ? '배포 중...' : '적용 (배포 및 재기동)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세보기 다이얼로그 */}
      {detailDialogOpen && selectedCertificate && (
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
              setDetailDialogOpen(false);
            }
            setMouseDownTarget(null);
          }}
        >
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">인증서 상세 정보</h2>
                <p className="dialog-description">
                  {selectedCertificate.name}의 상세 정보입니다.
                </p>
              </div>
            </div>
            <div className="dialog-body">
              {/* 기본 인증서 정보 테이블 */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' }}>인증서 정보</h3>
                <table className="certificate-detail-table">
                  <tbody>
                    <tr>
                      <th>인증서 이름</th>
                      <td>{selectedCertificate.name}</td>
                    </tr>
                    <tr>
                      <th>도메인</th>
                      <td>{selectedCertificate.domain || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>유형</th>
                      <td>{selectedCertificate.type}</td>
                    </tr>
                    <tr>
                      <th>발급 기관</th>
                      <td>{selectedCertificate.issuer}</td>
                    </tr>
                    <tr>
                      <th>발급일</th>
                      <td>{selectedCertificate.issueDate || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>만료일</th>
                      <td>{selectedCertificate.expiryDate || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>상태</th>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span className={`badge ${
                          selectedCertificate.status === 'valid' ? 'badge-valid' :
                          selectedCertificate.status === 'expiring-soon' ? 'badge-expiring' :
                          'badge-expired'
                        }`} style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'inline-block', lineHeight: '1.2' }}>
                          {selectedCertificate.status === 'valid' ? '유효' :
                           selectedCertificate.status === 'expiring-soon' ? '곧 만료' :
                           '만료됨'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 담당자 정보 테이블 */}
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', margin: 0, marginBottom: '1rem' }}>담당자 정보</h3>
                {selectedCertificate.managerName ? (
                  <table className="certificate-detail-table">
                    <tbody>
                      <tr>
                        <th>담당자 이름</th>
                        <td>{selectedCertificate.managerName}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px dashed #e5e7eb'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                      담당자 정보가 없습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* 배포된 서버 정보 */}
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>배포된 서버 정보</h3>
                  {!selectedCertificate.serverId && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      <AlertCircle size={12} />
                      서버 미배포
                    </span>
                  )}
                </div>
                {selectedCertificate.serverId ? (
                  (() => {
                    const deployedServer = servers.find(s => String(s.id) === String(selectedCertificate.serverId));
                    if (deployedServer) {
                      // 배포 시간 포맷팅
                      const formatDate = (dateString) => {
                        if (!dateString) return 'N/A';
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                        } catch (e) {
                          return dateString;
                        }
                      };
                      
                      return (
                        <table className="certificate-detail-table">
                          <tbody>
                            <tr>
                              <th>서버 이름</th>
                              <td>{deployedServer.name}</td>
                            </tr>
                            <tr>
                              <th>호스트</th>
                              <td>{deployedServer.host}:{deployedServer.port}</td>
                            </tr>
                            <tr>
                              <th>서버 타입</th>
                              <td>{formatServerType(deployedServer.serverType) || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>설명</th>
                              <td>{deployedServer.description || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>SSH 사용자명</th>
                              <td>{deployedServer.sshUsername || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>SSH 포트</th>
                              <td>{deployedServer.sshPort || 22}</td>
                            </tr>
                            <tr>
                              <th>배포 경로</th>
                              <td>{deployedServer.deployPath || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>인증 방식</th>
                              <td>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}>
                                  🔒 비밀번호 인증
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <th>배포 시간</th>
                              <td>{formatDate(selectedCertificate.deployedAt)}</td>
                            </tr>
                          </tbody>
                        </table>
                      );
                    }
                    return (
                      <div style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px dashed #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ServerIcon size={32} style={{ color: '#d1d5db', marginBottom: '0.75rem' }} />
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                          배포된 서버 정보를 찾을 수 없습니다.
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px dashed #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ServerIcon size={32} style={{ color: '#d1d5db', marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                      배포된 서버가 없습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* SSH 유저 정보 (서버가 없을 때만 표시) */}
              {!selectedCertificate.serverId && (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>SSH 연결 정보</h3>
                  {selectedCertificate.sshUserInputData ? (
                    <table className="certificate-detail-table">
                      <tbody>
                        <tr>
                          <th>SSH 사용자명</th>
                          <td>{selectedCertificate.sshUserInputData.username}</td>
                        </tr>
                        <tr>
                          <th>설명</th>
                          <td>{selectedCertificate.sshUserInputData.description || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>인증 방식</th>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: selectedCertificate.sshUserInputData.privateKey ? '#fef3c7' : '#dbeafe',
                              color: selectedCertificate.sshUserInputData.privateKey ? '#92400e' : '#1e40af',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              {selectedCertificate.sshUserInputData.privateKey ? '🔑 키 인증' : '🔒 비밀번호 인증'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.5rem',
                      border: '1px dashed #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={32} style={{ color: '#d1d5db', marginBottom: '0.75rem' }} />
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                        SSH 연결 정보가 없습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* HTTPS 테스트 */}
              {selectedCertificate.domain && (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>HTTPS 테스트</h3>
                    {selectedCertificate.httpsTestFailed === true && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        <AlertCircle size={12} />
                        HTTPS 연결 실패
                      </span>
                    )}
                    {selectedCertificate.httpsTestFailed === false && selectedCertificate.httpsTestDate && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        <CheckCircle2 size={12} />
                        HTTPS 연결 정상
                      </span>
                    )}
                  </div>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={`https://${selectedCertificate.domain}`}
                        readOnly
                        style={{
                          flex: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleHttpsTest(selectedCertificate.domain)}
                        disabled={isTestingHttps}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isTestingHttps ? (
                          <>
                            <div className="progress-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                            테스트 중...
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} />
                            테스트
                          </>
                        )}
                      </button>
                    </div>
                    {httpsTestResult && (
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: httpsTestResult.success ? '#dcfce7' : '#fee2e2',
                        border: `1px solid ${httpsTestResult.success ? '#86efac' : '#fca5a5'}`,
                        borderRadius: '0.375rem',
                        marginTop: '0.5rem'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: httpsTestResult.success ? '#166534' : '#991b1b',
                          fontWeight: 500
                        }}>
                          {httpsTestResult.success ? '✓' : '✗'} {httpsTestResult.message}
                        </p>
                      </div>
                    )}
                    <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                      HTTPS 연결 상태를 테스트합니다.
                    </small>
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-footer">
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
