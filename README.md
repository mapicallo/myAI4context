# myAI4context - AI Context Document

Extensión de AI4Context. [ai4context.com](https://ai4context.com)

**ES:** Documento de contexto para IAs. Un único lugar donde personas y organizaciones definen qué quieren que se sepa de ellos. Comparte un enlace, la IA responde.

**EN:** AI Context Document. A single place where people and organizations define what they want others to know about them. Share one link, the AI responds.

---

## Instalación (desarrollo)

1. Clona el repositorio o descarga el código.
2. Abre Chrome o Edge y ve a `chrome://extensions` (o `edge://extensions`).
3. Activa "Modo desarrollador".
4. Haz clic en "Cargar descomprimida" y selecciona la carpeta del proyecto.

## Uso

1. **Configurar perfil**: Haz clic en el icono de la extensión → "Configurar perfil". Se abrirá una pestaña con el wizard paso a paso.
2. **Rellenar datos**: Identidad, descripción, enlaces, reglas opcionales.
3. **Guardar**: Al final del wizard, pulsa "Guardar".
4. **Descargar**: En el popup, descarga tu documento en JSON o Markdown.

## POC: Abrir chat con contexto pre-cargado

Si tienes la extensión instalada, puedes usar enlaces que abren ChatGPT, Claude o Gemini con un documento de contexto ya inyectado:

- **ChatGPT:** `https://chat.openai.com/?context_url=https%3A%2F%2Fai4context.com%2FmyAI4c-AI4Contest-es.md`
- **Claude:** `https://claude.ai/?context_url=...`
- **Gemini:** `https://gemini.google.com/?context_url=...`

Ver [POC_CONTEXT_URL.md](POC_CONTEXT_URL.md) para el formato completo y ejemplos.

## Formato del documento

El documento generado sigue el esquema AI Context Document:

- **JSON**: Estructurado para consumo por IAs y herramientas.
- **Markdown**: Legible para humanos y IAs.

## Estructura del proyecto

```
myAI4context/
├── manifest.json
├── popup/           # Popup de la extensión
├── settings/        # Wizard de configuración (pestaña completa)
├── background/      # Service worker
└── assets/icons/    # Iconos (placeholder)
```

## Licencia

© AI4Context. Todos los derechos reservados.
