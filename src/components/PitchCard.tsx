import { CalendarRange, MapPin, Star } from 'lucide-react';

import type { Pitch, SlotRecord, SlotStatus } from '../types';

type PitchCardProps = {
  pitch: Pitch;
  onSelectSlot: (pitchId: string, slot: SlotRecord) => void;
};

const statusMap: Record<SlotStatus, { label: string; className: string }> = {
  available: { label: 'Bo\'sh', className: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30' },
  booked: { label: 'Band qilingan', className: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30' },
  pending: { label: 'Kutilmoqda', className: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30' },
  waitlist: { label: 'Navbat', className: 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30' },
};

export function PitchCard({ pitch, onSelectSlot }: PitchCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_10px_30px_rgba(10,18,17,0.5)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <CalendarRange className="h-4 w-4" />
            {pitch.name}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-white">{pitch.name}</h3>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-emerald-400" />
            {pitch.location}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {pitch.rating}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
          {pitch.surface}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{pitch.size}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
          {pitch.isIndoor ? 'Ichki maydon' : 'Tashqi maydon'}
        </span>
        <span className="ml-auto font-medium text-emerald-300">
          {new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(pitch.price)} / soat
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-400">{pitch.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {pitch.slots.map((slot) => {
          const tone = statusMap[slot.status];
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(pitch.id, slot)}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-left transition hover:border-emerald-400/40 hover:bg-slate-800/80"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{slot.time}</div>
              <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${tone.className}`}>
                {tone.label}
              </div>
              {slot.waitlistCount ? (
                <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                  {slot.waitlistCount} navbat
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
