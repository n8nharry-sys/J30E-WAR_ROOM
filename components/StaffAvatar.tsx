'use client';

import { useState } from 'react';
import Image from 'next/image';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos`
  : '';

/**
 * Foto staff dari Supabase Storage bucket "photos" ({nik}.jpg). Kalau foto
 * belum diupload untuk NIK tersebut, otomatis jatuh ke lingkaran inisial
 * supaya layout tidak rusak menampilkan gambar rusak di TV.
 */
export function StaffAvatar({ nik, name, size = 36 }: { nik: number; name: string; size?: number }) {
  const [broken, setBroken] = useState(!BUCKET);

  if (broken) {
    return (
      <div
        className="rounded-full bg-gradient-to-br from-slate-400 to-slate-300 text-white grid place-items-center font-extrabold"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={`${BUCKET}/${nik}.jpg`}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover"
      onError={() => setBroken(true)}
      unoptimized
    />
  );
}
