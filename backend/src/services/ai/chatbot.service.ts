const STYLE_RESPONSES: Record<string, string> = {
  casual:
    'For a casual look, try our linen shirts paired with slim denim jeans. Light layers work great for everyday wear.',
  formal:
    'For formal occasions, consider our wool blend overcoat with tailored pieces. Dark neutral tones create a polished silhouette.',
  sport:
    'Our urban running sneakers are perfect for active lifestyles. Pair them with comfortable streetwear for a sporty look.',
  luxury:
    'Explore our leather crossbody bag and premium wool pieces for an elevated, luxury aesthetic.',
  summer:
    'Breathable linen and light fabrics are ideal for summer. Check out our Classic White Linen Shirt.',
  winter:
    'Stay warm with our Wool Blend Overcoat – perfect for cold weather styling.',
};

const SUPPORT_RESPONSES: Record<string, string> = {
  shipping: 'Standard shipping takes 3-7 business days. Orders over $100 qualify for free shipping.',
  return: 'We accept returns within 30 days of delivery. Items must be unused with original tags.',
  track: 'Track your order using GET /api/orders/{id} with your order ID from the confirmation email.',
  payment: 'We accept major credit cards and secure online payment methods.',
};

function detectIntent(message: string): { intent: string; topic: string | null } {
  const msg = message.toLowerCase();

  for (const style of Object.keys(STYLE_RESPONSES)) {
    if (msg.includes(style)) {
      return { intent: 'style', topic: style };
    }
  }

  if (['ship', 'delivery', 'deliver', 'arrive'].some((w) => msg.includes(w))) {
    return { intent: 'support', topic: 'shipping' };
  }
  if (['return', 'refund', 'exchange'].some((w) => msg.includes(w))) {
    return { intent: 'support', topic: 'return' };
  }
  if (['track', 'order status', 'where is my'].some((w) => msg.includes(w))) {
    return { intent: 'support', topic: 'track' };
  }
  if (['pay', 'payment', 'card'].some((w) => msg.includes(w))) {
    return { intent: 'support', topic: 'payment' };
  }
  if (['recommend', 'suggest', 'style', 'outfit', 'wear'].some((w) => msg.includes(w))) {
    return { intent: 'style', topic: 'casual' };
  }

  return { intent: 'general', topic: null };
}

export async function chat(
  message: string,
  userId?: string | null,
  conversationId?: string | null
) {
  const { intent, topic } = detectIntent(message);

  let reply: string;
  if (intent === 'style' && topic) {
    reply = STYLE_RESPONSES[topic];
  } else if (intent === 'support' && topic) {
    reply = SUPPORT_RESPONSES[topic];
  } else {
    reply =
      "Hello! I'm the Global Link AI assistant. I can help with style recommendations, " +
      'order tracking, shipping, and returns. Try asking about casual outfits, ' +
      'shipping times, or return policies.';
  }

  return {
    conversationId: conversationId || 'new',
    userId,
    message,
    reply,
    intent,
    topic,
  };
}
