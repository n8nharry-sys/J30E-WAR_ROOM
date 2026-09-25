import 'server-only';
import { cookies } from 'next/headers';

export function isAdmin(): boolean {
  const session = cookies().get('admin_session')?.value;
  return !!session && session === process.env.ADMIN_PASSWORD;
}
