# myContext - AI Context Document

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

## Formato del documento

El documento generado sigue el esquema AI Context Document:

- **JSON**: Estructurado para consumo por IAs y herramientas.
- **Markdown**: Legible para humanos y IAs.

## Estructura del proyecto

```
myContext/
├── manifest.json
├── popup/           # Popup de la extensión
├── settings/        # Wizard de configuración (pestaña completa)
├── background/      # Service worker
└── assets/icons/    # Iconos (placeholder)
```

## Licencia

© AI4Context. Todos los derechos reservados.
