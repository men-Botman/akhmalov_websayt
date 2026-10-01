import { AlertTriangle, Ban, CheckCircle2, PhoneCall, TrendingUp, XCircle } from 'lucide-react';

import type { Pitch, UserTrust } from '../types';

type AdminDashboardProps = {
  pitches: Pitch[];
  users: UserTrust[];
  onAction: (pitchId: string, slotId: string, action: 'arrived' | 'no-show' | 'cancel') => void;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(amount);

const normalizeUzbekPhone = (value?: string) => {
  if (!value) {
    return '';
  }

  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('998')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+998${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+998${digits}`;
  }

  return `+998${digits}`;
};

const triggerQuickCall = (phone?: string) => {
  const normalized = normalizeUzbekPhone(phone);

  if (!normalized) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);

  if (isMobile) {
    window.location.href = `tel:${normalized}`;
    return;
  }

  window.alert(`Qo'ng'iroq qilish uchun raqam: ${normalized}. Uni nusxalash yoki Telegram orqali yozish mumkin.`);
  window.location.href = `tel:${normalized}`;
};

export function AdminDashboard({ pitches, users, onAction }: AdminDashboardProps) {
  const totalRevenue = pitches.reduce(
    (sum, pitch) =>
      sum +
      pitch.slots.reduce((slotSum, slot) => {
        if (slot.status === 'booked' || slot.status === 'pending') {
          return slotSum + slot.price;
        }
        return slotSum;
      }, 0),
    0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Admin panel</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">Bugungi jadval</h3>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Daromad</div>
            <div className="mt-1 font-semibold text-emerald-100">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {pitches.map((pitch) => (
            <div key={pitch.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium text-white">{pitch.name}</div>
                <div className="text-xs text-slate-400">{pitch.location}</div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {pitch.slots.map((slot) => (
                  <div key={`${pitch.id}-${slot.id}`} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{slot.time}</div>
                        <div className="mt-1 text-sm font-medium text-white">{slot.user ?? 'Bo\'sh'}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        slot.status === 'booked'
                          ? 'bg-rose-500/15 text-rose-200'
                          : slot.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-200'
                            : slot.status === 'waitlist'
                              ? 'bg-orange-500/15 text-orange-200'
                              : 'bg-emerald-500/15 text-emerald-200'
                      }`}>
                        {slot.status === 'booked'
                          ? 'Band'
                          : slot.status === 'pending'
                            ? 'Kutilmoqda'
                            : slot.status === 'waitlist'
                              ? 'Navbat'
                              : 'Bo\'sh'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button type="button" onClick={() => onAction(pitch.id, slot.id, 'arrived')} className="rounded-xl bg-emerald-500 px-2 py-2 text-[11px] font-medium text-slate-950 hover:bg-emerald-400">
                        <CheckCircle2 className="mx-auto mb-1 h-3.5 w-3.5" />
                        Keldi
                      </button>
                      <button type="button" onClick={() => onAction(pitch.id, slot.id, 'no-show')} className="rounded-xl bg-amber-500 px-2 py-2 text-[11px] font-medium text-slate-950 hover:bg-amber-400">
                        <AlertTriangle className="mx-auto mb-1 h-3.5 w-3.5" />
                        Kelmaslik
                      </button>
                      <button type="button" onClick={() => onAction(pitch.id, slot.id, 'cancel')} className="rounded-xl bg-rose-500 px-2 py-2 text-[11px] font-medium text-white hover:bg-rose-400">
                        <XCircle className="mx-auto mb-1 h-3.5 w-3.5" />
                        Bekor
                      </button>
                      {(slot.status === 'booked' || slot.status === 'pending') && slot.bookedBy?.phone ? (
                        <button
                          type="button"
                          onClick={() => triggerQuickCall(slot.bookedBy?.phone)}
                          className="rounded-xl bg-emerald-600 px-2 py-2 text-[11px] font-medium text-white hover:bg-emerald-500"
                        >
                          <PhoneCall className="mx-auto mb-1 h-3.5 w-3.5" />
                          Mijozga qo'ng'iroq qilish
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex items-center gap-2 text-emerald-300">
          <TrendingUp className="h-5 w-5" />
          Foydalanuvchi ishonchi
        </div>
        <div className="mt-5 space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">Penalti: {user.penalties}</div>
                </div>
                <div className={`rounded-full px-2 py-1 text-xs font-medium ${user.trustScore >= 75 ? 'bg-emerald-500/15 text-emerald-200' : user.trustScore >= 55 ? 'bg-amber-500/15 text-amber-200' : 'bg-rose-500/15 text-rose-200'}`}>
                  {user.trustScore}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                <span>Prepay</span>
                <span className={user.prepaidOnly ? 'text-rose-300' : 'text-emerald-300'}>
                  {user.prepaidOnly ? 'Majburiy' : 'Afsuski yo`q'}
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${user.trustScore >= 75 ? 'bg-emerald-500' : user.trustScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${user.trustScore}%` }} />
              </div>

              <div className="mt-3 flex gap-2">
                <button type="button" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[11px] font-medium text-slate-200 hover:bg-white/10">
                  <Ban className="mx-auto mb-1 h-3.5 w-3.5" />
                  Bloklash
                </button>
                <button type="button" className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2 py-2 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/20">
                  <CheckCircle2 className="mx-auto mb-1 h-3.5 w-3.5" />
                  Tiklash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
