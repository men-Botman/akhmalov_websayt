import { BellRing, CheckCircle2, CreditCard, PhoneCall, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(value);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!slot) {
    return null;
  }

  const amount = slot.price ?? 0;
  const deposit = useMemo(
    () => Math.min(slot?.deposit ?? Math.round(amount * 0.4), amount),
    [amount, slot?.deposit],
  );

  const isWaitlist = slot.status === 'booked' || slot.status === 'pending';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-[1px]">
      <div className="relative w-full max-w-[360px] space-y-2.5 rounded-xl border border-slate-800/80 bg-[#080d14] p-3.5 text-xs text-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking modal"
          className="absolute right-3 top-3 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/80 p-2.5 pr-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">{pitchName}</p>
            <p className="mt-0.5 text-xs font-semibold text-white">{selectedDate}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">To'lov:</p>
          </div>
          <div className="text-right">
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
              {slot.time}
            </span>
            <p className="mt-0.5 text-xs font-bold text-emerald-400">{formatCurrency(amount)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">To'lov usuli</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'full', label: "To'liq", icon: CreditCard },
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
                  className={`flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                    selected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="mb-1 h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-semibold">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tez aloqaga chiqish</span>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-400">Telefon raqam</label>
            <input
              type="text"
              defaultValue="+998 90 123 45 67"
              className="w-full rounded-md border border-slate-800 bg-[#05090e] px-2.5 py-1.5 text-xs text-white transition-colors focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Raqam qo'shish va Qo'ng'iroq qilish</span>
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
              <span>Telefon tasdiqlash</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Tasdiqlangan. Avtomatik bekor qilish xavfi pasayadi.
            </p>
          </div>
          <input
            type="checkbox"
            checked={phoneVerified}
            onChange={() => setPhoneVerified((value) => !value)}
            className="h-4 w-4 cursor-pointer accent-emerald-500 rounded"
          />
        </div>

        <div className="space-y-1 rounded-lg border border-amber-800/40 bg-amber-950/20 p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Foydalanuvchi ishonch reytingi: {userTrustScore}</span>
          </div>
          <p className="text-[10px] leading-relaxed text-amber-200/70">
            Depozit yoki to'liq to'lov bilan buyurtma qo'shilsa, no-show xavfi kamayadi.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/80 p-2.5 text-[11px]">
          <span className="text-slate-400">
            Depozit: <strong className="text-white">{formatCurrency(deposit)}</strong>
          </span>
          <span className="text-slate-400">
            Qoldiq: <strong className="text-emerald-400">{formatCurrency(Math.max(amount - deposit, 0))}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            {isWaitlist ? 'Navbatga yozilish' : 'Band qilish'}
          </button>
        </div>
      </div>
    </div>
  );
}
