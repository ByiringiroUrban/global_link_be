import { listProducts } from '../commerce.service';

export async function getRecommendations(
  userId?: string | null,
  stylePreferences?: string[] | null,
  limit = 10
) {
  const { products } = await listProducts(1, 100, 0, {});

  if (products.length === 0) {
    return {
      userId,
      recommendations: [],
      strategy: 'catalog-empty',
      message: 'No products available. Run npm run db:seed to populate sample data.',
    };
  }

  const preferences = (stylePreferences || []).map((p) => p.toLowerCase());

  if (preferences.length > 0) {
    const scored = products.map((product) => {
      const tags = product.styleTags.map((t) => t.toLowerCase());
      const score = preferences.reduce(
        (sum, pref) => sum + (tags.some((t) => pref.includes(t) || t.includes(pref)) ? 1 : 0),
        0
      );
      return { score, product };
    });

    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.filter((s) => s.score > 0).map((s) => s.product).slice(0, limit);

    if (recommendations.length < limit) {
      const remaining = scored.map((s) => s.product).filter((p) => !recommendations.includes(p));
      recommendations.push(...remaining.slice(0, limit - recommendations.length));
    }

    return {
      userId,
      recommendations,
      strategy: 'style-preference',
      message: 'Personalized recommendations. Enhance with ML as user data grows.',
    };
  }

  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return {
    userId,
    recommendations: shuffled.slice(0, limit),
    strategy: 'popular-random',
    message: 'Personalized recommendations. Enhance with ML as user data grows.',
  };
}
