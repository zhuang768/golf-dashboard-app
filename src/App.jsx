import React, { useState } from 'react';
import './index.css';
import ClubImpactVisualizer from './components/ClubImpactVisualizer';
import SwingVideoPlayer from './components/SwingVideoPlayer';
import MetricsGrid from './components/MetricsGrid';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clubType, setClubType] = useState('7 Iron');
  const [shotHistory, setShotHistory] = useState([]);

  const emptyData = {
    carry: '--',
    total: '--',
    club_speed: '--',
    smash_factor: '--',
    ball_speed: '--',
    launch_angle: '--',
    land_angle: '--',
    spin_rate: '--',
    impact_height: 0,
    dynamic_lie: 0,
    impact_offset: 0
  };

  const currentData = metrics || emptyData;

  const handleAnalyze = async (videoBlob) => {
    if (!videoBlob) return;

    setIsAnalyzing(true);
    
    const formData = new FormData();
    formData.append("front_video", videoBlob, "live_stream.webm");
    formData.append("side_video", videoBlob, "live_stream.webm");
    formData.append("club_type", clubType);

    try {
      const response = await fetch("/analyze", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      if (result.status === "success") {
        setMetrics(result.data);
        setShotHistory(prev => [{...result.data, club: clubType, timestamp: new Date()}, ...prev]);
      } else {
        alert("分析失敗，請重試！");
      }
    } catch (error) {
      console.error("API 錯誤", error);
      alert("無法連線到 AI 分析伺服器，請確認後端已啟動。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* 頂部控制區 (球桿選擇與狀態) */}
      <div className="header-controls">
        <h2 style={{margin: 0, fontSize: '20px'}}>Golf AI 追蹤器</h2>
        <div className="club-selector">
          {['Driver', 'Wood', '7 Iron', 'Wedge'].map(c => (
            <button 
              key={c} 
              className={`club-btn ${clubType === c ? 'active' : ''}`}
              onClick={() => setClubType(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-main">
        {/* 左側歷史紀錄 (電腦版在左，手機版隱藏或在下) */}
        <div className="history-sidebar">
          <h3>擊球紀錄 ({shotHistory.length})</h3>
          <div className="history-list">
            {shotHistory.map((shot, idx) => (
              <div 
                key={idx} 
                className="history-item" 
                onClick={() => setMetrics(shot)}
              >
                <div className="history-title">Shot {shotHistory.length - idx}</div>
                <div className="history-carry">{shot.carry} 碼</div>
                <div className="history-club">{shot.club}</div>
              </div>
            ))}
            {shotHistory.length === 0 && <div style={{color: '#666', marginTop: '20px'}}>尚無紀錄</div>}
          </div>
        </div>

        {/* 核心視覺與攝影機區 */}
        <div className="dashboard-top">
          <SwingVideoPlayer 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
          <ClubImpactVisualizer data={currentData} clubType={clubType} />
        </div>
      </div>

      <MetricsGrid data={currentData} />
    </div>
  );
}

export default App;
