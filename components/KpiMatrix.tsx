import { Users, Receipt, Package, Tag, Percent, ShoppingBasket, Layers, TrendingUp } from 'lucide-react';
import { StoreToday } from '@/lib/types';
import { num, pct, rp } from '@/lib/format';

export function KpiMatrix({ data }: { data: StoreToday | null }) {
  const items = [
    { label: 'Traffic', value: num(data?.traffic), icon: Users, color: '#2563eb' },
    { label: 'Transaksi', value: num(data?.transaksi), icon: Receipt, color: '#0f9d58' },
    { label: 'Qty', value: num(data?.qty), icon: Package, color: '#f59e0b' },
    { label: 'SKU', value: num(data?.sku), icon: Tag, color: '#7c3aed' },
    { label: 'SCR', value: pct(data?.scr, 1), icon: Percent, color: '#e5484d' },
    { label: 'Basket Size', value: rp(data?.basket_size), icon: ShoppingBasket, color: '#0891b2' },
    { label: 'UPT', value: num(data?.upt, 1), icon: Layers, color: '#c026d3' },
    { label: 'AUR', value: rp(data?.aur), icon: TrendingUp, color: '#ea580c' },
  ];
  return (
    <section className="grid grid-cols-4 md:grid-cols-8 gap-2.5 shrink-0">
      {items.map((it) => (
        <div key={it.label} className="card p-2.5 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
            style={{ background: it.color + '1a', color: it.color }}
          >
            <it.icon size={18} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <small className="text-mut text-[10px] font-bold uppercase block">{it.label}</small>
            <b className="block text-base font-black truncate max-w-xs">{it.value}</b>
          </div>
        </div>
      ))}
    </section>
  );
}
