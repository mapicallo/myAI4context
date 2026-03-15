# Capturas de pantalla para Chrome Web Store

**Requisitos:** 1-5 capturas, 1280×800 o 640×400 px, JPEG o PNG 24 bits (sin alfa).

## Qué capturar

1. **Popup con lista de perfiles** – Clic en el icono de la extensión, con al menos un perfil creado y los botones JSON, MD, Editar, Eliminar visibles.
2. **Popup vacío** (opcional) – Estado inicial "Nuevo perfil" cuando no hay perfiles.
3. **Wizard – Pestaña Identidad** – Pantalla de settings, paso 1 (Nombre o título).
4. **Wizard – Pestaña Descripción** – Paso 2 con el área de bio y archivos.
5. **Documento descargado** (opcional) – Vista del archivo .md o .json generado en un editor.

## Cómo capturar

1. Carga la extensión en Chrome (`chrome://extensions` → Cargar descomprimida).
2. Haz clic en el icono para abrir el popup.
3. Usa la herramienta de captura de pantalla de Windows (Win+Shift+S) o similar.
4. Recorta a 1280×800 o 640×400 si hace falta (o redimensiona después con un editor).

## Redimensionar

Si las capturas no tienen el tamaño exacto, usa:

```
python create-promotional-tiles.py --folder ./mis-capturas
```

O con ImageMagick: `magick captura.png -resize 1280x800 captura-1280x800.png`
