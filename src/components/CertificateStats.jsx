import { Shield, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import "../styles/CertificateStats.css";

export function CertificateStats({ total, valid, expiringSoon, expired }) {
  const stats = [
    {
      title: "전체 인증서",
      value: total,
      icon: FileText,
      color: "#3B82F6",
      bgColor: "#EFF6FF"
    },
    {
      title: "유효",
      value: valid,
      icon: CheckCircle2,
      color: "#10B981",
      bgColor: "#ECFDF5"
    },
    {
      title: "곧 만료",
      value: expiringSoon,
      icon: AlertTriangle,
      color: "#FF6600",
      bgColor: "#FFF3EB"
    },
    {
      title: "만료됨",
      value: expired,
      icon: Shield,
      color: "#EF4444",
      bgColor: "#FEF2F2"
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p>{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bgColor }}>
                <Icon className="stat-icon" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
