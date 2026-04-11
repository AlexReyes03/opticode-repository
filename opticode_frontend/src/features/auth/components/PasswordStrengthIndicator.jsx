import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const rules = [
  { key: 'length', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Al menos 1 letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'Al menos 1 número', test: (v) => /\d/.test(v) },
];

const PasswordStrengthIndicator = ({ password = '', visible = true }) => {
  if (!visible) return null;
  return (
    <ul className="list-unstyled mt-2 mb-0">
      {rules.map(({ key, label, test }) => {
        const passed = test(password);
        return (
          <li
            key={key}
            className={`d-flex align-items-center gap-2 mb-1 ${passed ? 'text-success' : 'text-secondary'}`}
            style={{ fontSize: '0.75rem', transition: 'color 200ms ease' }}
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
