#!/usr/bin/env python3
"""
Genera recursos gráficos para Chrome Web Store / Edge Add-ons:
  - Icono 128x128 (copia/verifica)
  - Mosaico pequeño: 440x280 px
  - Mosaico grande: 1400x560 px

Formato: JPEG o PNG 24 bits (sin alfa) - requerido por Chrome Web Store

Uso: python generate-assets.py
Ejecutar desde la raíz del proyecto (o pasar ruta a assets/icons)
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Instala Pillow: pip install Pillow")
    sys.exit(1)

# Rutas
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ICONS_DIR = PROJECT_ROOT / "assets" / "icons"
OUTPUT_DIR = SCRIPT_DIR

ICON_SRC = ICONS_DIR / "icon128.png"
SIZE_SMALL = (440, 280)
SIZE_LARGE = (1400, 560)
# Color AI4Context (teal/azul)
BG_COLOR = (26, 58, 82)  # #1a3a52


def to_rgb_no_alpha(img: Image.Image) -> Image.Image:
    """Convierte a RGB sin canal alfa (requisito Chrome Web Store)."""
    if img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode == "RGBA":
            background.paste(img, mask=img.split()[-1])
        else:
            background.paste(img)
        return background
    return img.convert("RGB") if img.mode != "RGB" else img


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    if not ICON_SRC.exists():
        print(f"Error: No encontrado {ICON_SRC}")
        sys.exit(1)

    icon = Image.open(ICON_SRC).copy()
    icon_rgb = to_rgb_no_alpha(icon)

    # 1. Icono 128x128 - verificar/redimensionar
    if icon_rgb.size != (128, 128):
        icon_128 = icon_rgb.resize((128, 128), Image.Resampling.LANCZOS)
    else:
        icon_128 = icon_rgb
    icon_out = OUTPUT_DIR / "icon-128x128.png"
    icon_128.save(icon_out, "PNG")
    print(f"  OK: icon-128x128.png (128x128)")

    # 2. Mosaico pequeño 440x280 - icono centrado sobre fondo
    small = Image.new("RGB", SIZE_SMALL, BG_COLOR)
    icon_s = icon_rgb.resize((160, 160), Image.Resampling.LANCZOS)
    x = (SIZE_SMALL[0] - icon_s.width) // 2
    y = (SIZE_SMALL[1] - icon_s.height) // 2
    small.paste(icon_s, (x, y))
    small_out = OUTPUT_DIR / "promo-small-440x280.png"
    small.save(small_out, "PNG")
    print(f"  OK: promo-small-440x280.png ({SIZE_SMALL[0]}x{SIZE_SMALL[1]})")

    # 3. Mosaico grande 1400x560
    large = Image.new("RGB", SIZE_LARGE, BG_COLOR)
    icon_l = icon_rgb.resize((280, 280), Image.Resampling.LANCZOS)
    x = (SIZE_LARGE[0] - icon_l.width) // 2
    y = (SIZE_LARGE[1] - icon_l.height) // 2
    large.paste(icon_l, (x, y))
    large_out = OUTPUT_DIR / "promo-large-1400x560.png"
    large.save(large_out, "PNG")
    print(f"  OK: promo-large-1400x560.png ({SIZE_LARGE[0]}x{SIZE_LARGE[1]})")

    print(f"\nArchivos en {OUTPUT_DIR}/")
    print("Chrome Web Store:")
    print("  - icon-128x128.png     -> Icono de Chrome Web Store")
    print("  - promo-small-440x280.png  -> Imagen en mosaico promocional pequena")
    print("  - promo-large-1400x560.png -> Imagen en mosaico promocional con desplazamiento")


if __name__ == "__main__":
    main()
