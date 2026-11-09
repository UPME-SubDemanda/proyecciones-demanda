import { describe, expect, it } from 'vitest';
import { parseProduct, PRODUCTS } from './product';

describe('producto activo (LAY-07)', () => {
  it('lee un producto válido', () => expect(parseProduct('gn')).toBe('gn'));
  it('usa energía eléctrica si falta o no es válido', () => {
    expect(parseProduct(null)).toBe('ee');
    expect(parseProduct('agua')).toBe('ee');
  });
  it('nombres completos de la marca (UPME-VOC-01)', () => {
    expect(PRODUCTS.ee.name).toBe('Energía eléctrica');
    expect(PRODUCTS.gn.name).toBe('Gas natural');
  });
});
