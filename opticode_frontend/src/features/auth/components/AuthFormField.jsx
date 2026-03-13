import { useState } from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const AuthFormField = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  icon: Icon,
  error = '',
  maxLength,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label htmlFor={id} className="oc-label">
        {label}
        {required && <span className="oc-text-danger" style={{ marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.125rem',
              color: 'var(--oc-gray-400)',
            }}
          />
        )}
        <input
          id={id}
          type={inputType}
          className="oc-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          autoComplete={isPasswordField ? 'current-password' : 'off'}
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem',
            paddingRight: isPasswordField ? '2.5rem' : '1rem',
          }}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              color: 'var(--oc-gray-400)',
            }}
          >
            {showPassword ? (
              <VisibilityOffOutlinedIcon style={{ fontSize: '1.125rem' }} />
            ) : (
              <VisibilityOutlinedIcon style={{ fontSize: '1.125rem' }} />
            )}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 'var(--oc-font-xs)', color: 'var(--oc-danger)', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default AuthFormField;
