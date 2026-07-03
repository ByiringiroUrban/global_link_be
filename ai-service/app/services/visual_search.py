"""
Visual search service – placeholder implementation.

Replace with a real embedding model (e.g. CLIP, ResNet) and vector DB
(Pinecone, pgvector) for production visual similarity search.
"""

import os
import uuid
from typing import Any

from PIL import Image

from app.config import settings
from app.services.express_client import fetch_products


STYLE_KEYWORDS = {
    "casual": ["casual", "comfort", "relaxed", "everyday"],
    "formal": ["formal", "elegant", "business", "suit"],
    "sport": ["sport", "athletic", "running", "active"],
    "luxury": ["luxury", "premium", "leather", "designer"],
    "streetwear": ["streetwear", "urban", "denim", "sneakers"],
    "minimal": ["minimal", "clean", "simple", "linen"],
    "winter": ["winter", "wool", "coat", "warm"],
    "summer": ["summer", "linen", "light", "breathable"],
}


def _detect_dominant_colors(image: Image.Image) -> list[str]:
    """Simple color detection from image palette."""
    small = image.convert("RGB").resize((50, 50))
    colors = small.getcolors(maxcolors=256 * 256)
    if not colors:
        return ["neutral"]

    dominant = sorted(colors, key=lambda x: x[0], reverse=True)[:3]
    color_names = []
    for _, rgb in dominant:
        r, g, b = rgb
        if r > 200 and g > 200 and b > 200:
            color_names.append("white")
        elif r < 60 and g < 60 and b < 60:
            color_names.append("black")
        elif r > g and r > b:
            color_names.append("warm")
        elif b > r and b > g:
            color_names.append("cool")
        else:
            color_names.append("neutral")
    return list(dict.fromkeys(color_names))


def _infer_style_tags(image: Image.Image) -> list[str]:
    """Heuristic style inference – replace with ML model in production."""
    width, height = image.size
    aspect = width / height if height else 1

    tags = []
    if aspect > 1.2:
        tags.append("landscape-layout")
    elif aspect < 0.8:
        tags.append("portrait-layout")

    colors = _detect_dominant_colors(image)
    if "black" in colors or "white" in colors:
        tags.extend(["minimal", "casual"])
    if "warm" in colors:
        tags.append("summer")

    return tags or ["casual"]


def _score_product(product: dict[str, Any], style_tags: list[str], colors: list[str]) -> float:
    product_tags = [t.lower() for t in product.get("styleTags", [])]
    score = 0.0

    for tag in style_tags:
        tag_lower = tag.lower()
        for pt in product_tags:
            if tag_lower in pt or pt in tag_lower:
                score += 2.0
        for keywords in STYLE_KEYWORDS.values():
            if tag_lower in keywords:
                for pt in product_tags:
                    if any(kw in pt for kw in keywords):
                        score += 1.0

    name_desc = f"{product.get('name', '')} {product.get('description', '')}".lower()
    for color in colors:
        if color in name_desc:
            score += 0.5

    return score


async def visual_search(file_content: bytes, filename: str) -> dict[str, Any]:
    os.makedirs(settings.upload_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(filename)[1] or ".jpg"
    saved_path = os.path.join(settings.upload_dir, f"{file_id}{ext}")

    with open(saved_path, "wb") as f:
        f.write(file_content)

    image = Image.open(saved_path)
    style_tags = _infer_style_tags(image)
    colors = _detect_dominant_colors(image)

    products = await fetch_products(limit=100)
    scored = []
    for product in products:
        score = _score_product(product, style_tags, colors)
        if score > 0:
            scored.append({**product, "matchScore": round(score, 2)})

    scored.sort(key=lambda x: x["matchScore"], reverse=True)
    matches = scored[:10]

    return {
        "queryId": file_id,
        "detectedStyles": style_tags,
        "detectedColors": colors,
        "matches": matches,
        "message": "Visual search completed. Replace heuristic engine with ML model for production.",
    }
