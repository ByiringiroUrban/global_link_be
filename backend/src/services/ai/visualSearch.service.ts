import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { config } from '../../config';
import { listProducts } from '../commerce.service';

const STYLE_KEYWORDS: Record<string, string[]> = {
  casual: ['casual', 'comfort', 'relaxed', 'everyday'],
  formal: ['formal', 'elegant', 'business', 'suit'],
  sport: ['sport', 'athletic', 'running', 'active'],
  luxury: ['luxury', 'premium', 'leather', 'designer'],
  streetwear: ['streetwear', 'urban', 'denim', 'sneakers'],
  minimal: ['minimal', 'clean', 'simple', 'linen'],
  winter: ['winter', 'wool', 'coat', 'warm'],
  summer: ['summer', 'linen', 'light', 'breathable'],
};

function rgbToColorName(r: number, g: number, b: number): string {
  if (r > 200 && g > 200 && b > 200) return 'white';
  if (r < 60 && g < 60 && b < 60) return 'black';
  if (r > g && r > b) return 'warm';
  if (b > r && b > g) return 'cool';
  return 'neutral';
}

async function detectDominantColors(buffer: Buffer): Promise<string[]> {
  const { data } = await sharp(buffer)
    .resize(50, 50, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorCounts = new Map<string, number>();

  for (let i = 0; i < data.length; i += 3) {
    const name = rgbToColorName(data[i], data[i + 1], data[i + 2]);
    colorCounts.set(name, (colorCounts.get(name) || 0) + 1);
  }

  return [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

async function inferStyleTags(buffer: Buffer): Promise<string[]> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 1;
  const height = metadata.height || 1;
  const aspect = width / height;

  const tags: string[] = [];
  if (aspect > 1.2) tags.push('landscape-layout');
  else if (aspect < 0.8) tags.push('portrait-layout');

  const colors = await detectDominantColors(buffer);
  if (colors.includes('black') || colors.includes('white')) {
    tags.push('minimal', 'casual');
  }
  if (colors.includes('warm')) {
    tags.push('summer');
  }

  return tags.length > 0 ? tags : ['casual'];
}

function scoreProduct(
  product: {
    name: string;
    description: string | null;
    styleTags: string[];
  },
  styleTags: string[],
  colors: string[]
): number {
  const productTags = product.styleTags.map((t) => t.toLowerCase());
  let score = 0;

  for (const tag of styleTags) {
    const tagLower = tag.toLowerCase();
    for (const pt of productTags) {
      if (tagLower.includes(pt) || pt.includes(tagLower)) {
        score += 2;
      }
    }
    for (const keywords of Object.values(STYLE_KEYWORDS)) {
      if (keywords.includes(tagLower)) {
        for (const pt of productTags) {
          if (keywords.some((kw) => pt.includes(kw))) {
            score += 1;
          }
        }
      }
    }
  }

  const nameDesc = `${product.name} ${product.description || ''}`.toLowerCase();
  for (const color of colors) {
    if (nameDesc.includes(color)) {
      score += 0.5;
    }
  }

  return score;
}

export async function visualSearch(fileBuffer: Buffer, filename: string) {
  fs.mkdirSync(config.uploadDir, { recursive: true });

  const fileId = uuidv4();
  const ext = path.extname(filename) || '.jpg';
  const savedPath = path.join(config.uploadDir, `${fileId}${ext}`);
  fs.writeFileSync(savedPath, fileBuffer);

  const styleTags = await inferStyleTags(fileBuffer);
  const colors = await detectDominantColors(fileBuffer);

  const { products } = await listProducts(1, 100, 0, {});

  const matches = products
    .map((product) => ({
      ...product,
      matchScore: Math.round(scoreProduct(product, styleTags, colors) * 100) / 100,
    }))
    .filter((p) => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return {
    queryId: fileId,
    detectedStyles: styleTags,
    detectedColors: colors,
    matches,
    message: 'Visual search completed. Replace heuristic engine with ML model for production.',
  };
}
