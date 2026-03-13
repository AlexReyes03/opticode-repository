const getStrokeColor = (score) => {
  if (score >= 90) return 'var(--oc-success)';
  if (score >= 50) return 'var(--oc-warning)';
  return 'var(--oc-danger)';
};

const ScoreDonutChart = ({ score = 0 }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '10rem', height: '10rem' }}>
      <svg
        viewBox="0 0 160 160"
        style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="var(--oc-gray-100)"
          strokeWidth="12"
        />
        {/* Score arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke={getStrokeColor(score)}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 'var(--oc-font-4xl)', fontWeight: 700, color: 'var(--oc-gray-800)' }}>
          {score}
        </span>
        <span style={{ fontSize: 'var(--oc-font-sm)', color: 'var(--oc-gray-400)' }}>/ 100</span>
      </div>
    </div>
  );
};

export default ScoreDonutChart;
