import { extractFromFile } from '../server/focused-extractor';

const htmlPath = 'wamoss_product.html';

test('extracts product data from wamoss_product.html', async () => {
  const result = await extractFromFile(htmlPath);
  expect(result.success).toBe(true);
  expect(result.brand).toBe('wamoss');
  expect(result.title).toContain('wamoss Salaş Mevsimlik Pileli Klasik Baggy Pantolon');
  expect(result.price).toBe('399.99');
  expect(result.images.length).toBeGreaterThan(0);
  expect(result.images[0]).toMatch(/1_org_zoom.jpg$/);
  expect(result.variants.length).toBeGreaterThan(0);
  expect(result.features.length).toBeGreaterThan(0);
});
