import 'server-only';
import { cookies } from 'next/headers';

// Next.js 15+ membuat cookies() asynchronous, jadi fungsi ini (dan semua
// pemanggilnya) juga harus async.
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const session = store.get('admin_session')?.value;
  return !!session && session === process.env.ADMIN_PASSWORD;
}
