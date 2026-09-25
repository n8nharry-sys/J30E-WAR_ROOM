'use client';

import { useEffect, useState } from 'react';

type Employee = { nik: number; nama: string };
type PendingEvent = {
  id: number;
  nik: number;
  kategori: string;
  sub_judul: string;
  pesan: string | null;
  sales_today: number;
  furnipro_today: number;
  comser_today: number;
  source: 'auto' | 'manual';
  employees?: { nama: string };
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (res.status === 401) throw new Error('unauthorized');
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Gagal');
  return json;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      onSuccess();
    } catch {
      setError('Password salah.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#eef2f7]">
      <form onSubmit={submit} className="card w-80">
        <h1 className="text-lg font-black mb-3">Admin — J30E War Room</h1>
        <input
          type="password"
          placeholder="Password admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-2"
          autoFocus
        />
        {error && <p className="text-bad text-xs mb-2">{error}</p>}
        <button disabled={loading} className="w-full bg-navy text-white rounded-lg py-2 font-bold">
          {loading ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}

const CATEGORIES = [
  { value: 'TRANSAKSI PENJUALAN BESAR', sub: 'SALES HEBAT' },
  { value: 'TRANSAKSI FURNIPRO', sub: 'FURNIPRO STAR' },
  { value: 'TRANSAKSI COMSER', sub: 'COMSER HERO' },
  { value: 'PENGHARGAAN KHUSUS', sub: 'STAFF TERBAIK' },
];

function ManualForm({ employees, onCreated }: { employees: Employee[]; onCreated: () => void }) {
  const [nik, setNik] = useState<number | ''>('');
  const [kategori, setKategori] = useState(CATEGORIES[0].value);
  const [subJudul, setSubJudul] = useState(CATEGORIES[0].sub);
  const [pesan, setPesan] = useState('');
  const [sales, setSales] = useState(0);
  const [furnipro, setFurnipro] = useState(0);
  const [comser, setComser] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const selectedName = employees.find((e) => e.nik === nik)?.nama ?? '—';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nik) return;
    setBusy(true);
    setMsg('');
    try {
      await api('/api/admin/breaking', {
        method: 'POST',
        body: JSON.stringify({
          nik,
          kategori,
          sub_judul: subJudul,
          pesan,
          sales_today: sales,
          furnipro_today: furnipro,
          comser_today: comser,
        }),
      });
      setMsg('Event dibuat dan masuk daftar menunggu persetujuan di bawah.');
      onCreated();
    } catch (err: any) {
      setMsg('Gagal: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="h">Buat Breaking News Manual</div>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          SMT / Staff
          <select
            value={nik}
            onChange={(e) => setNik(Number(e.target.value))}
            className="w-full border border-line rounded-lg px-2 py-1.5 mt-1"
            required
          >
            <option value="">Pilih...</option>
            {employees.map((e) => (
              <option key={e.nik} value={e.nik}>
                {e.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Kategori
          <select
            value={kategori}
            onChange={(e) => {
              const c = CATEGORIES.find((c) => c.value === e.target.value)!;
              setKategori(c.value);
              setSubJudul(c.sub);
            }}
            className="w-full border border-line rounded-lg px-2 py-1.5 mt-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sub judul
          <input value={subJudul} onChange={(e) => setSubJudul(e.target.value)} className="w-full border border-line rounded-lg px-2 py-1.5 mt-1" />
        </label>
        <label className="text-sm">
          Pesan (ticker merah)
          <input value={pesan} onChange={(e) => setPesan(e.target.value)} className="w-full border border-line rounded-lg px-2 py-1.5 mt-1" />
        </label>
        <label className="text-sm">
          Penjualan (Rp)
          <input type="number" value={sales} onChange={(e) => setSales(Number(e.target.value))} className="w-full border border-line rounded-lg px-2 py-1.5 mt-1" />
        </label>
        <label className="text-sm">
          Furnipro (Qty)
          <input type="number" value={furnipro} onChange={(e) => setFurnipro(Number(e.target.value))} className="w-full border border-line rounded-lg px-2 py-1.5 mt-1" />
        </label>
        <label className="text-sm">
          Comser (Rp)
          <input type="number" value={comser} onChange={(e) => setComser(Number(e.target.value))} className="w-full border border-line rounded-lg px-2 py-1.5 mt-1" />
        </label>

        {/* Pratinjau ringkas sebelum dikirim ke antrian persetujuan */}
        <div className="col-span-2 bg-navy text-white rounded-xl p-3 text-sm">
          <b className="text-amber-400 text-xs">{kategori}</b>
          <div className="text-lg font-black">{selectedName}</div>
          <div className="text-xs opacity-80">{subJudul}</div>
        </div>

        <button disabled={busy || !nik} className="col-span-2 bg-navy text-white rounded-lg py-2 font-bold">
          {busy ? 'Mengirim...' : 'Kirim ke Antrian Persetujuan'}
        </button>
        {msg && <p className="col-span-2 text-xs text-mut">{msg}</p>}
      </form>
    </div>
  );
}

function PendingQueue({ items, onChanged }: { items: PendingEvent[]; onChanged: () => void }) {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function act(id: number, status: 'approved' | 'rejected') {
    setBusyId(id);
    try {
      await api(`/api/admin/breaking/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card">
      <div className="h">Menunggu Persetujuan ({items.length})</div>
      {items.length === 0 && <p className="text-mut text-sm py-4 text-center">Tidak ada event menunggu.</p>}
      <div className="grid gap-2">
        {items.map((ev) => (
          <div key={ev.id} className="flex items-center justify-between border border-line rounded-xl p-2.5">
            <div>
              <span className="text-[10px] font-bold text-mut uppercase">
                {ev.source === 'auto' ? 'Otomatis' : 'Manual'} · {ev.kategori}
              </span>
              <div className="font-bold">{ev.employees?.nama ?? `NIK ${ev.nik}`}</div>
              <div className="text-xs text-mut">{ev.sub_judul}</div>
            </div>
            <div className="flex gap-1.5">
              <button
                disabled={busyId === ev.id}
                onClick={() => act(ev.id, 'approved')}
                className="bg-good text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Tayangkan
              </button>
              <button
                disabled={busyId === ev.id}
                onClick={() => act(ev.id, 'rejected')}
                className="bg-bad text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const [mode, setMode] = useState<'auto' | 'review'>('review');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/admin/settings').then((r) => setMode(r.breaking_mode));
  }, []);

  async function change(next: 'auto' | 'review') {
    setBusy(true);
    try {
      await api('/api/admin/settings', { method: 'POST', body: JSON.stringify({ breaking_mode: next }) });
      setMode(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="h">Mode Event Otomatis</div>
      <p className="text-xs text-mut mb-2">
        Menentukan apakah breaking news yang dipicu aturan KPI (Sales ≥ Rp 10 juta, Furnipro ≥ 4 qty, Comser ≥ Rp 500 ribu)
        langsung tayang atau menunggu Anda setujui dulu.
      </p>
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => change('review')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm ${mode === 'review' ? 'bg-navy text-white' : 'bg-line'}`}
        >
          Tinjau dulu
        </button>
        <button
          disabled={busy}
          onClick={() => change('auto')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm ${mode === 'auto' ? 'bg-navy text-white' : 'bg-line'}`}
        >
          Langsung tayang
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pending, setPending] = useState<PendingEvent[]>([]);

  async function loadAll() {
    try {
      const [emp, pend] = await Promise.all([api('/api/admin/employees'), api('/api/admin/breaking')]);
      setEmployees(emp.data);
      setPending(pend.data);
      setAuthed(true);
    } catch {
      setAuthed(false);
    } finally {
      setChecked(true);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (!checked) return null;
  if (!authed) return <LoginForm onSuccess={loadAll} />;

  return (
    <main className="max-w-4xl mx-auto p-4 grid gap-3">
      <h1 className="text-xl font-black">Admin — J30E War Room</h1>
      <PendingQueue items={pending} onChanged={loadAll} />
      <ManualForm employees={employees} onCreated={loadAll} />
      <SettingsPanel />
    </main>
  );
}
