import fs from 'fs/promises';
import { JSDOM } from 'jsdom';

export interface Variant {
  color: string;
  size: string;
}

export interface Feature {
  key: string;
  value: string;
}

export interface ExtractionResult {
  success: boolean;
  brand: string;
  title: string;
  price: string;
  images: string[];
  variants: Variant[];
  features: Feature[];
}

export async function extractFromHtml(html: string): Promise<ExtractionResult> {
  const dom = new JSDOM(html);
  const scriptEls = Array.from(dom.window.document.querySelectorAll('script[type="application/ld+json"]'));
  const data = scriptEls
    .map(el => {
      try { return JSON.parse(el.textContent || '{}'); } catch { return {}; }
    })
    .find(d => d['@type'] === 'ProductGroup');

  if (!data) {
    return { success: false, brand: '', title: '', price: '', images: [], variants: [], features: [] };
  }

  const brand = data.brand?.name ?? data.manufacturer ?? '';
  const title = data.name ?? '';
  const price = data.offers?.price ?? '';
  const images: string[] = Array.isArray(data.image?.contentUrl) ? data.image.contentUrl : [];

  const variants: Variant[] = [];
  if (Array.isArray(data.hasVariant)) {
    for (const v of data.hasVariant) {
      const color = v.color ?? '';
      const sizes = Array.isArray(v.size) ? v.size : [];
      for (const size of sizes) {
        variants.push({ color, size });
      }
    }
  }

  const features: Feature[] = [];
  const additional = data.additionalProperty ?? [];
  for (const f of additional) {
    if (f.name && f.unitText) {
      features.push({ key: f.name, value: f.unitText });
    }
  }

  return { success: true, brand, title, price, images, variants, features };
}

export async function extractFromFile(filePath: string): Promise<ExtractionResult> {
  const html = await fs.readFile(filePath, 'utf8');
  return extractFromHtml(html);
}
