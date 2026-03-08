# Plan myAI4context – Chrome Web Store y Edge Add-ons

Plan paso a paso para publicar **myAI4context** en Chrome Web Store y Microsoft Edge Add-ons.

**Repositorio:** https://github.com/mapicallo/myAI4context  
**Web:** https://ai4context.com

---

## Fase 0 – Prerrequisitos

- [ ] **0.1** Cuenta Google Developer (Chrome) – pago único ~5 USD
- [ ] **0.2** Cuenta Microsoft Partner Center (Edge) – gratuito
- [ ] **0.3** Política de privacidad accesible en URL pública

---

## Fase 1 – Política de privacidad

myAI4context usa:
- `storage`: perfiles guardados localmente en el navegador
- `downloads`: descarga de documentos JSON/MD
- `host_permissions` (http/https): solo cuando el usuario activa "Incluir contenido de enlaces" para obtener texto de URLs al generar el documento

- [ ] **1.1** Usar `privacy.html` del repo: alojar en `https://ai4context.com/privacy` o GitHub Pages (`https://mapicallo.github.io/myAI4context/privacy.html`)
- [ ] **1.2** Indicar: datos solo locales (storage), no se envían a servidores; host_permissions solo para fetch opcional de enlaces que el usuario configura
- [ ] **1.3** URL final: `https://ai4context.com/privacy` (o `https://mapicallo.github.io/myAI4context/privacy.html` si se usa GitHub Pages)

---

## Fase 2 – Adaptación del manifest

- [ ] **2.1** Revisar que no haya `update_url` (Edge lo gestiona)
- [ ] **2.2** Versión estable para producción (ej. 1.0.0)
- [ ] **2.3** Comprobar que `host_permissions` esté justificado en la descripción (opción de incluir contenido de enlaces)

---

## Fase 3 – Descripciones para la tienda

### Descripción corta (máx. 132 caracteres)

**Español:**
```
Crea tu documento de contexto para IAs. Un perfil, un enlace. Comparte con ChatGPT, Claude, Gemini.
```
(98 caracteres)

**English:**
```
Create your AI context document. One profile, one link. Share with ChatGPT, Claude, Gemini.
```
(87 caracteres)

### Descripción detallada (mín. 250 caracteres)

**Español:**
```
myAI4context te permite crear y descargar tu documento de contexto para inteligencia artificial. Define quién eres, qué haces y qué quieres que las IAs sepan de ti o de tu organización.

Características:
• Múltiples perfiles: crea varios documentos (personal, empresa, proyecto)
• Descripción: texto manual + archivos PDF, Word o Markdown
• Enlaces: web, LinkedIn, YouTube, blogs… La IA puede consultarlos si no encuentra la información
• Opción de incluir contenido de enlaces al generar (obtiene el texto automáticamente)
• Reglas: indica qué puede y no puede decir la IA
• Descarga en JSON o Markdown para compartir con ChatGPT, Claude, Gemini

Los datos se guardan solo en tu navegador. No hay servidores propios. Compatible con Chrome y Edge.
```

**English:**
```
myAI4context lets you create and download your AI context document. Define who you are, what you do, and what you want AIs to know about you or your organization.

Features:
• Multiple profiles: create several documents (personal, company, project)
• Description: manual text + PDF, Word or Markdown files
• Links: website, LinkedIn, YouTube, blogs… The AI can consult them if info is not found
• Option to include link content when generating (fetches text automatically)
• Rules: specify what the AI can and cannot say
• Download as JSON or Markdown to share with ChatGPT, Claude, Gemini

Data is stored only in your browser. No own servers. Compatible with Chrome and Edge.
```

---

## Fase 4 – Assets para la tienda

### Iconos
- [ ] **4.1** Logo tienda: 128×128 o 300×300 px (PNG, 1:1)
- [ ] **4.2** Los iconos actuales en `assets/icons/` (16, 32, 48, 128) deben ser PNG válidos

### Capturas de pantalla
- [ ] **4.3** Dimensiones: 1280×800 o 640×400 px (PNG o JPEG)
- [ ] **4.4** Capturar: popup con lista de perfiles, wizard de settings (pestaña Identidad o Descripción), documento descargado
- [ ] **4.5** Máximo 5 capturas (Chrome), 6 (Edge)

### Tiles promocionales (opcionales)
- [ ] **4.6** Pequeño: 440×280 px
- [ ] **4.7** Grande: 1400×560 px

---

## Fase 5 – Paquete para subir

- [ ] **5.1** Crear ZIP con: manifest.json, popup/, settings/, background/, assets/, libs/
- [ ] **5.2** Excluir: .md, .git, README, tests, node_modules
- [ ] **5.3** Ejecutar `create-store-package.ps1` (ver abajo)
- [ ] **5.4** Probar carga: Chrome `chrome://extensions` y Edge `edge://extensions` → Modo desarrollador → Cargar descomprimida

---

## Fase 6 – Chrome Web Store

- [ ] **6.1** Ir a [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] **6.2** Nuevo elemento → Extensión
- [ ] **6.3** Subir ZIP
- [ ] **6.4** Rellenar: descripción, categoría (Productividad), icono, capturas
- [ ] **6.5** Política de privacidad: URL
- [ ] **6.6** Justificación de permisos si Chrome la solicita (host_permissions para fetch opcional de enlaces)
- [ ] **6.7** Enviar a revisión

---

## Fase 7 – Microsoft Edge Add-ons

- [ ] **7.1** Ir a [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login)
- [ ] **7.2** Crear nueva extensión
- [ ] **7.3** Subir el mismo ZIP (o uno sin update_url)
- [ ] **7.4** Propiedades: categoría, política privacidad, URL web, contacto
- [ ] **7.5** Store Listings: descripción, logo, capturas
- [ ] **7.6** Enviar a certificación

---

## Script: create-store-package.ps1

```powershell
# Crear ZIP para Chrome/Edge (ejecutar desde la raíz del proyecto)
$exclude = @('*.md', '.git*', 'node_modules', '*.ps1', 'store-assets')
$files = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $rel = $_.FullName.Replace((Get-Location).Path + '\', '')
    -not ($rel -match '\.git\\' -or $rel -match 'node_modules' -or $rel -match 'store-assets' -or $rel -match '\.md$' -or $rel -match 'create-store-package')
}
Compress-Archive -Path manifest.json, popup, settings, background, assets, libs -DestinationPath myAI4context-store.zip -Force
Write-Host "Creado: myAI4context-store.zip"
```

---

## Checklist rápido

1. [ ] Política de privacidad publicada
2. [ ] Versión 1.0.0 en manifest
3. [ ] Descripciones ES/EN preparadas
4. [ ] Capturas 1280×800
5. [ ] ZIP creado y probado
6. [ ] Chrome: subir y enviar
7. [ ] Edge: subir y enviar
