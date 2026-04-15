import PropTypes from 'prop-types';

const getScoreColor = (score) => {
  if (score >= 90) return 'oc-score--green';
  if (score >= 50) return 'oc-score--orange';
  return 'oc-score--red';
};

const ScoreBadge = ({ score, size = 'md' }) => {
  const dimensions = size === 'lg' ? { width: '3rem', height: '3rem', fontSize: '1rem' } : {};

  return (
    <div className={`oc-score ${getScoreColor(score)}`} style={dimensions}>
      {score}
    </div>
  );
};

ScoreBadge.propTypes = {
  size: PropTypes.oneOf(['md', 'lg']),
  score: PropTypes.number.isRequired,
};

export default ScoreBadge;
