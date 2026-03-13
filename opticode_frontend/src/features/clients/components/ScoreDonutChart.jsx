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
    <div className="position-relative" style={{ width: '10rem', height: '10rem' }}>
      <svg
        viewBox="0 0 160 160"
        className="w-100 h-100"
        style={{ transform: 'rotate(-90deg)' }}
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
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        <span className="fw-bold" style={{ fontSize: '2.25rem', color: 'var(--oc-gray-800)' }}>
          {score}
        </span>
        <span className="small text-secondary">/ 100</span>
      </div>
    </div>
  );
};

export default ScoreDonutChart;
