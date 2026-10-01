import { BellRing, CheckCircle2, CreditCard, Phone, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SlotCard } from './SlotCard';
import type { BookingMode, SlotRecord } from '../types';

type BookingModalProps = {
  slot: SlotRecord | null;
  pitchName: string;
  selectedDate: string;
  userTrustScore: number;
  onClose: () => void;
  onSubmit: (payload: {
    paymentMode: BookingMode;
    phoneVerified: boolean;
    amount: number;
    deposit: number;
    isWaitlist: boolean;
  }) => void;
};

export function BookingModal({
  slot,
  pitchName,
  selectedDate,
  userTrustScore,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const [paymentMode, setPaymentMode] = useState<BookingMode>('full');
  const [phoneVerified, setPhoneVerified] = useState(true);

  const isWaitlist = slot ? slot.status === 'booked' || slot.status === 'pending' : false;

  const amount = slot?.price ?? 0;
  const deposit = useMemo(
    () => Math.min(slot?.deposit ?? Math.round(amount * 0.4), amount),
    [amount, slot?.deposit],
  );

  if (!slot) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit({
      paymentMode,
      phoneVerified,
      amount,
      deposit,
      isWaitlist,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-emerald-950/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Maydonni band qilish</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">{pitchName}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white">{selectedDate}</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">{slot.time}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-slate-300">
            <span>To’lov: </span>
            <span className="font-semibold text-emerald-200">
              {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(amount)}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-300">To’lov usuli</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: 'full', label: 'To’liq', icon: CreditCard },
                { id: 'deposit', label: 'Depozit', icon: ShieldCheck },
                { id: 'reserve', label: 'Zaxira', icon: BellRing },
              ].map((option) => {
                const Icon = option.icon;
                const selected = paymentMode === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMode(option.id as BookingMode)}
                    className={`rounded-2xl border p-3 text-left transition ${selected ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20'}`}
                  >
                    <Icon className="mb-2 h-5 w-5" />
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <SlotCard slot={slot} onCall={() => setPhoneVerified(true)} />

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-200">
                <Phone className="h-4 w-4 text-emerald-400" />
                Telefon tasdiqlash
              </div>
              <button
                type="button"
                onClick={() => setPhoneVerified((value) => !value)}
                className={`relative h-6 w-11 rounded-full transition ${phoneVerified ? 'bg-emerald-500' : 'bg-slate-700'}`}
                aria-label="Toggle phone verification"
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${phoneVerified ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {phoneVerified ? 'Tasdiqlangan. Avtomatik bekor qilish xavfi pasayadi.' : 'Tasdiqlanmagan. Reservatsiya 30 daqiqaga qadar bajarilishi kerak.'}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              Foydalanuvchi ishonch reytingi: {userTrustScore}
            </div>
            <p className="mt-2 text-amber-100/80">
              {isWaitlist
                ? 'Navbatga yozilish: asosiy band qilish bekor bo’lsa, birinchi navbatdagi foydalanuvchi 5 daqiqada xabardor bo’ladi.'
                : 'Depozit yoki to’liq to’lov bilan buyurtma qo’shilsa, no-show xavfi kamayadi.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Depozit:</span>
              <span className="font-medium text-white">
                {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(deposit)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-amber-200">
              <span>Qoldiq:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(Math.max(amount - deposit, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
            Bekor qilish
          </button>
          <button type="button" onClick={handleSubmit} className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            {isWaitlist ? 'Navbatga yozilish' : 'Band qilish'}
          </button>
        </div>
      </div>
    </div>
  );
}
