import React from 'react';

const MetricsGrid = ({ data }) => {
  const metricsData = [
    { label: '落點', value: data.carry, unit: '碼' },
    { label: '總距離', value: data.total, unit: '碼' },
    { label: '桿頭速度', value: data.club_speed, unit: '英哩' },
    { label: '擊球效率', value: data.smash_factor, unit: '' },
    { label: '球速', value: data.ball_speed, unit: '英哩' },
    { label: '起飛角測值', value: data.launch_angle, unit: '度' },
    { label: '落地角度', value: data.land_angle, unit: '度' },
    { label: '總旋轉量', value: data.spin_rate, unit: '轉/分' },
  ];

  return (
    <div className="dashboard-bottom">
      {metricsData.map((metric, index) => (
        <div className="metric-card" key={index}>
          <div className="metric-title">{metric.label}</div>
          <div className="metric-value-container">
            <span className="metric-value">{metric.value}</span>
            {metric.unit && <span className="metric-unit">{metric.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
