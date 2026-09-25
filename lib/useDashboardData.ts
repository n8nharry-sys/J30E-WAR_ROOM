'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from './supabase/client';
import { StoreToday, TargetSummary, DeptToday, TopSeller, KpiRank, Champion, RunningTextRow } from './types';

type DashboardData = {
  store: StoreToday | null;
  target: TargetSummary | null;
  dept: DeptToday[];
  topSeller: TopSeller[];
  salesMtd: KpiRank[];
  furnipro: KpiRank[];
  comser: KpiRank[];
  champion: Champion[];
  runningText: RunningTextRow[];
};

const EMPTY: DashboardData = {
  store: null,
  target: null,
  dept: [],
  topSeller: [],
  salesMtd: [],
  furnipro: [],
  comser: [],
  champion: [],
  runningText: [],
};

/**
 * Ambil semua view sekaligus, lalu langganan Realtime ke tabel-tabel sumber.
 * Setiap ada perubahan (insert/update dari Apps Script), fetch ulang semua
 * view — datanya kecil, jadi lebih sederhana daripada patch parsial.
 */
export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(EMPTY);

  const refresh = useCallback(async () => {
    const [store, target, dept, topSeller, kpi, champion, runningText] = await Promise.all([
      supabaseBrowser.from('v_store_today').select('*').eq('tahun', new Date().getFullYear()).maybeSingle(),
      supabaseBrowser.from('v_target_summary').select('*').maybeSingle(),
      supabaseBrowser.from('v_dept_today').select('*'),
      supabaseBrowser.from('v_top_seller').select('*'),
      supabaseBrowser.from('v_kpi_rank').select('*'),
      supabaseBrowser.from('v_champion').select('*'),
      supabaseBrowser.from('v_running_text').select('*'),
    ]);

    setData({
      store: (store.data as StoreToday) ?? null,
      target: (target.data as TargetSummary) ?? null,
      dept: (dept.data as DeptToday[]) ?? [],
      topSeller: (topSeller.data as TopSeller[]) ?? [],
      salesMtd: ((kpi.data as KpiRank[]) ?? []).filter((k) => k.kpi === 'SALES'),
      furnipro: ((kpi.data as KpiRank[]) ?? []).filter((k) => k.kpi === 'FURNIPRO'),
      comser: ((kpi.data as KpiRank[]) ?? []).filter((k) => k.kpi === 'COMSER'),
      champion: (champion.data as Champion[]) ?? [],
      runningText: (runningText.data as RunningTextRow[]) ?? [],
    });
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabaseBrowser
      .channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_daily' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dept_daily' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'smt_daily' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kpi_mtd' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'target_harian' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'running_text' }, refresh)
      .subscribe();

    // Jaring pengaman: refresh tiap 60 detik kalau-kalau ada event realtime
    // yang tidak sampai (jaringan TV kadang kurang stabil).
    const poll = setInterval(refresh, 60000);

    return () => {
      supabaseBrowser.removeChannel(channel);
      clearInterval(poll);
    };
  }, [refresh]);

  return data;
}
