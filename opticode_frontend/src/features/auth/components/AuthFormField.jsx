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
  onFocus,
  onBlur,
  required = false,
  icon: Icon,
  error = '',
  maxLength,
  /** Si es false, no se muestra el toggle (p. ej. login); Edge/Chromium: ver CSS global `input[type=password]`. */
  showPasswordToggle = true,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPasswordToggle && showPassword ? 'text' : type;
  const resolvedAutoComplete =
    autoComplete ?? (isPasswordField ? 'current-password' : 'off');

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <div className="position-relative">
        {Icon && (
          <Icon
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.125rem',
              color: 'var(--oc-gray-400)',
              zIndex: 1,
            }}
          />
        )}
        <input
          id={id}
          type={inputType}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          maxLength={maxLength}
          autoComplete={resolvedAutoComplete}
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem',
            paddingRight: isPasswordField && showPasswordToggle ? '2.5rem' : '1rem',
          }}
        />
        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="btn btn-link position-absolute top-50 translate-middle-y p-0 d-flex"
            style={{
              right: '0.75rem',
              color: 'var(--oc-gray-400)',
              textDecoration: 'none',
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
        <span className="d-block small text-danger mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default AuthFormField;
