import { Shield, AlertTriangle, CheckCircle2, FileText, XCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { useEffect, useRef, useState } from "react";
import "../styles/CertificateStats.css";

export function CertificateStats({ total, valid, expiringSoon, expired, onFilterChange, currentFilter }) {
  const statCardRefs = useRef([]);
  const [wrappedStates, setWrappedStates] = useState({});

  // 줄바꿈 감지 함수
  const checkWrapping = (element, index) => {
    if (!element) return;
    const textElement = element.querySelector('.stat-title-text');
    if (textElement) {
      // 텍스트 요소의 실제 너비가 부모 요소의 너비보다 크면 줄바꿈 발생
      const textWidth = textElement.scrollWidth;
      const containerWidth = element.querySelector('.stat-info')?.clientWidth || element.clientWidth;
      
      if (textWidth > containerWidth) {
        setWrappedStates(prev => ({ ...prev, [index]: true }));
      } else {
        setWrappedStates(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  useEffect(() => {
    const checkAllElements = () => {
      statCardRefs.current.forEach((ref, index) => {
        if (ref) {
          checkWrapping(ref, index);
        }
      });
    };

    checkAllElements();
    window.addEventListener('resize', checkAllElements);
    const timeout = setTimeout(checkAllElements, 100);

    return () => {
      window.removeEventListener('resize', checkAllElements);
      clearTimeout(timeout);
    };
  }, [total, valid, expiringSoon, expired]);
  const stats = [
    {
      title: "전체 인증서",
      value: total,
      icon: FileText,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      filterValue: "all"
    },
    {
      title: "유효",
      value: valid,
      icon: CheckCircle2,
      color: "#10B981",
      bgColor: "#ECFDF5",
      filterValue: "valid"
    },
    {
      title: "곧 만료",
      value: expiringSoon,
      icon: AlertTriangle,
      color: "#FF6600",
      bgColor: "#FFF3EB",
      filterValue: "expiring-soon"
    },
    {
      title: "만료됨",
      value: expired,
      icon: XCircle,
      color: "#EF4444",
      bgColor: "#FEF2F2",
      filterValue: "expired"
    }
  ];

  const handleStatClick = (filterValue) => {
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  };

  return (
    <TooltipProvider>
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isActive = currentFilter === stat.filterValue;
          const isWrapped = wrappedStates[index] || false;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div 
                  ref={el => statCardRefs.current[index] = el}
                  className={`stat-card ${isActive ? 'stat-card-active' : ''} ${isWrapped ? 'wrapped' : ''}`}
                  onClick={() => handleStatClick(stat.filterValue)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-content">
                    <div className="stat-info">
                      <p className="stat-title-text">{stat.title}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bgColor }}>
                      <Icon className="stat-icon" style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.title}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
