"use client";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  Forward,
  Heart,
  ImageIcon,
  Lock,
  LockOpen,
  MapPin,
  MessageCircle,
  Microscope,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import type { EvidenceCategory, NewsCard } from "@/engine/types";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { EVIDENCE_CATEGORY_ICON, NEWS_CATEGORY_CLASS } from "@/lib/theme";

/**
 * Kartu Berita dengan animasi balik 3D sungguhan.
 *
 * DEPAN  = apa yang dilihat pemain sebelum vonis (postingan medsos + 2 gembok).
 * BELAKANG = kunci jawaban Commit & Flip: status asli, penjelasan ilmiah,
 *            dan tanda bahaya yang seharusnya mereka kenali.
 *
 * Kedua sisi ditumpuk di sel grid yang sama supaya tinggi kartu mengikuti
 * sisi terpanjang dan tidak "melompat" saat dibalik.
 */
export function NewsCardDisplay({
  card,
  locksOpened,
  revealed,
  sectorName,
}: {
  card: NewsCard;
  locksOpened: EvidenceCategory[];
  revealed: boolean;
  sectorName?: string;
}) {
  return (
    <div className="flip-scene">
      <motion.div
        className="grid"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.85, ease: [0.2, 0.9, 0.25, 1] }}
      >
        <div className="flip-face col-start-1 row-start-1" aria-hidden={revealed}>
          <NewsFront card={card} locksOpened={locksOpened} sectorName={sectorName} />
        </div>
        <div
          className="flip-face col-start-1 row-start-1"
          style={{ transform: "rotateY(180deg)" }}
          aria-hidden={!revealed}
        >
          <NewsBack card={card} />
        </div>
      </motion.div>
    </div>
  );
}

// ——— DEPAN ————————————————————————————————————————————————————————

function NewsFront({
  card,
  locksOpened,
  sectorName,
}: {
  card: NewsCard;
  locksOpened: EvidenceCategory[];
  sectorName?: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-zinc-300 bg-white shadow-lg">
      <header className="flex items-center gap-2 bg-ash px-3 py-1.5 text-white">
        <Newspaper className="h-4 w-4 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-widest">
          {id.news.incoming}
        </span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-black text-white",
            NEWS_CATEGORY_CLASS[card.category]
          )}
        >
          {id.news.category[card.category]}
        </span>
      </header>

      {/* Postingan medsos */}
      <div className="border-b border-zinc-200 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 text-sm">
            👤
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-black text-zinc-800">
              {id.news.postedBy}
            </span>
            <span className="block text-[10px] text-zinc-400">••••••</span>
          </span>
        </div>

        <h2 className="text-base font-black leading-tight text-zinc-900">{card.title}</h2>
        <p className="mt-1 whitespace-pre-line text-sm leading-snug text-zinc-700">
          {card.body}
        </p>

        <div className="mt-2 flex items-start gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-2">
          <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-wide text-zinc-400">
              {id.news.attached}
            </span>
            <span className="block text-xs italic leading-snug text-zinc-600">
              {card.attachedContent}
            </span>
          </span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-zinc-400" aria-hidden>
          <Heart className="h-3.5 w-3.5" />
          <MessageCircle className="h-3.5 w-3.5" />
          <Forward className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="space-y-2.5 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-lava">
          <MapPin className="h-4 w-4 shrink-0" />
          {id.news.targetSector}: {sectorName ?? card.targetSectorId}
        </p>

        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-500">
            {id.news.locks}
          </p>
          <div className="flex flex-wrap gap-2">
            {card.locks.map((lock, i) => (
              <LockBadge key={`${lock}-${i}`} lock={lock} open={locksOpened.includes(lock)} />
            ))}
          </div>
        </div>

        <p className="rounded-xl bg-amber-100 px-3 py-2 text-center text-xs font-bold text-amber-900">
          {id.news.statusHidden}
        </p>
      </div>
    </article>
  );
}

function LockBadge({ lock, open }: { lock: EvidenceCategory; open: boolean }) {
  return (
    <motion.span
      layout
      animate={open ? { scale: [1, 1.16, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      aria-label={`${lock} — ${open ? id.news.lockOpen : id.news.lockClosed}`}
      className={cn(
        "inline-flex min-h-11 flex-1 items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-left",
        open
          ? "border-emerald-600 bg-emerald-50"
          : "border-zinc-300 bg-zinc-50 border-dashed"
      )}
    >
      <motion.span
        animate={open ? { rotate: [0, -18, 0], y: [0, -3, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.5 }}
        className={open ? "text-emerald-600" : "text-zinc-400"}
      >
        {open ? <LockOpen className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </motion.span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-xs font-black",
            open ? "text-emerald-800" : "text-zinc-700"
          )}
        >
          {EVIDENCE_CATEGORY_ICON[lock]} {lock}
        </span>
        <span className="block text-[10px] leading-tight text-zinc-500">
          {open ? id.news.lockOpen : id.evidence.category[lock]}
        </span>
      </span>
    </motion.span>
  );
}

// ——— BELAKANG ————————————————————————————————————————————————————

function NewsBack({ card }: { card: NewsCard }) {
  const isHoax = card.truth === "hoax";
  return (
    <article
      className={cn(
        "h-full overflow-hidden rounded-2xl border-2 shadow-lg",
        isHoax ? "border-red-700 bg-red-50" : "border-emerald-700 bg-emerald-50"
      )}
    >
      <header
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-white",
          isHoax ? "bg-red-700" : "bg-emerald-700"
        )}
      >
        {isHoax ? (
          <AlertOctagon className="h-5 w-5 shrink-0" />
        ) : (
          <ShieldCheck className="h-5 w-5 shrink-0" />
        )}
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
          {id.news.truth}
        </span>
        <span className="ml-auto text-lg font-black tracking-tight">
          {isHoax ? id.news.truthHoax : id.news.truthFakta}
        </span>
      </header>

      <div className="space-y-3 p-3">
        <section>
          <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-500">
            <Microscope className="h-3.5 w-3.5" />
            {id.news.explanation}
          </h3>
          <p className="mt-1 text-sm leading-snug text-zinc-800">{card.explanation}</p>
        </section>

        <section className="rounded-xl border-2 border-amber-400 bg-amber-50 p-2.5">
          <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-amber-800">
            <AlertOctagon className="h-3.5 w-3.5" />
            {id.news.redFlags}
          </h3>
          <p className="mt-1 text-sm leading-snug text-amber-950">{card.redFlags}</p>
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg bg-white/70 p-2 text-[11px] leading-snug text-zinc-600">
            <span className="block font-black uppercase text-zinc-400">
              {id.news.ifValidated}
            </span>
            {describeEffect(card, "validated")}
          </p>
          <p className="rounded-lg bg-white/70 p-2 text-[11px] leading-snug text-zinc-600">
            <span className="block font-black uppercase text-zinc-400">
              {id.news.ifIgnored}
            </span>
            {describeEffect(card, "ignored")}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * NewsEffect adalah data mentah (angka + bendera), bukan kalimat. Diterjemahkan
 * jadi daftar frasa pendek supaya tidak ada teks mentah bocor ke layar.
 */
function describeEffect(card: NewsCard, which: "validated" | "ignored"): string {
  const e = which === "validated" ? card.ifValidated : card.ifIgnored;
  const parts: string[] = [];
  if (e.panic) parts.push(`${id.hud.panicMeter} +${e.panic}`);
  if (e.panicTargetSector) parts.push(id.newsEffect.panicTargetSector);
  if (e.calmTargetSector) parts.push(id.newsEffect.calmTargetSector);
  if (e.lockEvacuationSector) parts.push(id.newsEffect.lockEvacuationSector);
  if (e.apPenaltyFirstPlayer) parts.push(`${id.newsEffect.apPenalty} −${e.apPenaltyFirstPlayer}`);
  if (e.stepTowardReadyPost) parts.push(id.newsEffect.stepTowardReadyPost);
  if (e.removeCrisisToken) parts.push(id.newsEffect.removeCrisisToken);
  if (e.apBonus) parts.push(`${id.newsEffect.apBonus} +${e.apBonus}`);
  if (e.drawEvidence) parts.push(`${id.newsEffect.drawEvidence} +${e.drawEvidence}`);
  return parts.length ? parts.join(" · ") : id.newsEffect.none;
}
