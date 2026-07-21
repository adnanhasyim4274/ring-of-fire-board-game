"use client";
import { Eye } from "lucide-react";
import type { GameState } from "@/engine/types";
import { eventCardById } from "@/data/eventCards";
import { disasterCardById } from "@/data/disasterCards";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DisasterCardReveal } from "@/components/cards/DisasterCardReveal";
import { EventCardDisplay } from "@/components/cards/EventCardDisplay";
import { en } from "@/lib/i18n/en";

export function PeekModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const peek = state.peek;
  return (
    <Modal open={!!peek} onClose={onClose}>
      {peek && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-black">
            <Eye className="h-5 w-5" />
            {en.peek.title}
          </h3>
          <p className="text-sm text-zinc-600">
            {peek.kind === "disaster" ? en.peek.disaster : en.peek.event}:
          </p>
          {peek.kind === "disaster" ? (
            <DisasterCardReveal card={disasterCardById[peek.cardId]} />
          ) : (
            <EventCardDisplay card={eventCardById[peek.cardId]} locksOpened={[]} outcome="pending" />
          )}
          <Button className="w-full" onClick={onClose}>
            {en.peek.close}
          </Button>
        </div>
      )}
    </Modal>
  );
}
