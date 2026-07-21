import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { roles } from "@/data/roles";
import { en } from "@/lib/i18n/en";
import { roleEmoji } from "@/lib/roleEmoji";

export const metadata = { title: "How to Play — Ring of Fire Board Game" };

export default function HowToPlayPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 space-y-5 p-4 pb-12">
      <header className="flex items-center gap-2">
        <Link href="/" aria-label="Back" className="rounded-lg p-2 hover:bg-zinc-900/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <BookOpen className="h-6 w-6 text-lava" />
          {en.home.howToPlay}
        </h1>
      </header>

      <Section title="Your Mission">
        <p>
          You are the <strong>Guardian Wildlife (Satwa Penjaga)</strong> — animal heroes of the Ring
          of Fire. Nature is getting angry, and wild rumors spread even faster than the lava. As one
          team you must <strong>filter real news from hoaxes</strong> and{" "}
          <strong>escort villagers to the Safe Zones</strong>. Everyone wins together — or loses
          together!
        </p>
      </Section>

      <Section title="How to Win (and Lose)">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Win:</strong> evacuate <strong>8 of the 15 villagers</strong> to a Safe Zone
            before the Disaster Deck runs out.
          </li>
          <li>
            <strong>Lose — Panic:</strong> the Panic Meter reaches 5. Nobody trusts you anymore.
          </li>
          <li>
            <strong>Lose — Casualties:</strong> so many villagers are lost that the target can no
            longer be reached.
          </li>
          <li>
            <strong>Lose — Time Out:</strong> the last Disaster Card is drawn before you hit the
            target. The megathrust arrives…
          </li>
        </ul>
      </Section>

      <Section title="One Round = 4 Phases">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Incoming Crisis</strong> — a news card appears and a Crisis token drops on the
            map. Villagers there start panicking. Is the news real? Nobody knows yet!
          </li>
          <li>
            <strong>Filter Hoax vs. Fact</strong> — discuss as a team! Each news card has locks
            (WHAT / WHERE / WHY / WHO / HOW). Play <em>one matching Evidence Card</em> to open a lock
            and reveal the truth. The 3-star <strong>Official Confirmation</strong> card is a
            wildcard that opens any lock. Skipping (or having no matching evidence) means the rumor
            spreads: <strong>Panic +1</strong>.
          </li>
          <li>
            <strong>Rescue Action</strong> — each Guardian gets <strong>3 Action Points (AP)</strong>
            : Move (1 AP), Calm a panicked villager (2 AP), or Escort a calm villager to an adjacent
            tile (1 AP). Get them to a Safe Zone!
          </li>
          <li>
            <strong>The Ring of Fire&apos;s Wrath</strong> — draw a Disaster Card. Its effect twists
            the <em>next</em> round, and some disasters destroy a tile — villagers left there are
            lost. Then a new round begins.
          </li>
        </ol>
      </Section>

      <Section title="Evidence Cards Are Dual-Use!">
        <p>
          Every Evidence Card can be played <strong>two ways</strong> — use it to{" "}
          <strong>verify</strong> the news (open a lock), or <strong>discard</strong> it for a
          resource boost (+2 AP, a free calm, a card trade, and more). You can&apos;t do both, so
          choose wisely — that&apos;s the heart of the game.
        </p>
      </Section>

      <Section title="The Guardians">
        <ul className="space-y-2">
          {roles.map((r) => (
            <li key={r.id} className="flex gap-2">
              <span className="text-2xl">{roleEmoji[r.id]}</span>
              <span>
                <strong>
                  {r.name} — {r.nickname}.
                </strong>{" "}
                {r.ability}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Pass-and-Play Tips">
        <ul className="list-disc space-y-1 pl-5">
          <li>Play on one device — pass it around like a board game.</li>
          <li>
            In the verification phase, tap a player&apos;s tab to peek at <em>their</em> cards —
            only they should look!
          </li>
          <li>The 1-minute timer keeps the discussion spicy. Decide before it runs out!</li>
        </ul>
      </Section>

      <Section title="Glossary">
        <p className="text-sm">{en.glossary.bmkg}</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-zinc-200 bg-white p-4">
      <h2 className="mb-2 text-lg font-black text-lava">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}
