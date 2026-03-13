import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const rules = [
  { key: 'length', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Al menos 1 letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'Al menos 1 número', test: (v) => /\d/.test(v) },
];

const PasswordStrengthIndicator = ({ password = '' }) => {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0 0' }}>
      {rules.map(({ key, label, test }) => {
        const passed = test(password);
        return (
          <li
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'var(--oc-font-xs)',
              color: passed ? 'var(--oc-success-dark)' : 'var(--oc-gray-400)',
              marginBottom: '0.25rem',
              transition: 'color 200ms ease',
            }}
          >
            {passed ? (
              <CheckCircleOutlineIcon style={{ fontSize: '0.875rem' }} />
            ) : (
              <RadioButtonUncheckedIcon style={{ fontSize: '0.875rem' }} />
            )}
            {label}
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordStrengthIndicator;
