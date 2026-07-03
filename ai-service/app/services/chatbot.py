"""
AI Chatbot service – rule-based placeholder for customer support and style suggestions.

Replace with OpenAI, Anthropic, or a fine-tuned LLM for production.
"""

from typing import Any


STYLE_RESPONSES = {
    "casual": "For a casual look, try our linen shirts paired with slim denim jeans. Light layers work great for everyday wear.",
    "formal": "For formal occasions, consider our wool blend overcoat with tailored pieces. Dark neutral tones create a polished silhouette.",
    "sport": "Our urban running sneakers are perfect for active lifestyles. Pair them with comfortable streetwear for a sporty look.",
    "luxury": "Explore our leather crossbody bag and premium wool pieces for an elevated, luxury aesthetic.",
    "summer": "Breathable linen and light fabrics are ideal for summer. Check out our Classic White Linen Shirt.",
    "winter": "Stay warm with our Wool Blend Overcoat – perfect for cold weather styling.",
}

SUPPORT_RESPONSES = {
    "shipping": "Standard shipping takes 3-7 business days. Orders over $100 qualify for free shipping.",
    "return": "We accept returns within 30 days of delivery. Items must be unused with original tags.",
    "track": "Track your order using GET /api/orders/{id} with your order ID from the confirmation email.",
    "payment": "We accept major credit cards and secure online payment methods.",
}


def _detect_intent(message: str) -> tuple[str, str | None]:
    msg = message.lower()

    for style in STYLE_RESPONSES:
        if style in msg:
            return "style", style

    if any(w in msg for w in ["ship", "delivery", "deliver", "arrive"]):
        return "support", "shipping"
    if any(w in msg for w in ["return", "refund", "exchange"]):
        return "support", "return"
    if any(w in msg for w in ["track", "order status", "where is my"]):
        return "support", "track"
    if any(w in msg for w in ["pay", "payment", "card"]):
        return "support", "payment"
    if any(w in msg for w in ["recommend", "suggest", "style", "outfit", "wear"]):
        return "style", "casual"

    return "general", None


async def chat(
    message: str,
    user_id: str | None = None,
    conversation_id: str | None = None,
) -> dict[str, Any]:
    intent, topic = _detect_intent(message)

    if intent == "style" and topic:
        reply = STYLE_RESPONSES[topic]
    elif intent == "support" and topic:
        reply = SUPPORT_RESPONSES[topic]
    else:
        reply = (
            "Hello! I'm the Global Link AI assistant. I can help with style recommendations, "
            "order tracking, shipping, and returns. Try asking about casual outfits, "
            "shipping times, or return policies."
        )

    return {
        "conversationId": conversation_id or "new",
        "userId": user_id,
        "message": message,
        "reply": reply,
        "intent": intent,
        "topic": topic,
    }
