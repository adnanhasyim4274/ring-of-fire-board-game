"use client";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { en as id } from "@/lib/i18n/en";

/** Dialog konfirmasi untuk aksi yang tidak bisa dibatalkan. */
export function ConfirmDialog({
  open,
  title,
  body,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-black text-lava">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {title}
        </h3>
        <p className="text-sm leading-snug text-zinc-700">{body}</p>
        {children}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse">
          <Button className="flex-1" onClick={onConfirm}>
            {confirmLabel ?? id.common.confirm}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelLabel ?? id.common.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
