"""
Recommendation engine – placeholder using style tag matching.

Replace with collaborative filtering or embedding-based recommendations
once user interaction data is available.
"""

import random
from typing import Any

from app.services.express_client import fetch_products


async def get_recommendations(
    user_id: str | None = None,
    style_preferences: list[str] | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    products = await fetch_products(limit=100)

    if not products:
        return {
            "userId": user_id,
            "recommendations": [],
            "strategy": "catalog-empty",
            "message": "No products available. Ensure Express API is running and seeded.",
        }

    preferences = [p.lower() for p in (style_preferences or [])]

    if preferences:
        scored = []
        for product in products:
            tags = [t.lower() for t in product.get("styleTags", [])]
            score = sum(1 for pref in preferences if any(pref in t or t in pref for t in tags))
            scored.append((score, product))
        scored.sort(key=lambda x: x[0], reverse=True)
        recommendations = [p for s, p in scored if s > 0][:limit]
        if len(recommendations) < limit:
            remaining = [p for _, p in scored if p not in recommendations]
            recommendations.extend(remaining[: limit - len(recommendations)])
        strategy = "style-preference"
    else:
        recommendations = random.sample(products, min(limit, len(products)))
        strategy = "popular-random"

    return {
        "userId": user_id,
        "recommendations": recommendations,
        "strategy": strategy,
        "message": "Personalized recommendations. Enhance with ML as user data grows.",
    }
