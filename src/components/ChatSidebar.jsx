import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './ChatSidebar.css';

const ChatSidebar = ({ onFilterChange, stats }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '안녕하세요! 인증서 관리에 대해 도움이 필요하신가요? 필터링 명령을 사용할 수 있습니다. 예: "유효한 인증서 보여줘", "만료된 인증서 필터링", "전체 보기" 등'
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
    } else if (lowerInput.includes('갱신') || lowerInput.includes('renew')) {
      return {
        content: `인증서 갱신은 각 인증서 카드의 "갱신하기" 버튼을 클릭하시면 됩니다. 자동 갱신과 수동 갱신 중 선택할 수 있으며, 만료 알림 설정도 가능합니다.`,
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

📊 정보:
- "통계" 또는 "현황" - 인증서 통계 확인
- "인증서 설명" - 인증서 관리 기능 안내
- "갱신 방법" - 인증서 갱신 방법 안내`,
        action: null
      };
    } else {
      return {
        content: `죄송합니다. 이해하지 못했습니다. 다음 명령을 시도해보세요:
      
- "유효한 인증서 보여줘"
- "곧 만료될 인증서"
- "만료된 인증서"
- "전체 보기"
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

