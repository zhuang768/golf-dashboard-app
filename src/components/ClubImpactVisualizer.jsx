import React from 'react';
import { Target } from 'lucide-react';

const ClubImpactVisualizer = ({ data, clubType }) => {
  // If data is just the "emptyData" string defaults, we hide the dot
  const hasData = data && data.carry !== '--';

  return (
    <div className="panel visualizer">
      <div className="visualizer-title">
        <Target size={20} color="#ff6b00" />
        {clubType || '9 鐵'}
      </div>

      <div className="vis-data-box top-left">
        <div className="vis-label">擊球點高度</div>
        <div>
          <span className="vis-val">{hasData ? Math.abs(data.impact_height) : '--'}</span>
          <span className="vis-val-sub">{hasData ? (data.impact_height < 0 ? '毫米 下' : '毫米 上') : ''}</span>
        </div>
      </div>

      <div className="vis-data-box top-right">
        <div className="vis-label">動態底角</div>
        <div>
          <span className="vis-val">{hasData ? data.dynamic_lie : '--'}</span>
          <span className="vis-val-sub">{hasData ? '度' : ''}</span>
        </div>
      </div>

      <div className="vis-data-box bottom-left">
        <div className="vis-label">擊球點偏離</div>
        <div>
          <span className="vis-val">{hasData ? Math.abs(data.impact_offset) : '--'}</span>
          <span className="vis-val-sub">{hasData ? (data.impact_offset < 0 ? '毫米 跟部' : '毫米 趾部') : ''}</span>
        </div>
      </div>

      <div className="club-svg-container">
        {/* Simple club head SVG approximation */}
        <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ fill: 'none', stroke: '#aaaaaa', strokeWidth: 1 }}>
          <path d="M 60,140 C 60,100 120,60 140,50 C 160,110 140,160 80,160 C 70,160 60,150 60,140 Z" fill="rgba(255,255,255,0.05)" strokeWidth="2" />
          <path d="M 140,50 L 160,20" strokeWidth="6" stroke="#888" strokeLinecap="round" />
          {/* Horizontal score lines */}
          <line x1="80" y1="140" x2="135" y2="100" stroke="rgba(255,255,255,0.2)" />
          <line x1="75" y1="130" x2="130" y2="90" stroke="rgba(255,255,255,0.2)" />
          <line x1="70" y1="120" x2="125" y2="80" stroke="rgba(255,255,255,0.2)" />
          <line x1="85" y1="150" x2="140" y2="110" stroke="rgba(255,255,255,0.2)" />
        </svg>

        <div className="club-line"></div>
        <div className="club-line-horiz"></div>
        
        {/* Only show the impact dot if we have actual data */}
        {hasData && (
          <div 
            className="impact-dot"
            style={{
              transform: `translate(calc(-50% + ${data.impact_offset * 2}px), calc(-50% + ${-data.impact_height * 2}px))`
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ClubImpactVisualizer;
