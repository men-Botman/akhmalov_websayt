import { useMemo, useState } from 'react';
import {
  BellRing,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';

import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { PitchCard } from './components/PitchCard';
import { pitchCatalog, trustUsers } from './data/mockData';
import type { BookingMode, Pitch, SlotRecord, UserTrust } from './types';

const currency = new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency: 'UZS',
  maximumFractionDigits: 0,
});

function App() {
  const [pitches, setPitches] = useState<Pitch[]>(pitchCatalog);
  const [users, setUsers] = useState<UserTrust[]>(trustUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPitchId, setSelectedPitchId] = useState<string>('pitch-1');
  const [activeTab, setActiveTab] = useState<'booking' | 'dashboard'>('booking');
  const [bookingSelection, setBookingSelection] = useState<{ pitchId: string; slot: SlotRecord } | null>(null);

  const currentUser = users[0] ?? { id: 'user-1', name: 'Siz', trustScore: 80, penalties: 0, prepaidOnly: false };

  const filteredPitches = useMemo(
    () =>
      pitches.filter((pitch) => {
        const term = searchTerm.toLowerCase();
        return (
          pitch.name.toLowerCase().includes(term) ||
          pitch.location.toLowerCase().includes(term) ||
          pitch.surface.toLowerCase().includes(term)
        );
      }),
    [pitches, searchTerm],
  );

  const dashboardStats = useMemo(() => {
    const booked = pitches.reduce(
      (sum, pitch) => sum + pitch.slots.filter((slot) => slot.status === 'booked').length,
      0,
    );
    const pending = pitches.reduce(
      (sum, pitch) => sum + pitch.slots.filter((slot) => slot.status === 'pending').length,
      0,
    );
    const waitlist = pitches.reduce(
      (sum, pitch) => sum + pitch.slots.filter((slot) => slot.status === 'waitlist').length,
      0,
    );
    const revenue = pitches.reduce(
      (sum, pitch) =>
        sum +
        pitch.slots.reduce((slotTotal, slot) => {
          if (slot.status === 'booked' || slot.status === 'pending') {
            return slotTotal + slot.price;
          }
          return slotTotal;
        }, 0),
      0,
    );

    return { booked, pending, waitlist, revenue };
  }, [pitches]);

  const handleSelectSlot = (pitchId: string, slot: SlotRecord) => {
    setSelectedPitchId(pitchId);
    setBookingSelection({ pitchId, slot });
  };

  const handleBookingSubmit = ({
    paymentMode,
    phoneVerified,
    amount,
    deposit,
    isWaitlist,
  }: {
    paymentMode: BookingMode;
    phoneVerified: boolean;
    amount: number;
    deposit: number;
    isWaitlist: boolean;
  }) => {
    if (!bookingSelection) {
      return;
    }

    const { pitchId, slot } = bookingSelection;

    setPitches((previous) =>
      previous.map((pitch) => {
        if (pitch.id !== pitchId) {
          return pitch;
        }

        return {
          ...pitch,
          slots: pitch.slots.map((item) => {
            if (item.id !== slot.id) {
              return item;
            }

            const nextStatus = isWaitlist ? 'waitlist' : paymentMode === 'reserve' ? 'pending' : 'booked';

            return {
              ...item,
              status: nextStatus,
              user: isWaitlist ? 'Navbat' : 'Siz',
              deposit: paymentMode === 'deposit' ? deposit : amount,
              waitlistCount: isWaitlist ? (item.waitlistCount ?? 0) + 1 : item.waitlistCount,
              note: isWaitlist
                ? 'Telegram foydalanuvchiga 5 daqiqada xabar yuboriladi.'
                : paymentMode === 'reserve'
                  ? 'Telefon tasdiqlanganidan keyin 30 daqiqada to’lov kerak.'
                  : 'To’lov tasdiqlandi. No-show xavfi pasaygan.',
            };
          }),
        };
      }),
    );

    if (paymentMode === 'reserve' && !phoneVerified) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === currentUser.id
            ? { ...user, trustScore: Math.max(0, user.trustScore - 8), penalties: user.penalties + 1 }
            : user,
        ),
      );
    }

    if (paymentMode === 'full' || paymentMode === 'deposit') {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                trustScore: Math.min(100, user.trustScore + 3),
                penalties: Math.max(0, user.penalties - 1),
              }
            : user,
        ),
      );
    }

    setBookingSelection(null);
  };

  const handleAdminAction = (pitchId: string, slotId: string, action: 'arrived' | 'no-show' | 'cancel') => {
    setPitches((previous) =>
      previous.map((pitch) => {
        if (pitch.id !== pitchId) {
          return pitch;
        }

        return {
          ...pitch,
          slots: pitch.slots.map((slot) => {
            if (slot.id !== slotId) {
              return slot;
            }

            const updatedStatus = action === 'arrived' || action === 'cancel' ? 'available' : 'available';

            return {
              ...slot,
              status: updatedStatus,
              user: action === 'arrived' ? slot.user : undefined,
              note:
                action === 'arrived'
                  ? 'Keldi'
                  : action === 'no-show'
                    ? 'No-show. Trust score pasaytirildi.'
                    : 'Bekor qilindi',
              waitlistCount: action === 'cancel' ? 0 : slot.waitlistCount,
            };
          }),
        };
      }),
    );

    if (action === 'no-show') {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                trustScore: Math.max(0, user.trustScore - 15),
                penalties: user.penalties + 1,
                prepaidOnly: user.trustScore - 15 < 60,
              }
            : user,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#061712] text-white">
      <header className="border-b border-emerald-500/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,#061712_0%,#071a14_45%,#061712_100%)]">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-slate-950">
                F
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-300">Football</div>
                <div className="font-semibold">Mini Pitch</div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <button type="button" className="transition hover:text-white">Maydonlar</button>
              <button type="button" className="transition hover:text-white">Navbat</button>
              <button type="button" className="transition hover:text-white">Dastur</button>
            </nav>

            <button type="button" className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15">
              Kiritish
            </button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Maydonni band qilish
              </div>

              <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-white md:text-5xl">
                Mini Football booking system with smart anti-no-show protection.
              </h1>

              <p className="mt-4 max-w-xl text-base text-slate-300 md:text-lg">
                Onlayn maydonlar, depozit to’lovlari, navbatga yozilish va ishonch reytingi bilan zamonaviy rezervatsiya nazorati.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200">
                  <span className="text-emerald-300">{dashboardStats.booked}</span> band
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200">
                  <span className="text-amber-300">{dashboardStats.pending}</span> kutilmoqda
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200">
                  <span className="text-orange-300">{dashboardStats.waitlist}</span> navbat
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-[0_20px_50px_rgba(5,15,11,0.7)] backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <CalendarDays className="h-4 w-4" />
                Filter / qidiruv
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Sana</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-white outline-none ring-0 transition focus:border-emerald-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Qidiruv</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Maydon yoki lokatsiya"
                      className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Maydon</span>
                  <select
                    value={selectedPitchId}
                    onChange={(event) => setSelectedPitchId(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
                  >
                    {pitches.map((pitch) => (
                      <option key={pitch.id} value={pitch.id}>
                        {pitch.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-200">Kutilmoqda</div>
                    <div className="mt-2 text-2xl font-bold text-white">{dashboardStats.pending}</div>
                  </div>
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-orange-200">Navbat</div>
                    <div className="mt-2 text-2xl font-bold text-white">{dashboardStats.waitlist}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {[
            { id: 'booking', label: 'Band qilish' },
            { id: 'dashboard', label: 'Admin panel' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'booking' | 'dashboard')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950' : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'booking' ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <WalletCards className="h-4 w-4 text-emerald-400" />
                  Umumiy daromad
                </div>
                <div className="mt-3 text-2xl font-bold text-white">{currency.format(dashboardStats.revenue)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock3 className="h-4 w-4 text-amber-400" />
                  Bugun chog’lanishi
                </div>
                <div className="mt-3 text-2xl font-bold text-white">{dashboardStats.pending + dashboardStats.booked}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Foydalanuvchi ishonchi
                </div>
                <div className="mt-3 text-2xl font-bold text-white">{currentUser.trustScore}</div>
              </div>
            </div>

            {filteredPitches.length > 0 ? (
              <div className="space-y-6">
                {filteredPitches.map((pitch) => (
                  <PitchCard key={pitch.id} pitch={pitch} onSelectSlot={handleSelectSlot} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center text-slate-300">
                Hech qaysi maydon topilmadi. Boshqa qidiruv so’zini kiriting.
              </div>
            )}
          </div>
        ) : (
          <AdminDashboard pitches={pitches} users={users} onAction={handleAdminAction} />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center justify-around rounded-full border border-white/10 bg-slate-950/85 p-2 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden">
        <button type="button" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950">
          <MapPin className="mx-auto mb-1 h-4 w-4" />
          Maydonlar
        </button>
        <button type="button" className="rounded-full px-4 py-2 text-sm text-slate-300">
          <BellRing className="mx-auto mb-1 h-4 w-4" />
          Navbat
        </button>
      </nav>

      {bookingSelection ? (
        <BookingModal
          slot={bookingSelection.slot}
          pitchName={pitches.find((pitch) => pitch.id === bookingSelection.pitchId)?.name ?? 'Maydon'}
          selectedDate={selectedDate}
          userTrustScore={currentUser.trustScore}
          onClose={() => setBookingSelection(null)}
          onSubmit={handleBookingSubmit}
        />
      ) : null}
    </div>
  );
}

export default App;
