import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorCard from '../components/ErrorCard';
import ErrorFilter from '../components/ErrorFilter';

const MOCK_ERRORS = [
  {
    id: 1,
    severity: 'critical',
    level: 'Nivel A',
    title: "Imagen sin atributo 'alt'",
    description:
      'La etiqueta de imagen actual carece de una descripción alternativa. Esto impide que los lectores de pantalla puedan transmitir su contenido a personas con discapacidad visual.',
    line: 45,
    codeLines: [
      { lineNumber: 44, content: '<div class="banner-principal">' },
      { lineNumber: 45, content: '<img src="logo_corporativo.png" class="w-full">' },
      { lineNumber: 46, content: '</div>' },
    ],
  },
  {
    id: 2,
    severity: 'critical',
    level: 'Nivel A',
    title: 'Formulario sin etiqueta asociada',
    description:
      'El campo de entrada no tiene un elemento <label> asociado mediante el atributo "for". Los usuarios de lectores de pantalla no podrán identificar el propósito del campo.',
    line: 72,
    codeLines: [
      { lineNumber: 71, content: '<div class="form-group">' },
      { lineNumber: 72, content: '<input type="text" name="nombre" placeholder="Tu nombre">' },
      { lineNumber: 73, content: '</div>' },
    ],
  },
  {
    id: 3,
    severity: 'warning',
    level: 'Nivel AA',
    title: 'Contraste insuficiente en texto',
    description:
      'El color de texto #999999 sobre fondo #ffffff tiene una relación de contraste de 2.85:1, inferior al mínimo de 4.5:1 requerido para texto normal según WCAG 2.1 AA.',
    line: 18,
    codeLines: [
      { lineNumber: 17, content: '<style>' },
      { lineNumber: 18, content: '  .subtitulo { color: #999999; font-size: 14px; }' },
      { lineNumber: 19, content: '</style>' },
    ],
  },
];

const ErrorDetail = () => {
  const { projectId, fileId } = useParams();
  const [filter, setFilter] = useState('all');

  const filteredErrors = MOCK_ERRORS.filter((err) => {
    if (filter === 'all') return true;
    return err.severity === filter;
  });

  const counts = {
    all: MOCK_ERRORS.length,
    critical: MOCK_ERRORS.filter((e) => e.severity === 'critical').length,
    warning: MOCK_ERRORS.filter((e) => e.severity === 'warning').length,
  };

  return (
    <section>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Mis Proyectos</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`}>Portal Educativo</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}/files/${fileId}`}>index.html</Link>
          </li>
          <li className="breadcrumb-item">
            <NavigateNextIcon style={{ fontSize: '1rem', verticalAlign: 'middle' }} />
          </li>
          <li className="breadcrumb-item active" aria-current="page">Hallazgos</li>
        </ol>
      </nav>

      {/* Header + Filter */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold fs-5 mb-0" style={{ color: 'var(--oc-navy)' }}>Hallazgos Detectados</h2>
        <ErrorFilter activeFilter={filter} onFilterChange={setFilter} counts={counts} />
      </div>

      {/* Error Cards */}
      <div className="d-flex flex-column gap-3">
        {filteredErrors.map((error) => (
          <ErrorCard key={error.id} error={error} />
        ))}
      </div>
    </section>
  );
};

export default ErrorDetail;
