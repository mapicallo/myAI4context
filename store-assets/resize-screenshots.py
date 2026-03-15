#!/usr/bin/env python3
"""
Ajusta capturas a los requisitos de Chrome Web Store:
  - 1280 x 800 o 640 x 400 px
  - JPEG o PNG 24 bits (sin alfa)

Uso: python resize-screenshots.py
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Instala Pillow: pip install Pillow")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
INPUT_DIR = PROJECT_ROOT / "pantallazos"
OUTPUT_DIR = SCRIPT_DIR / "screenshots"

# Chrome Web Store: 1280x800 o 640x400
TARGET_SIZE = (1280, 800)
BG_COLOR = (248, 249, 250)  # #f8f9fa


def to_rgb_no_alpha(img):
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, BG_COLOR)
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode == "RGBA":
            bg.paste(img, mask=img.split()[-1])
        else:
            bg.paste(img)
        return bg
    return img.convert("RGB") if img.mode != "RGB" else img


def resize_contain(img, target):
    """Redimensiona manteniendo proporcion, anade fondo si hace falta."""
    tw, th = target
    iw, ih = img.size
    scale = min(tw / iw, th / ih)
    new_w = int(iw * scale)
    new_h = int(ih * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    out = Image.new("RGB", target, BG_COLOR)
    x = (tw - new_w) // 2
    y = (th - new_h) // 2
    out.paste(img, (x, y))
    return out


def main():
    if not INPUT_DIR.exists():
        print(f"Error: No existe {INPUT_DIR}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    files = sorted(INPUT_DIR.glob("*.png")) + sorted(INPUT_DIR.glob("*.jpg")) + sorted(INPUT_DIR.glob("*.jpeg"))
    if not files:
        print(f"No hay imagenes en {INPUT_DIR}")
        sys.exit(1)

    for i, f in enumerate(files[:5], 1):
        try:
            img = Image.open(f).copy()
            img = to_rgb_no_alpha(img)
            out_img = resize_contain(img, TARGET_SIZE)
            out_path = OUTPUT_DIR / f"screenshot-{i}-1280x800.png"
            out_img.save(out_path, "PNG")
            print(f"  OK: screenshot-{i}-1280x800.png ({TARGET_SIZE[0]}x{TARGET_SIZE[1]})")
        except Exception as e:
            print(f"  Error {f.name}: {e}")

    print(f"\nCapturas guardadas en {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
