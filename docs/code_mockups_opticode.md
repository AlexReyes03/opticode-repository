# Mockups Conceptuales en Código - OptiCode

A continuación, se define la estructura en HTML semántico (utilizando aproximaciones visuales con clases tipo Tailwind/Bootstrap para representar el layout) de las 5 vistas pendientes.

---

## 1. Modal: Nuevo Proyecto (OC-2.1)

```html
<!-- Fondo oscurecido (Overlay) sobre el Dashboard -->
<div class="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50">
  
  <!-- Content Card -->
  <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
    
    <!-- Cabecera -->
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
      <h3 class="text-xl font-semibold text-navy-900 border-l-4 border-blue-600 pl-3">Nuevo Proyecto</h3>
      <button class="text-gray-400 hover:text-gray-600">✕</button>
    </div>
    
    <!-- Formulario -->
    <div class="p-6">
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto <span class="text-red-500">*</span></label>
        <div class="relative">
          <input type="text" placeholder="Ej: Portal Educativo" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" maxlength="100">
          <span class="absolute right-3 top-2.5 text-xs text-gray-400">0/100</span>
        </div>
      </div>
      
      <div class="mb-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
        <textarea rows="3" placeholder="Describe brevemente el propósito de este proyecto..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>
    </div>
    
    <!-- Bottom Actions -->
    <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100">
      <button class="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
      <button class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">Crear Proyecto</button>
    </div>
    
  </div>
</div>
```

---

## 2. Área de Carga de Archivos (OC-2.2 / 2.3)

```html
<!-- Breadcrumb -->
<div class="text-sm text-gray-500 mb-6">Mis Proyectos / <span class="text-navy-900 font-medium">Portal Educativo</span> / Cargar</div>

<div class="flex justify-between items-center mb-6">
  <h1 class="text-2xl font-bold text-navy-900">Cargar Archivos al Proyecto</h1>
</div>

<!-- Zonas de Dropping (Grid de 2 columnas) -->
<div class="grid grid-cols-2 gap-6 mb-8">
  
  <!-- Tarjeta 1: Archivo Individual -->
  <div class="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer">
    <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <i class="icon-upload text-blue-600 text-2xl">☁️</i>
    </div>
    <h3 class="text-lg font-medium text-navy-900">Archivo Individual</h3>
    <p class="text-gray-500 text-sm mt-2">Arrastra tu archivo HTML o CSS aquí o <span class="text-blue-600 font-medium">explora</span></p>
    <div class="mt-4 inline-block bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-600">
      Soporte: .html, .css | 1KB - 10MB
    </div>
  </div>

  <!-- Tarjeta 2: Lote (ZIP) -->
  <div class="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer">
    <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <i class="icon-zip text-blue-600 text-2xl">🗜️</i>
    </div>
    <h3 class="text-lg font-medium text-navy-900">Carga en Lote (ZIP)</h3>
    <p class="text-gray-500 text-sm mt-2">Arrastra tu archivo .zip comprimido aquí o <span class="text-blue-600 font-medium">explora</span></p>
    <div class="mt-4 inline-block bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-600">
      Máx. 50 archivos | 50MB | Solo procesa HTML/CSS
    </div>
  </div>
  
</div>

<!-- Tabla de estado de subidas -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h4 class="font-medium mb-4 text-navy-900">Archivos Recientes</h4>
  <div class="flex items-center justify-between p-3 border-b border-gray-100">
    <div class="flex items-center gap-3">
      <span class="text-orange-500">📄</span>
      <span class="font-medium text-sm">index.html</span>
      <span class="text-xs text-gray-400">1.2 MB</span>
    </div>
    <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completado - Eval: 75</span>
  </div>
  <div class="flex items-center justify-between p-3">
    <div class="flex items-center gap-3">
      <span class="text-blue-500">📄</span>
      <span class="font-medium text-sm">styles.css</span>
      <span class="text-xs text-gray-400">45 KB</span>
    </div>
    <span class="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium flex items-center gap-2">
      <svg class="animate-spin h-3 w-3"></svg> Analizando...
    </span>
  </div>
</div>
```

---

## 3. Tablero de Control del Proyecto (OC-4.1)

```html
<!-- Head Section -->
<div class="flex justify-between items-start mb-8">
  <div>
    <h1 class="text-2xl font-bold text-navy-900 mb-2">Portal Educativo <span class="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">12 Archivos</span></h1>
    <p class="text-gray-600">Repositorio del frontend de la nueva plataforma escolar.</p>
  </div>
  <button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
    <span>+</span> Subir Archivos
  </button>
</div>

<!-- Lista de Archivos Semáforo -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <table class="w-full text-left">
    <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
      <tr>
        <th class="px-6 py-4">Archivo</th>
        <th class="px-6 py-4">Última Modificación</th>
        <th class="px-6 py-4 text-center">Críticas</th>
        <th class="px-6 py-4 text-center">Advertencias</th>
        <th class="px-6 py-4 text-center">Puntaje Global</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <!-- File Row (Verde) -->
      <tr class="hover:bg-gray-50 cursor-pointer">
        <td class="px-6 py-4 font-medium text-sm text-blue-700">header.html</td>
        <td class="px-6 py-4 text-sm text-gray-500">Hace 2 horas</td>
        <td class="px-6 py-4 text-center"><span class="text-gray-400">0</span></td>
        <td class="px-6 py-4 text-center"><span class="text-orange-500 font-medium">1</span></td>
        <td class="px-6 py-4">
          <div class="mx-auto w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold shadow-sm">95</div>
        </td>
      </tr>
      
      <!-- File Row (Naranja) -->
      <tr class="hover:bg-gray-50 cursor-pointer">
        <td class="px-6 py-4 font-medium text-sm text-blue-700">index.html</td>
        <td class="px-6 py-4 text-sm text-gray-500">Ayer, 14:30</td>
        <td class="px-6 py-4 text-center"><span class="text-red-500 font-bold">2</span></td>
        <td class="px-6 py-4 text-center"><span class="text-orange-500 font-medium">1</span></td>
        <td class="px-6 py-4">
          <div class="mx-auto w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">75</div>
        </td>
      </tr>
      
      <!-- File Row (Rojo) -->
      <tr class="hover:bg-gray-50 cursor-pointer">
        <td class="px-6 py-4 font-medium text-sm text-blue-700">form_contacto.html</td>
        <td class="px-6 py-4 text-sm text-gray-500">10 Mar 2026</td>
        <td class="px-6 py-4 text-center"><span class="text-red-500 font-bold">5</span></td>
        <td class="px-6 py-4 text-center"><span class="text-orange-500 font-medium">3</span></td>
        <td class="px-6 py-4">
          <div class="mx-auto w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shadow-sm">35</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 4. Resumen Ejecutivo de Archivo (OC-4.2)

```html
<!-- Breadcrumb -->
<div class="text-sm text-gray-500 mb-6">Portal Educativo / <span class="text-navy-900 font-medium">index.html</span></div>

<!-- Disclaimer Permanente -->
<div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3 mb-8">
  <span class="text-blue-500 text-xl font-bold">i</span>
  <p class="text-blue-800 text-sm">
    <strong>Este es un análisis estático.</strong> Para garantizar la accesibilidad completa, realice pruebas manuales complementarias utilizando teclado y lectores de pantalla en su sitio renderizado en vivo.
  </p>
</div>

<!-- Layout Principal de Dashboards -->
<div class="grid grid-cols-3 gap-6 mb-8">
  
  <!-- Score Principal (Left Column) -->
  <div class="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center">
    <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-6">Puntuación Final</h3>
    <!-- SVG Donut Chart representation -->
    <div class="relative w-40 h-40">
      <svg class="w-full h-full transform -rotate-90">
        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f3f4f6" stroke-width="12"></circle>
        <!-- Representa un score de 75/100 -->
        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f97316" stroke-width="12" stroke-dasharray="440" stroke-dashoffset="110"></circle>
      </svg>
      <div class="absolute inset-0 flex items-center justify-center flex-col">
        <span class="text-4xl font-bold text-gray-800">75</span>
        <span class="text-sm text-gray-400">/ 100</span>
      </div>
    </div>
  </div>

  <!-- Desglose (Right Column) -->
  <div class="col-span-2 flex flex-col gap-4">
    
    <!-- Count Cards -->
    <div class="grid grid-cols-2 gap-4 h-full">
      <div class="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center gap-4">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl font-bold">✖</div>
        <div>
          <div class="text-3xl font-bold text-red-700">2</div>
          <div class="text-red-900 text-sm font-medium">Faltas Críticas (Nivel A)</div>
        </div>
      </div>
      
      <div class="bg-orange-50 border border-orange-100 rounded-xl p-6 flex items-center gap-4">
        <div class="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-xl font-bold">!</div>
        <div>
          <div class="text-3xl font-bold text-orange-600">1</div>
          <div class="text-orange-800 text-sm font-medium">Advertencias (Nivel AA)</div>
        </div>
      </div>
    </div>
    
  </div>
</div>
```

---

## 5. Detalle de Errores con Filtros (OC-4.3 / 4.4)

```html
<!-- Cabecera de listado -->
<div class="flex justify-between items-center mb-6">
  <h2 class="text-xl font-semibold text-navy-900">Hallazgos Detectados</h2>
  
  <!-- Botones de Filtro en Cliente -->
  <div class="flex bg-gray-100 p-1 rounded-lg">
    <button class="px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap text-gray-600 hover:text-gray-900">
      Todos (3)
    </button>
    <button class="px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap bg-white text-blue-700 shadow-sm flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-red-500"></span>
      Solo Críticos (2)
    </button>
    <button class="px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap text-gray-600 hover:text-gray-900 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-orange-400"></span>
      Solo Advertencias (1)
    </button>
  </div>
</div>

<!-- Tarjetas de Errores -->
<div class="flex flex-col gap-4">
  
  <!-- Error Crítico Card -->
  <div class="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm overflow-hidden">
    <div class="p-5">
      <div class="flex justify-between items-start mb-3">
        <div>
          <span class="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase tracking-wider mb-2">Falta Crítica • Nivel A</span>
          <h3 class="text-lg font-bold text-gray-900">Imagen sin atributo 'alt'</h3>
        </div>
        <div class="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-600">
          Línea 45
        </div>
      </div>
      
      <p class="text-gray-600 text-sm mb-4">La etiqueta de imagen actual carece de una descripción alternativa. Esto impide que los lectores de pantalla puedan transmitir su contenido a personas con discapacidad visual.</p>
      
      <!-- Snippet de Código Visual -->
      <div class="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 font-mono text-sm shadow-inner">
        <div class="flex text-slate-400">
           <div class="w-10 text-right pr-2 py-1 bg-slate-800/50 border-r border-slate-700">44</div>
           <div class="px-4 py-1">&lt;div class="banner-principal"&gt;</div>
        </div>
        <div class="flex bg-red-900/40 text-red-100 border-l-2 border-red-500">
           <div class="w-10 text-right pr-2 py-1 bg-slate-800/80 border-r border-slate-700 text-red-400">45</div>
           <div class="px-4 py-1"><span class="text-pink-400">&lt;img</span> <span class="text-blue-300">src</span><span class="text-white">=</span><span class="text-green-300">"logo_corporativo.png"</span> <span class="text-blue-300">class</span><span class="text-white">=</span><span class="text-green-300">"w-full"</span><span class="text-pink-400">&gt;</span></div>
        </div>
        <div class="flex text-slate-400">
           <div class="w-10 text-right pr-2 py-1 bg-slate-800/50 border-r border-slate-700">46</div>
           <div class="px-4 py-1">&lt;/div&gt;</div>
        </div>
      </div>
    </div>
  </div>

</div>
```
