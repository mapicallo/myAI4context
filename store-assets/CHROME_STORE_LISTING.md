# Ficha Chrome Web Store – myAI4context

Contenido actualizado para la ficha de la tienda. Incluye las nuevas funcionalidades: enlaces directos al chat y plantillas para compartir.

---

## Título del paquete (Package title)
**Máx. 45 caracteres**

```
myAI4context - AI Context Document
```
(35 caracteres) ✓ Sin cambios

---

## Resumen del paquete (Short description)
**Máx. 132 caracteres**

```
AI Context Document by AI4Context. Create and share your profile. One link, one document. Share with any AI.
```
(98 caracteres) ✓ Sin cambios

---

## Descripción detallada (Description)
**Mín. 250 caracteres, máx. 16.000**

### English (actualizado con nuevas funciones)

```
myAI4context lets you create and download your AI context document. Define who you are, what you do, and what you want AIs to know about you or your organization.

Features:
• Multiple profiles: create several documents (personal, company, project)
• Description: manual text + PDF, Word or Markdown files
• Links: website, LinkedIn, YouTube, blogs… The AI can consult them if info is not found
• Option to include link content when generating (fetches text automatically)
• Rules: specify what the AI can and cannot say
• Download as JSON or Markdown to share with ChatGPT, Claude, Gemini
• Direct links: add a link on your website so visitors can open ChatGPT, Claude or Gemini with your context pre-loaded (requires extension)
• Share templates: ready-to-copy HTML for your website, LinkedIn, and documents (Word, PDF)

Data is stored only in your browser. No own servers. Compatible with Chrome and Edge.

Perfect for professionals, teams, and anyone who wants to give AI accurate context about themselves or their business.
```

**~950 caracteres**

---

### Español (para Edge o si Chrome permite múltiples idiomas)

```
myAI4context te permite crear y descargar tu documento de contexto para inteligencia artificial. Define quién eres, qué haces y qué quieres que las IAs sepan de ti o de tu organización.

Características:
• Múltiples perfiles: crea varios documentos (personal, empresa, proyecto)
• Descripción: texto manual + archivos PDF, Word o Markdown
• Enlaces: web, LinkedIn, YouTube, blogs… La IA puede consultarlos si no encuentra la información
• Opción de incluir contenido de enlaces al generar (obtiene el texto automáticamente)
• Reglas: indica qué puede y no puede decir la IA
• Descarga en JSON o Markdown para compartir con ChatGPT, Claude, Gemini
• Enlaces directos: añade un enlace en tu web para que los visitantes abran ChatGPT, Claude o Gemini con tu contexto ya cargado (requiere extensión)
• Plantillas para compartir: HTML listo para copiar para tu web, LinkedIn y documentos (Word, PDF)

Los datos se guardan solo en tu navegador. No hay servidores propios. Compatible con Chrome y Edge.

Ideal para profesionales, equipos y cualquiera que quiera dar a la IA un contexto preciso sobre sí mismo o su negocio.
```

---

## Cambios respecto a la versión actual

| Elemento | Antes | Después |
|----------|-------|---------|
| Descripción | No mencionaba enlaces directos ni plantillas | + Direct links: enlace en tu web para abrir el chat con contexto pre-cargado |
| | | + Share templates: HTML listo para web, LinkedIn, documentos |
| | | Frase final "Perfect for professionals..." (ya estaba) |

---

---

## Privacidad (Privacy)

### Descripción de la finalidad única (Single purpose)
**Máx. 1.000 caracteres**

```
Create and download AI context documents. Users define profiles (name, description, links, rules) and download the result as JSON or Markdown to share with ChatGPT, Claude, or Gemini. When users open a chat (ChatGPT, Claude, Gemini) via a link with their document URL, the extension injects that context automatically. Data is stored only in the browser.
```
(298 caracteres)

### Justificación de storage
**Máx. 1.000 caracteres**

```
To store user-created profiles locally (name, description, links, rules, attached files) and language preference. No data is synced to any server.
```
(146 caracteres) ✓ Sin cambios

### Justificación de permiso de host
**Máx. 1.000 caracteres**

```
(1) When the user enables "Include link content when generating", the extension fetches text from URLs the user added (website, LinkedIn, etc.) to include in the document. (2) When the user opens ChatGPT, Claude or Gemini via a link with a context_url parameter, the extension fetches the document from that URL to inject it into the chat. In both cases, content is processed locally and not sent to any server.
```
(358 caracteres)

---

## Notas

- El **título** y el **resumen** pueden mantenerse igual; ya describen bien el producto.
- La **descripción** ampliada destaca las funciones nuevas que añaden valor (enlaces directos y plantillas).
- **Privacidad:** La justificación de host incluye ahora los dos usos: contenido de enlaces al generar y enlaces directos al chat con context_url.

---

## Instrucciones adicionales (Additional instructions)
**Máx. 500 caracteres**

```
No login required. To test:
1) Click the extension icon to open the popup.
2) Click "New profile".
3) Complete the wizard: Identity (name), Description, Links, Rules. Click "Next" on each step. At the end, click "Save".
4) In the popup, click "JSON" or "MD" to download the document to your Downloads folder.
5) Click "Share" in the popup to get ready-to-copy templates for your website, LinkedIn, and documents.
```
(412 caracteres)
