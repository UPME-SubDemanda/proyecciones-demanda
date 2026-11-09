/**
 * Producto activo (contexto global, LAY-07): energía eléctrica o gas natural.
 * Vive en la URL (`?producto=ee`) para que se comparta y persista entre vistas.
 */
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ProductKey = 'ee' | 'gn';

export type ProductInfo = {
  key: ProductKey;
  name: string; // nombre completo (UPME-VOC-01)
  short: string; // etiqueta compacta
  unit: string; // unidad de la demanda anual
};

export const PRODUCTS: Record<ProductKey, ProductInfo> = {
  ee: { key: 'ee', name: 'Energía eléctrica', short: 'EE', unit: 'GWh' },
  gn: { key: 'gn', name: 'Gas natural', short: 'GN', unit: 'GBTUD' },
};

export const PRODUCT_KEYS = Object.keys(PRODUCTS) as ProductKey[];
export const DEFAULT_PRODUCT: ProductKey = 'ee';
export const PRODUCT_PARAM = 'producto';

/** Lee el producto de un valor de la URL; si no es válido, usa el de por defecto. */
export function parseProduct(value: string | null): ProductKey {
  return value && value in PRODUCTS ? (value as ProductKey) : DEFAULT_PRODUCT;
}

/** Producto activo y función para cambiarlo, sincronizados con `?producto=`. */
export function useProduct(): [ProductInfo, (key: ProductKey) => void] {
  const [params, setParams] = useSearchParams();
  const product = PRODUCTS[parseProduct(params.get(PRODUCT_PARAM))];
  const setProduct = useCallback(
    (key: ProductKey) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(PRODUCT_PARAM, key);
          return next;
        },
        { replace: true, preventScrollReset: true }, // UX-02: sin recargar ni mover el scroll
      ),
    [setParams],
  );
  return [product, setProduct];
}
