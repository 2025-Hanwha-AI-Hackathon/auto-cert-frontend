import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './ChatSidebar.css';

const ChatSidebar = ({ onFilterChange, stats, certificates, onRenewCertificate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '안녕하세요! 인증서 관리에 대해 도움이 필요하신가요?\n\n사용 가능한 기능:\n📋 필터링: "유효한 인증서 보여줘", "만료된 인증서 필터링"\n📄 상태 조회: "인증서 목록", "인증서 상태", 특정 인증서 이름 검색\n🔄 갱신: "인증서 이름 갱신해줘"\n📊 통계: "통계", "현황"'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 인증서 이름으로 검색하는 헬퍼 함수
  const findCertificateByName = (userInput, certs) => {
    if (!certs || certs.length === 0) return null;
    
    const inputLower = userInput.toLowerCase();
    // 인증서 이름이나 도메인으로 검색
    return certs.find(cert => 
      cert.name.toLowerCase().includes(inputLower) ||
      (cert.domain && cert.domain.toLowerCase().includes(inputLower))
    );
  };

  // 만료일까지 남은 일수 계산
  const calculateDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 실제 ChatGPT API 호출 (현재는 모의 응답)
    // TODO: OpenAI API 또는 다른 채팅 API로 교체
    setTimeout(() => {
      const response = generateMockResponse(userMessage.content);
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.content,
        action: response.action // 필터링 액션 정보
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      // 필터링이 적용된 경우 시각적 피드백
      if (response.action && response.action.type === 'filter') {
        // 필터링이 적용되었음을 사용자에게 알림 (옵션)
        setTimeout(() => {
          // 필요시 추가 피드백 로직
        }, 100);
      }
    }, 1000);
  };

  const generateMockResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    // 필터링 명령 감지 및 처리
    if (lowerInput.includes('전체') || lowerInput.includes('all') || lowerInput.includes('모든')) {
      if (onFilterChange) {
        onFilterChange('all');
      }
      return {
        content: `✅ 전체 인증서를 보여드리겠습니다. 총 ${stats?.total || 0}개의 인증서가 있습니다.`,
        action: { type: 'filter', value: 'all' }
      };
    } else if (
      (lowerInput.includes('유효') || lowerInput.includes('valid') || lowerInput.includes('정상')) &&
      !lowerInput.includes('만료')
    ) {
      if (onFilterChange) {
        onFilterChange('valid');
      }
      return {
        content: `✅ 유효한 인증서만 보여드리겠습니다. 총 ${stats?.valid || 0}개의 유효한 인증서가 있습니다.`,
        action: { type: 'filter', value: 'valid' }
      };
    } else if (
      lowerInput.includes('곧 만료') || 
      lowerInput.includes('expiring') || 
      lowerInput.includes('만료 예정') ||
      (lowerInput.includes('만료') && (lowerInput.includes('곧') || lowerInput.includes('예정')))
    ) {
      if (onFilterChange) {
        onFilterChange('expiring-soon');
      }
      return {
        content: `⚠️ 곧 만료될 인증서만 보여드리겠습니다. 총 ${stats?.expiringSoon || 0}개의 인증서가 곧 만료됩니다.`,
        action: { type: 'filter', value: 'expiring-soon' }
      };
    } else if (
      lowerInput.includes('만료') || 
      lowerInput.includes('expired') ||
      (lowerInput.includes('만료') && !lowerInput.includes('곧') && !lowerInput.includes('예정'))
    ) {
      if (onFilterChange) {
        onFilterChange('expired');
      }
      return {
        content: `❌ 만료된 인증서만 보여드리겠습니다. 총 ${stats?.expired || 0}개의 만료된 인증서가 있습니다.`,
        action: { type: 'filter', value: 'expired' }
      };
    } else if (lowerInput.includes('인증서') || lowerInput.includes('certificate')) {
      return {
        content: `인증서 관리에 대해 설명드리겠습니다. 현재 시스템에서는 SSL/TLS 인증서, Code Signing 인증서 등을 관리할 수 있습니다. 
      
필터링 명령을 사용하시면 원하는 인증서만 볼 수 있습니다:
- "유효한 인증서 보여줘" - 정상 작동 중인 인증서만 표시
- "곧 만료될 인증서" - 만료 예정인 인증서만 표시
- "만료된 인증서" - 이미 만료된 인증서만 표시
- "전체 보기" - 모든 인증서 표시

특정 인증서에 대해 더 자세히 알고 싶으시면 알려주세요.`,
        action: null
      };
    } else if (
      (lowerInput.includes('갱신') || lowerInput.includes('renew')) &&
      !lowerInput.includes('방법') &&
      !lowerInput.includes('설명')
    ) {
      // 인증서 갱신 기능
      const certMatch = findCertificateByName(userInput, certificates);
      if (certMatch) {
        // 특정 인증서 갱신
        if (onRenewCertificate) {
          const success = onRenewCertificate(certMatch.id);
          if (success) {
            return {
              content: `✅ "${certMatch.name}" 인증서가 성공적으로 갱신되었습니다!\n\n갱신 정보:\n- 인증서명: ${certMatch.name}\n- 도메인: ${certMatch.domain || 'N/A'}\n- 유형: ${certMatch.type}\n- 발급 기관: ${certMatch.issuer}\n- 갱신 후 상태: 유효\n- 새 만료일: 2026-11-05`,
              action: { type: 'renew', certificateId: certMatch.id }
            };
          } else {
            return {
              content: `❌ "${certMatch.name}" 인증서 갱신에 실패했습니다. 다시 시도해주세요.`,
              action: null
            };
          }
        }
      } else {
        // 갱신 가능한 인증서 목록 표시
        const renewables = certificates.filter(c => 
          c.status === 'expired' || c.status === 'expiring-soon'
        );
        if (renewables.length > 0) {
          const certList = renewables.map(c => 
            `- ${c.name} (${c.domain || 'N/A'}) - ${c.status === 'expired' ? '만료됨' : '곧 만료'}`
          ).join('\n');
          return {
            content: `갱신이 필요한 인증서 목록입니다:\n\n${certList}\n\n특정 인증서를 갱신하려면 인증서 이름을 포함해서 말씀해주세요. 예: "${renewables[0].name} 갱신해줘"`,
            action: null
          };
        } else {
          return {
            content: `현재 갱신이 필요한 인증서가 없습니다. 모든 인증서가 유효한 상태입니다.`,
            action: null
          };
        }
      }
    } else if (lowerInput.includes('갱신 방법') || (lowerInput.includes('갱신') && (lowerInput.includes('방법') || lowerInput.includes('설명')))) {
      return {
        content: `인증서 갱신 방법:\n\n1. 각 인증서 카드의 "갱신하기" 버튼을 클릭\n2. 자동 갱신 또는 수동 갱신 선택\n3. 만료 알림 설정 (7일, 30일, 60일 전)\n\n또는 채팅에서 인증서 이름을 포함하여 "갱신해줘"라고 말씀하시면 바로 갱신할 수 있습니다.`,
        action: null
      };
    } else if (
      lowerInput.includes('인증서 목록') || 
      lowerInput.includes('인증서 리스트') || 
      lowerInput.includes('목록') ||
      (lowerInput.includes('인증서') && (lowerInput.includes('보기') || lowerInput.includes('조회')))
    ) {
      // 인증서 목록을 텍스트로 반환
      if (certificates && certificates.length > 0) {
        const certListText = certificates.map((cert, index) => {
          const statusText = cert.status === 'valid' ? '✅ 유효' : 
                            cert.status === 'expiring-soon' ? '⚠️ 곧 만료' : 
                            '❌ 만료됨';
          return `${index + 1}. ${cert.name}
   - 도메인: ${cert.domain || 'N/A'}
   - 유형: ${cert.type}
   - 발급 기관: ${cert.issuer}
   - 발급일: ${cert.issueDate}
   - 만료일: ${cert.expiryDate}
   - 상태: ${statusText}`;
        }).join('\n\n');
        
        return {
          content: `📋 전체 인증서 목록 (총 ${certificates.length}개):\n\n${certListText}\n\n특정 인증서의 상세 정보를 보려면 인증서 이름을 말씀해주세요.`,
          action: null
        };
      } else {
        return {
          content: '현재 등록된 인증서가 없습니다.',
          action: null
        };
      }
    } else if (
      lowerInput.includes('인증서 상태') || 
      lowerInput.includes('상태 조회') ||
      (lowerInput.includes('상태') && lowerInput.includes('인증서'))
    ) {
      // 인증서 상태 요약
      const statusSummary = certificates ? certificates.map(cert => {
        const statusText = cert.status === 'valid' ? '✅ 유효' : 
                          cert.status === 'expiring-soon' ? '⚠️ 곧 만료' : 
                          '❌ 만료됨';
        return `${cert.name}: ${statusText} (만료일: ${cert.expiryDate})`;
      }).join('\n') : '인증서 정보를 불러올 수 없습니다.';
      
      return {
        content: `📊 인증서 상태 요약:\n\n${statusSummary}\n\n특정 인증서의 상세 정보를 보려면 인증서 이름을 말씀해주세요.`,
        action: null
      };
    } else if (lowerInput.includes('통계') || lowerInput.includes('statistics') || lowerInput.includes('현황')) {
      return {
        content: `현재 인증서 현황입니다:
- 전체: ${stats?.total || 0}개
- 유효: ${stats?.valid || 0}개
- 곧 만료: ${stats?.expiringSoon || 0}개
- 만료됨: ${stats?.expired || 0}개

필터링 명령으로 특정 상태의 인증서만 볼 수 있습니다.`,
        action: null
      };
    } else if (lowerInput.includes('안녕') || lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return {
        content: '안녕하세요! 인증서 관리에 대해 무엇을 도와드릴까요? 필터링 명령을 사용하여 원하는 인증서를 찾아보세요.',
        action: null
      };
    } else if (lowerInput.includes('도움') || lowerInput.includes('help') || lowerInput.includes('명령')) {
      return {
        content: `사용 가능한 명령어:
      
📋 필터링:
- "유효한 인증서 보여줘" 또는 "유효한 인증서 필터링"
- "곧 만료될 인증서" 또는 "만료 예정 인증서"
- "만료된 인증서" 또는 "만료된 인증서 필터링"
- "전체 보기" 또는 "모든 인증서"

📄 상태 조회:
- "인증서 목록" 또는 "인증서 리스트" - 전체 인증서 목록
- "인증서 상태" - 모든 인증서 상태 요약
- 특정 인증서 이름 입력 - 해당 인증서 상세 정보

🔄 갱신:
- "인증서 이름 갱신해줘" - 특정 인증서 갱신
- "갱신" - 갱신 가능한 인증서 목록

📊 정보:
- "통계" 또는 "현황" - 인증서 통계 확인
- "인증서 설명" - 인증서 관리 기능 안내
- "갱신 방법" - 인증서 갱신 방법 안내`,
        action: null
      };
    } else {
      // 특정 인증서 검색
      const certMatch = findCertificateByName(userInput, certificates);
      if (certMatch) {
        const statusText = certMatch.status === 'valid' ? '✅ 유효' : 
                          certMatch.status === 'expiring-soon' ? '⚠️ 곧 만료' : 
                          '❌ 만료됨';
        const daysUntilExpiry = calculateDaysUntilExpiry(certMatch.expiryDate);
        
        return {
          content: `📄 인증서 상세 정보:\n\n인증서명: ${certMatch.name}\n도메인: ${certMatch.domain || 'N/A'}\n유형: ${certMatch.type}\n발급 기관: ${certMatch.issuer}\n발급일: ${certMatch.issueDate}\n만료일: ${certMatch.expiryDate}\n상태: ${statusText}\n${daysUntilExpiry ? `만료까지: ${daysUntilExpiry}일` : ''}\n\n이 인증서를 갱신하려면 "갱신해줘"라고 말씀해주세요.`,
          action: null
        };
      }
      
      return {
        content: `죄송합니다. 이해하지 못했습니다. 다음 명령을 시도해보세요:
      
- "유효한 인증서 보여줘"
- "곧 만료될 인증서"
- "만료된 인증서"
- "전체 보기"
- "인증서 목록" - 전체 인증서 목록 보기
- "인증서 이름" - 특정 인증서 정보 조회
- "인증서 이름 갱신해줘" - 인증서 갱신
- "통계"
- "도움말"

또는 인증서 관리에 대한 질문을 해주시면 도움을 드리겠습니다.`,
        action: null
      };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 채팅 버튼 */}
      {!isOpen && (
        <button
          className="chat-toggle-button"
          onClick={() => setIsOpen(true)}
          aria-label="채팅 열기"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* 사이드바 */}
      <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="chat-header-content">
            <Bot size={20} />
            <h2>AI 어시스턴트</h2>
          </div>
          <button
            className="chat-close-button"
            onClick={() => setIsOpen(false)}
            aria-label="채팅 닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant-message">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="chat-send-button"
              disabled={!inputValue.trim() || isLoading}
              aria-label="메시지 보내기"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;

