# POC: Inyectar contexto al abrir ChatGPT, Claude o Gemini

**Requisito:** Extensión myAI4context instalada (Chrome o Edge).

## Formato de URL

```
https://chat.openai.com/?context_url=URL_ENCODED_DEL_DOCUMENTO
https://chatgpt.com/?context_url=URL_ENCODED_DEL_DOCUMENTO
https://claude.ai/?context_url=URL_ENCODED_DEL_DOCUMENTO
https://gemini.google.com/?context_url=URL_ENCODED_DEL_DOCUMENTO
```

### Parámetros

| Parámetro       | Requerido | Descripción                                                                 |
|-----------------|-----------|-----------------------------------------------------------------------------|
| `context_url`   | Sí        | URL del documento .md (o texto) a cargar como contexto. Debe ser URL-encoded. |
| `context_prompt`| No        | Texto final que se añade tras el documento. Por defecto: "Pregunta lo que quieras sobre el contenido. ¿En qué puedo ayudarte?" |

## Ejemplos

### ChatGPT con documento AI4Context (ES)
```
https://chat.openai.com/?context_url=https%3A%2F%2Fai4context.com%2FmyAI4c-AI4Contest-es.md
```

### Claude con documento AI4Context (EN)
```
https://claude.ai/?context_url=https%3A%2F%2Fai4context.com%2FmyAI4c-AI4Contest-en.md
```

### Gemini con prompt personalizado
```
https://gemini.google.com/?context_url=https%3A%2F%2Fai4context.com%2Fmi-doc.md&context_prompt=Pregunta%20lo%20que%20quieras%20de%20AI4Context
```

## Flujo

1. Usuario hace clic en el enlace (desde la landing, email, etc.).
2. Se abre la pestaña del chat correspondiente.
3. El content script de la extensión detecta `context_url` en la URL.
4. Descarga el contenido del documento.
5. Lo inyecta en el input del chat + el prompt final.
6. Limpia la URL (replaceState) para no re-ejecutar al recargar.
7. Auto-envía el mensaje tras 500 ms (opcional).

## Enlaces para la landing

Si la landing sirve los documentos en `https://ai4context.com/`:

| IA      | Enlace base |
|---------|-------------|
| ChatGPT | `https://chat.openai.com/?context_url=https%3A%2F%2Fai4context.com%2FmyAI4c-AI4Contest-{es\|en}.md` |
| Claude  | `https://claude.ai/?context_url=https%3A%2F%2Fai4context.com%2FmyAI4c-AI4Contest-{es\|en}.md` |
| Gemini  | `https://gemini.google.com/?context_url=https%3A%2F%2Fai4context.com%2FmyAI4c-AI4Contest-{es\|en}.md` |

El idioma (`es` o `en`) se elige según el selector de idioma de la landing.
