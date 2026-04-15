import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import AuthFormField from '../components/AuthFormField';
import { forgotPassword } from '../../../api/auth-services';
import { getApiErrorMessage } from '../../../api/fetch-wrapper';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => Boolean(email.trim()), [email]);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Introduce tu correo electrónico.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email: trimmed });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(false);
      setError(
        getApiErrorMessage(
          err,
          'No se pudo enviar la solicitud. Verifica tu conexión o inténtalo más tarde.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: 'var(--oc-navy)' }}>
        Recuperar contraseña
      </h2>
      <p className="text-secondary small mb-4">
        Ingresa tu correo y, si existe una cuenta asociada, recibirás instrucciones para
        restablecerla.
      </p>

      {submitted && (
        <output
          className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4"
          aria-live="polite"
        >
          <MarkEmailReadOutlinedIcon style={{ fontSize: '1.125rem' }} />
          Si el correo existe, recibirás instrucciones para restablecer tu contraseña.
        </output>
      )}

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 py-2 small"
          role="alert"
        >
          <ErrorOutlineIcon style={{ fontSize: '1.125rem' }} />
          {error}
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit} noValidate>
          <AuthFormField
            id="forgot-email"
            label="Correo electrónico"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={handleChange}
            required
            icon={EmailOutlinedIcon}
          />

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <>
                <output
                  className="spinner-border spinner-border-sm me-2"
                  aria-live="polite"
                  aria-hidden="true"
                />
                {' '}
                Enviando...
              </>
            ) : (
              'Enviar instrucciones'
            )}
          </button>
        </form>
      )}

      <p className="text-center text-secondary small mt-4">
        <Link to="/login">Volver al inicio de sesión</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
