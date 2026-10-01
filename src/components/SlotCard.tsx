import { Copy, MessageCircleMore, PhoneCall } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { SlotRecord } from '../types';

type SlotCardProps = {
  slot: SlotRecord;
  onCall?: (phoneNumber: string) => void;
};

const normalizeUzbekPhone = (value: string) => {
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

  if (digits.length > 9) {
    return `+998${digits.slice(-9)}`;
  }

  return `+998${digits}`;
};

const isValidUzbekPhone = (value: string) => {
  const normalized = normalizeUzbekPhone(value);
  return /^\+9989\d{9}$/.test(normalized);
};

export function SlotCard({ slot, onCall }: SlotCardProps) {
  const [phoneNumber, setPhoneNumber] = useState(slot.bookedBy?.phone ?? '');
  const [phoneError, setPhoneError] = useState('');
  const [showCallDialog, setShowCallDialog] = useState(false);

  const formattedPhone = useMemo(() => normalizeUzbekPhone(phoneNumber), [phoneNumber]);

  const handleQuickCall = () => {
    const safePhone = normalizeUzbekPhone(phoneNumber);

    if (!safePhone || !isValidUzbekPhone(safePhone)) {
      setPhoneError('Iltimos, +998 90 123 45 67 formatida to’g’ri telefon raqam kiriting.');
      return;
    }

    setPhoneError('');
    setPhoneNumber(safePhone);
    onCall?.(safePhone);

    if (typeof window === 'undefined') {
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    if (isMobile) {
      window.location.href = `tel:${safePhone}`;
      return;
    }

    setShowCallDialog(true);
    window.location.href = `tel:${safePhone}`;
  };

  const copyPhone = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(formattedPhone);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <PhoneCall className="h-4 w-4 text-emerald-400" />
        Tez aloqaga chiqish
      </div>

      <div className="mt-3">
        <label htmlFor={`slot-phone-${slot.id}`} className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
          Telefon raqam
        </label>
        <input
          id={`slot-phone-${slot.id}`}
          type="tel"
          value={phoneNumber}
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            setPhoneError('');
          }}
          placeholder="+998 90 123 45 67"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <button
        type="button"
        onClick={handleQuickCall}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 hover:shadow-emerald-700/30"
      >
        <PhoneCall className="h-4 w-4" />
        Raqam qo'shish va Qo'ng'iroq qilish
      </button>

      {phoneError ? <p className="mt-2 text-xs text-rose-300">{phoneError}</p> : null}

      {showCallDialog ? (
        <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-50">
          <div className="font-medium">Qo’ng’iroq tayyor: {formattedPhone}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPhone}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 px-2.5 py-2 text-xs text-slate-100 transition hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5" />
              Raqamni nusxalash
            </button>
            <a
              href={`https://t.me/${formattedPhone.replace(/^\+/, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-sky-400/30 bg-sky-500/10 px-2.5 py-2 text-xs text-sky-100 transition hover:bg-sky-500/20"
            >
              <MessageCircleMore className="h-3.5 w-3.5" />
              Telegram
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
