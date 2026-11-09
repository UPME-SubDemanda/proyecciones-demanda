import { cn } from '../../lib/cn';
import { icons } from '../../lib/icons';
import { PRODUCTS, type ProductKey } from '../../lib/product';

type Props = {
  product: ProductKey;
  size?: 40 | 48 | 60; // 40–60 px (UPME-ICO-02)
  /** Si es decorativo (el nombre del producto ya está al lado), no se anuncia. */
  decorative?: boolean;
  className?: string;
};

const SIZES = { 40: 'w-10 h-10', 48: 'w-12 h-12', 60: 'w-[60px] h-[60px]' } as const;
const FILL = { ee: 'bg-ee-fill', gn: 'bg-gn-fill' } as const;

/** Ícono de producto en círculo: relleno `<producto>-fill`, ícono `on-brand` (CMP). */
export function ProductIcon({ product, size = 40, decorative = false, className }: Props) {
  const Icon = icons[product];
  const iconSize = Math.round(size * 0.6);
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-pill text-on-brand shrink-0', SIZES[size], FILL[product], className)}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': PRODUCTS[product].name })}
    >
      <Icon width={iconSize} height={iconSize} aria-hidden="true" />
    </span>
  );
}
