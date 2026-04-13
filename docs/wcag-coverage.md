# Cobertura WCAG 2.2 — OPTICODE

**Versión de referencia:** WCAG 2.2 (W3C Recommendation, octubre 2023)  
**Fecha de revisión:** 2026-04-12  
**Rama activa:** `feat/nivel-aaa`  
**Motor de análisis:** análisis estático de HTML y CSS (BeautifulSoup + tinycss2)

---

## Leyenda

| Etiqueta | Significado |
|----------|-------------|
| ✅ **IMPLEMENTADO** | Regla activa en el motor (`rules/`) |
| 🔧 **IMPLEMENTABLE** | Detectable mediante análisis estático de HTML/CSS o algoritmos sobre texto extraído |
| ❌ **FUERA DE SCOPE** | Requiere ejecución JS, interacción de usuario, análisis visual de imágenes, multimedia, o contexto multi-página |

> **Scope del proyecto:** OPTICODE analiza únicamente archivos HTML y CSS de forma estática.  
> No ejecuta JavaScript, no levanta un navegador y no evalúa comportamiento en tiempo de ejecución.

---

## Resumen ejecutivo

| Nivel | Total | Implementado | Implementable | Fuera de scope |
|-------|------:|-------------:|--------------:|---------------:|
| A     | 32    | 1            | 13            | 18             |
| AA    | 24    | 2            | 10            | 12             |
| AAA   | 31    | 0            | 12            | 19             |
| **Total** | **87** | **3** | **35** | **49** |

> Totales según W3C WCAG 2.2 (octubre 2023): 87 criterios de éxito. WCAG 2.2 **eliminó** 4.1.1 Parsing y agregó 9 nuevos criterios respecto a WCAG 2.1.

---

## Principio 1 — Perceptible

### 1.1 Alternativas de texto

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **1.1.1** Non-text Content | A | 🔧 IMPLEMENTABLE | `<img>` sin `alt`, `alt=""` en imágenes informativas, `<svg>` sin `<title>` ni `aria-label` |

### 1.2 Medios basados en tiempo

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **1.2.1** Audio-only and Video-only (Prerecorded) | A | ❌ FUERA DE SCOPE | Requiere evaluar el contenido del medio, no su presencia |
| **1.2.2** Captions (Prerecorded) | A | ❌ FUERA DE SCOPE | Requiere verificar pistas de subtítulos dentro del archivo multimedia |
| **1.2.3** Audio Description or Media Alternative (Prerecorded) | A | ❌ FUERA DE SCOPE | Requiere evaluar si la alternativa describe adecuadamente el contenido visual |
| **1.2.4** Captions (Live) | AA | ❌ FUERA DE SCOPE | Requiere transmisión en vivo |
| **1.2.5** Audio Description (Prerecorded) | AA | ❌ FUERA DE SCOPE | Requiere evaluar la pista de audiodescripción del video |
| **1.2.6** Sign Language (Prerecorded) | AAA | ❌ FUERA DE SCOPE | Requiere evaluar contenido multimedia |
| **1.2.7** Extended Audio Description (Prerecorded) | AAA | ❌ FUERA DE SCOPE | Requiere evaluar el video con pausas extendidas |
| **1.2.8** Media Alternative (Prerecorded) | AAA | ❌ FUERA DE SCOPE | Requiere evaluar si la alternativa textual es completa |
| **1.2.9** Audio-only (Live) | AAA | ❌ FUERA DE SCOPE | Requiere transmisión en vivo |

### 1.3 Adaptable

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **1.3.1** Info and Relationships | A | ✅ **IMPLEMENTADO** | `rules/forms.py` — `<input>` sin `<label>`, `aria-label`, `aria-labelledby` ni `title` |
| **1.3.2** Meaningful Sequence | A | 🔧 IMPLEMENTABLE | Detectar `tabindex` negativos en elementos interactivos que rompen el orden del DOM |
| **1.3.3** Sensory Characteristics | A | ❌ FUERA DE SCOPE | Detectar instrucciones que dependen de forma/color/posición requiere comprensión semántica; falsos positivos inaceptables |
| **1.3.4** Orientation | AA | 🔧 IMPLEMENTABLE | CSS con `@media (orientation)` + `display:none` o `transform:rotate` fijo que bloquea una orientación |
| **1.3.5** Identify Input Purpose | AA | 🔧 IMPLEMENTABLE | `<input>` de datos personales (email, tel, name…) sin atributo `autocomplete` apropiado |
| **1.3.6** Identify Purpose | AAA | 🔧 IMPLEMENTABLE | Ausencia de landmarks ARIA (`role="main"`, `role="nav"`, etc.) y elementos semánticos HTML5 |

### 1.4 Distinguible

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **1.4.1** Use of Color | A | ❌ FUERA DE SCOPE | Correlacionar si el color es el *único* medio de transmitir información requiere semántica contextual |
| **1.4.2** Audio Control | A | 🔧 IMPLEMENTABLE | Detectar `<audio autoplay>` sin atributo `controls`; el usuario no puede detener el audio sin control visible |
| **1.4.3** Contrast (Minimum) | AA | ✅ **IMPLEMENTADO** | `rules/contrast.py` — ratio de contraste en CSS entre `color` y `background-color`; umbral 4.5:1 |
| **1.4.4** Resize Text | AA | 🔧 IMPLEMENTABLE | `font-size` en unidades fijas `px` que no escalan con el zoom del navegador |
| **1.4.5** Images of Text | AA | ❌ FUERA DE SCOPE | Requiere análisis visual del contenido de imágenes |
| **1.4.6** Contrast (Enhanced) | AAA | 🔧 IMPLEMENTABLE | Extensión de 1.4.3 con umbral 7:1; reutiliza `contrast.py` cambiando la constante |
| **1.4.7** Low or No Background Audio | AAA | ❌ FUERA DE SCOPE | Requiere analizar la pista de audio del medio |
| **1.4.8** Visual Presentation | AAA | 🔧 IMPLEMENTABLE | CSS: `line-height < 1.5`, `max-width` en `px` rígido, `text-align: justify` sin excepción |
| **1.4.9** Images of Text (No Exception) | AAA | ❌ FUERA DE SCOPE | Requiere análisis visual del contenido de imágenes |
| **1.4.10** Reflow | AA | 🔧 IMPLEMENTABLE | `meta viewport` con `user-scalable=no`; CSS sin media queries para 320px de ancho |
| **1.4.11** Non-text Contrast | AA | 🔧 IMPLEMENTABLE | Contraste insuficiente (< 3:1) en bordes de `<input>`, botones e iconos definidos en CSS |
| **1.4.12** Text Spacing | AA | 🔧 IMPLEMENTABLE | CSS con `!important` bloqueando `line-height`, `letter-spacing`, `word-spacing` o `margin` |
| **1.4.13** Content on Hover or Focus | AA | ❌ FUERA DE SCOPE | Verificar comportamiento de tooltips y popovers requiere ejecución en navegador |

---

## Principio 2 — Operable

### 2.1 Accesibilidad por teclado

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **2.1.1** Keyboard | A | 🔧 IMPLEMENTABLE | `<div>`/`<span>` con atributo `onclick` sin `tabindex`; elementos interactivos con `tabindex="-1"` sin justificación |
| **2.1.2** No Keyboard Trap | A | ❌ FUERA DE SCOPE | Detectar trampas de foco requiere navegación interactiva con teclado |
| **2.1.3** Keyboard (No Exception) | AAA | ❌ FUERA DE SCOPE | Requiere prueba exhaustiva de navegación con teclado |
| **2.1.4** Character Key Shortcuts | A | ❌ FUERA DE SCOPE | Requiere analizar `addEventListener` en JavaScript |

### 2.2 Tiempo suficiente

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **2.2.1** Timing Adjustable | A | ❌ FUERA DE SCOPE | Los timeouts se definen en JavaScript (`setTimeout`, `setInterval`) |
| **2.2.2** Pause, Stop, Hide | A | 🔧 IMPLEMENTABLE | `<marquee>` o `<blink>` en HTML; `<video autoplay>` sin `controls`; CSS `animation-iteration-count: infinite` sin `@media (prefers-reduced-motion)` |
| **2.2.3** No Timing | AAA | ❌ FUERA DE SCOPE | Requiere evaluar flujos completos de usuario |
| **2.2.4** Interruptions | AAA | ❌ FUERA DE SCOPE | Requiere evaluar el comportamiento dinámico de la aplicación |
| **2.2.5** Re-authenticating | AAA | ❌ FUERA DE SCOPE | Requiere evaluar el manejo de sesiones expiradas |
| **2.2.6** Timeouts | AAA | ❌ FUERA DE SCOPE | Los timeouts de sesión se gestionan en JavaScript/backend |

### 2.3 Convulsiones y reacciones físicas

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **2.3.1** Three Flashes or Below Threshold | A | ❌ FUERA DE SCOPE | Medir la frecuencia de parpadeo requiere renderizado y análisis de fotogramas |
| **2.3.2** Three Flashes | AAA | ❌ FUERA DE SCOPE | Versión estricta de 2.3.1; requiere renderizado |
| **2.3.3** Animation from Interactions | AAA | 🔧 IMPLEMENTABLE | CSS con `animation`/`transition` sin cobertura de `@media (prefers-reduced-motion): reduce` |

### 2.4 Navegable

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **2.4.1** Bypass Blocks | A | 🔧 IMPLEMENTABLE | Ausencia de skip-link (`<a href="#main">`) y de elementos semánticos `<main>`, `<nav>`, `<header>` |
| **2.4.2** Page Titled | A | 🔧 IMPLEMENTABLE | `<title>` ausente, vacío o con texto genérico (< 3 palabras) |
| **2.4.3** Focus Order | A | 🔧 IMPLEMENTABLE | `tabindex > 0` (valores positivos sobreescriben el orden natural del DOM y son un anti-patrón documentado) |
| **2.4.4** Link Purpose (In Context) | A | 🔧 IMPLEMENTABLE | `<a>` con texto genérico ("click aquí", "aquí", "ver más") sin `aria-label` ni `aria-labelledby` |
| **2.4.5** Multiple Ways | AA | ❌ FUERA DE SCOPE | Requiere verificar la existencia de múltiples rutas de navegación a nivel de sitio |
| **2.4.6** Headings and Labels | AA | ✅ **IMPLEMENTADO** | `rules/headings.py` — `<h1>` duplicado y saltos de jerarquía en encabezados |
| **2.4.7** Focus Visible | AA | 🔧 IMPLEMENTABLE | CSS con `outline: none` o `outline: 0` aplicado a `:focus` sin indicador visual equivalente |
| **2.4.8** Location | AAA | ❌ FUERA DE SCOPE | Requiere contexto del sitio completo (breadcrumbs, mapa del sitio) |
| **2.4.9** Link Purpose (Link Only) | AAA | 🔧 IMPLEMENTABLE | `<a>` sin texto ni atributo accesible; versión estricta sin considerar contexto circundante |
| **2.4.10** Section Headings | AAA | 🔧 IMPLEMENTABLE | `<section>` o `<article>` sin encabezado hijo directo (`<h2>`–`<h6>`) |
| **2.4.11** Focus Not Obscured (Minimum) | AA | ❌ FUERA DE SCOPE | Verificar que el foco no quede cubierto por elementos flotantes requiere renderizado |
| **2.4.12** Focus Not Obscured (Enhanced) | AAA | ❌ FUERA DE SCOPE | Versión estricta de 2.4.11; requiere renderizado |
| **2.4.13** Focus Appearance | AAA | 🔧 IMPLEMENTABLE | CSS en `:focus`: indicador sin área mínima ni contraste ≥ 3:1 respecto al fondo adyacente |

### 2.5 Modalidades de entrada

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **2.5.1** Pointer Gestures | A | ❌ FUERA DE SCOPE | Requiere analizar `touchstart`/`touchmove` event listeners en JavaScript |
| **2.5.2** Pointer Cancellation | A | ❌ FUERA DE SCOPE | Requiere verificar que las acciones se activan en `mouseup`/`pointerup`, no `mousedown` |
| **2.5.3** Label in Name | A | 🔧 IMPLEMENTABLE | `aria-label` de un control que no contiene el texto visible del mismo elemento |
| **2.5.4** Motion Actuation | A | ❌ FUERA DE SCOPE | Requiere analizar APIs `DeviceMotion`/`DeviceOrientation` en JavaScript |
| **2.5.5** Target Size (Enhanced) | AAA | 🔧 IMPLEMENTABLE | Elementos interactivos con `width` o `height` < 44px en CSS |
| **2.5.6** Concurrent Input Mechanisms | AAA | ❌ FUERA DE SCOPE | Requiere evaluar que la UI no restringe el tipo de puntero en tiempo de ejecución |
| **2.5.7** Dragging Movements | AA | ❌ FUERA DE SCOPE | Requiere analizar event listeners de arrastre en JavaScript |
| **2.5.8** Target Size (Minimum) | AA | 🔧 IMPLEMENTABLE | Elementos interactivos con área de toque < 24×24px en CSS (umbral mínimo WCAG 2.2) |

---

## Principio 3 — Comprensible

### 3.1 Legible

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **3.1.1** Language of Page | A | 🔧 IMPLEMENTABLE | Ausencia del atributo `lang` en `<html>`, o valor vacío |
| **3.1.2** Language of Parts | AA | 🔧 IMPLEMENTABLE | Contenido en idioma diferente al de `<html lang>` sin atributo `lang` en el elemento contenedor |
| **3.1.3** Unusual Words | AAA | 🔧 IMPLEMENTABLE | Verificar la existencia de un mecanismo de glosario: elementos `<dfn>`, lista `<dl>` de definiciones, o sección con `role="definition"` |
| **3.1.4** Abbreviations | AAA | 🔧 IMPLEMENTABLE | Siglas y acrónimos (`/\b[A-Z]{2,}\b/`) en texto sin `<abbr title="...">` que provea la expansión |
| **3.1.5** Reading Level | AAA | 🔧 IMPLEMENTABLE | Índice Flesch-Kincaid sobre texto extraído del HTML mediante `textstat`; nivel superior a educación secundaria sin alternativa simplificada |
| **3.1.6** Pronunciation | AAA | 🔧 IMPLEMENTABLE | Ausencia de `<ruby>` u otros mecanismos de pronunciación en documentos con términos fonéticamente ambiguos |

### 3.2 Predecible

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **3.2.1** On Focus | A | ❌ FUERA DE SCOPE | Detectar cambios de contexto al enfocar requiere ejecución en navegador |
| **3.2.2** On Input | A | ❌ FUERA DE SCOPE | Detectar envíos automáticos o redirecciones al cambiar un input requiere ejecución |
| **3.2.3** Consistent Navigation | AA | ❌ FUERA DE SCOPE | Verificar consistencia entre páginas requiere análisis multi-página |
| **3.2.4** Consistent Identification | AA | ❌ FUERA DE SCOPE | Verificar identificación consistente de componentes requiere análisis multi-página |
| **3.2.5** Change on Request | AAA | ❌ FUERA DE SCOPE | Requiere evaluar que los cambios de contexto son iniciados por el usuario |
| **3.2.6** Consistent Help | A | ❌ FUERA DE SCOPE | Verificar consistencia de mecanismos de ayuda requiere análisis multi-página (WCAG 2.2) |

### 3.3 Asistencia en la entrada

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| **3.3.1** Error Identification | A | 🔧 IMPLEMENTABLE | `<form>` con campos `required` pero sin contenedor de errores accesible (`role="alert"`, `aria-live`, o `aria-describedby` hacia mensaje de error) |
| **3.3.2** Labels or Instructions | A | ❌ FUERA DE SCOPE | Evaluar si las instrucciones son suficientes requiere juicio contextual; cubierto en parte por 1.3.1 |
| **3.3.3** Error Suggestion | AA | ❌ FUERA DE SCOPE | Verificar calidad de sugerencias de error requiere ejecución de validación |
| **3.3.4** Error Prevention (Legal, Financial, Data) | AA | ❌ FUERA DE SCOPE | Requiere evaluar flujos de confirmación y reversión |
| **3.3.5** Help | AAA | ❌ FUERA DE SCOPE | Requiere evaluar disponibilidad de ayuda contextual en tiempo de ejecución |
| **3.3.6** Error Prevention (All) | AAA | ❌ FUERA DE SCOPE | Versión extendida de 3.3.4; requiere evaluar todos los formularios en runtime |
| **3.3.7** Redundant Entry | A | ❌ FUERA DE SCOPE | Detectar datos ya ingresados que se repiden requiere seguimiento del flujo de sesión (WCAG 2.2) |
| **3.3.8** Accessible Authentication (Minimum) | AA | ❌ FUERA DE SCOPE | Requiere evaluar el flujo de autenticación en tiempo de ejecución (WCAG 2.2) |
| **3.3.9** Accessible Authentication (Enhanced) | AAA | ❌ FUERA DE SCOPE | Versión estricta de 3.3.8 (WCAG 2.2) |

---

## Principio 4 — Robusto

### 4.1 Compatible

| Criterio | Nivel | Estado | Técnica de detección |
|----------|-------|--------|----------------------|
| ~~**4.1.1** Parsing~~ | ~~A~~ | **ELIMINADO EN WCAG 2.2** | Retirado porque las tecnologías asistivas modernas ya no dependen del parsing HTML directo |
| **4.1.2** Name, Role, Value | A | 🔧 IMPLEMENTABLE | `<button>` vacío o solo con icono sin `aria-label`; `<a>` sin texto ni atributo accesible; roles ARIA con valores inválidos |
| **4.1.3** Status Messages | AA | 🔧 IMPLEMENTABLE | Contenedores de mensajes de estado sin `role="status"`, `role="alert"` ni `aria-live` |

---

## Criterios implementados (detalle)

### 1.3.1 — Info and Relationships · Nivel A
- **Archivo:** `opticode_backend/features/audit/rules/forms.py`
- **Severidad:** `error`
- **Detecta:** `<input>` (tipos text, email, password, tel, number, date, etc.) sin ningún mecanismo de etiqueta accesible
- **Mecanismos verificados:** `<label for>`, `<label>` envolvente, `aria-label`, `aria-labelledby`, `title`

### 1.4.3 — Contrast (Minimum) · Nivel AA
- **Archivo:** `opticode_backend/features/audit/rules/contrast.py`
- **Severidad:** `error`
- **Detecta:** Reglas CSS con `color` y `background-color`/`background` cuyo ratio de contraste es inferior a 4.5:1
- **Formatos de color soportados:** hex (`#rgb`, `#rrggbb`, `#rrggbbaa`), nombres CSS, `rgb()`, `rgba()`
- **Limitación conocida:** Solo analiza CSS declarado estáticamente; no resuelve colores heredados ni variables CSS

### 2.4.6 — Headings and Labels · Nivel AA
- **Archivo:** `opticode_backend/features/audit/rules/headings.py`
- **Severidad:** `warning`
- **Detecta:** Más de un `<h1>` en el documento y saltos de jerarquía (e.g., `<h2>` → `<h4>` sin `<h3>`)

---

## Próximas reglas recomendadas (por prioridad)

| Prioridad | Criterio | Nivel | Dependencia | Justificación |
|-----------|----------|-------|-------------|---------------|
| 1 | **1.1.1** Non-text Content | A | BeautifulSoup | `<img>` sin `alt` es el error de accesibilidad más frecuente en la web |
| 2 | **2.4.2** Page Titled | A | BeautifulSoup | `<title>` ausente afecta todos los documentos; detección en 2 líneas |
| 3 | **3.1.1** Language of Page | A | BeautifulSoup | `lang` ausente en `<html>` invalida los lectores de pantalla; trivial |
| 4 | **4.1.2** Name, Role, Value | A | BeautifulSoup | Botones y enlaces sin nombre son errores críticos con tecnologías asistivas |
| 5 | **2.4.7** Focus Visible | AA | tinycss2 | `outline: none` en `:focus` es la causa más directa de inaccesibilidad por teclado |
| 6 | **2.4.3** Focus Order | A | BeautifulSoup | `tabindex > 0` es un anti-patrón documentado; detección trivial |
| 7 | **1.4.2** Audio Control | A | BeautifulSoup | `<audio autoplay>` sin `controls` bloquea al usuario; detección en 1 línea |
| 8 | **3.3.1** Error Identification | A | BeautifulSoup | Formularios con `required` sin `role="alert"` — verificación estructural |
| 9 | **3.1.4** Abbreviations | AAA | re (stdlib) | Regex sobre texto extraído; sin dependencias externas |
| 10 | **3.1.5** Reading Level | AAA | textstat | Flesch-Kincaid algorítmico; requiere `pip install textstat` |
| 11 | **1.4.6** Contrast (Enhanced) | AAA | tinycss2 | Reutiliza `contrast.py`; solo cambia umbral a 7:1 |
| 12 | **1.3.5** Identify Input Purpose | AA | BeautifulSoup | Verificación de atributo `autocomplete`; una línea por campo |
