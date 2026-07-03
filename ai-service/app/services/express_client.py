import httpx
from typing import Any

from app.config import settings


async def fetch_products(limit: int = 50) -> list[dict[str, Any]]:
    """Fetch products from Express API for recommendation matching."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.express_api_url}/api/products",
                params={"limit": limit},
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
    except httpx.HTTPError:
        pass
    return []


async def fetch_product_by_id(product_id: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.express_api_url}/api/products/{product_id}"
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data")
    except httpx.HTTPError:
        pass
    return None
