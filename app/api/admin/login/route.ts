import { NextRequest, NextResponse } from 'next/server';

// Otentikasi sederhana pakai satu password (ADMIN_PASSWORD di env) dan
// cookie httpOnly. Cukup untuk mengunci /admin dari orang luar; kalau tim
// admin lebih dari satu orang dengan kebutuhan berbeda, ganti dengan
// Supabase Auth nanti.
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 jam
    path: '/',
  });
  return res;
}
