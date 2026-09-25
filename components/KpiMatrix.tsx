import { StoreToday } from '@/lib/types';
import { num, pct, rp } from '@/lib/format';

export function KpiMatrix({ data }: { data: StoreToday | null }) {
  const items = [
    { label: 'Traffic', value: num(data?.traffic) },
    { label: 'Transaksi', value: num(data?.transaksi) },
    { label: 'Qty', value: num(data?.qty) },
    { label: 'SKU', value: num(data?.sku) },
    { label: 'SCR', value: pct(data?.scr, 1) },
    { label: 'Basket Size', value: rp(data?.basket_size) },
    { label: 'UPT', value: num(data?.upt, 1) },
    { label: 'AUR', value: rp(data?.aur) },
  ];
  return (
    <section className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="card p-2.5">
          <small className="text-mut text-[10px] font-bold uppercase">{it.label}</small>
          <b className="block text-lg font-black mt-0.5">{it.value}</b>
        </div>
      ))}
    </section>
  );
}
