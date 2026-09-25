'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { BreakingEvent } from '@/lib/types';
import { rp } from '@/lib/format';
import { StaffAvatar } from './StaffAvatar';
import { playCheer } from '@/lib/audio/cheer';

const CARD_LABEL: Record<string, string> = { SALES: 'PENJUALAN', FURNIPRO: 'FURNIPRO', COMSER: 'COMSER' };
const CONFETTI_COLORS = ['#fbbf24', '#e5484d', '#60a5fa', '#34d399', '#a78bfa'];

/** Serpihan confetti jatuh, dibuat ulang tiap event baru (key = eventId). */
function Confetti({ eventId }: { eventId: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.2 + Math.random() * 1.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
        width: 5 + Math.random() * 4,
      })),
    [eventId]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -16,
            left: `${p.left}%`,
            width: p.width,
            height: p.width * 1.8,
            background: p.color,
            opacity: 0.9,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Mendengarkan tabel breaking_events lewat Supabase Realtime. Baik event
 * otomatis (setelah disetujui admin) maupun event manual masuk lewat baris
 * yang sama, jadi komponen ini tidak perlu tahu asalnya — ia hanya
 * menampilkan baris berstatus "approved" yang baru masuk.
 */
export function BreakingNewsOverlay() {
  const [event, setEvent] = useState<BreakingEvent | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const channel = supabaseBrowser
      .channel('breaking-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'breaking_events' },
        async (payload) => {
          const row = payload.new as any;
          if (!row || row.status !== 'approved') return;
          // Ambil nama & photo_path dari view v_breaking (join ke employees).
          const { data } = await supabaseBrowser.from('v_breaking').select('*').eq('id', row.id).single();
          if (!data) return;
          setEvent(data as BreakingEvent);
          playCheer();
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setEvent(null), 12000);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
      clearTimeout(timer.current);
    };
  }, []);

  if (!event) return null;
  const hi = event.kpi as keyof typeof CARD_LABEL;

  return (
    <div
      className="fixed inset-0 bg-black/85 grid place-items-center z-50 p-4"
      onClick={() => setEvent(null)}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 text-white relative overflow-hidden animate-[pop_.5s_cubic-bezier(.2,1.4,.4,1)]"
        style={{ background: 'radial-gradient(120% 140% at 20% 0, #1e40af, #0b1230 70%)', border: '1px solid #3b5bdb' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Confetti eventId={event.id} />
        <button className="absolute right-3 top-3 bg-white/15 rounded-full px-2.5 py-1 text-sm z-10" onClick={() => setEvent(null)}>
          ✕
        </button>
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="bg-bad font-black italic text-2xl px-5 py-1.5 rounded -skew-x-6">BREAKING NEWS</div>
          <div className="bg-amber-400 text-navy font-extrabold text-[11px] px-3 py-1 rounded-full tracking-wide">
            {event.kategori}
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-6 items-center my-5">
          <div className="rounded-full p-1.5" style={{ background: 'conic-gradient(#f59e0b,#e5484d,#7c3aed,#2563eb,#0f9d58,#f59e0b)' }}>
            <div className="rounded-full overflow-hidden bg-slate-200" style={{ width: 150, height: 150 }}>
              <StaffAvatar nik={event.nik} name={event.nama} size={150} />
            </div>
          </div>
          <div>
            <small className="text-amber-400 font-extrabold tracking-widest">🎉 SELAMAT!</small>
            <h2 className="text-4xl font-black bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              {event.nama}
            </h2>
            <div className="tracking-[.3em] font-extrabold text-xs mt-1.5">‹‹‹ {event.sub_judul} ›››</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['SALES', 'FURNIPRO', 'COMSER'] as const).map((k) => (
            <div
              key={k}
              className={`border-[1.5px] rounded-2xl p-2.5 text-center bg-[#0f1e50]/50 ${
                hi === k ? 'border-amber-400 shadow-[0_0_22px_#fbbf2499]' : 'border-blue-500'
              }`}
            >
              <span className="block text-[10px] tracking-wide opacity-80 font-bold">{CARD_LABEL[k]}</span>
              <b className="text-xl">
                {k === 'SALES' && rp(event.sales_today)}
                {k === 'FURNIPRO' && `${event.furnipro_today ?? 0} Qty`}
                {k === 'COMSER' && rp(event.comser_today)}
              </b>
            </div>
          ))}
        </div>
        {event.pesan && (
          <div className="bg-bad -mx-6 mt-5 py-2.5 overflow-hidden whitespace-nowrap font-bold text-xs">
            <span className="inline-block pl-[100%] animate-[ticker_18s_linear_infinite]">{event.pesan}</span>
          </div>
        )}
      </div>
    </div>
  );
}
