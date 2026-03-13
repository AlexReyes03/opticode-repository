const getScoreColor = (score) => {
  if (score >= 90) return 'oc-score--green';
  if (score >= 50) return 'oc-score--orange';
  return 'oc-score--red';
};

const ScoreBadge = ({ score, size = 'md' }) => {
  const dimensions = size === 'lg' ? { width: '3rem', height: '3rem', fontSize: 'var(--oc-font-base)' } : {};

  return (
    <div className={`oc-score ${getScoreColor(score)}`} style={dimensions}>
      {score}
    </div>
  );
};

export default ScoreBadge;
