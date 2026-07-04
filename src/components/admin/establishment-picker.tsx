"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDown, X } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EstablishmentIcon } from "@/components/listings/establishment-icon";
import {
  SCHOOL_ESTABLISHMENTS,
  BRAND_ESTABLISHMENTS,
  getEstablishment,
} from "@/features/listings/establishments";

type EstablishmentPickerProps = {
  defaultEstablishmentId?: string | null;
  defaultEstablishmentName?: string;
};

export function EstablishmentPicker({
  defaultEstablishmentId,
  defaultEstablishmentName,
}: EstablishmentPickerProps) {
  const [establishmentId, setEstablishmentId] = useState(defaultEstablishmentId ?? "");
  const [establishmentName, setEstablishmentName] = useState(defaultEstablishmentName ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = getEstablishment(establishmentId);

  function handleSelect(id: string, name: string) {
    setEstablishmentId(id);
    if (!establishmentName) setEstablishmentName(name);
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="establishment_id" value={establishmentId} />

      <div className="space-y-2" ref={containerRef}>
        <Label>Establishment logo (optional)</Label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-lg border border-input px-3 py-2 text-sm transition hover:border-ring"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <EstablishmentIcon id={selected.id} className="size-5 rounded" />
              {selected.name}
            </span>
          ) : (
            <span className="text-muted-foreground">No logo — pick one if it matches</span>
          )}
          <span className="flex items-center gap-1">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setEstablishmentId("");
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear establishment logo"
              >
                <X className="size-3.5" />
              </span>
            )}
            <CaretDown className="size-4 text-muted-foreground" />
          </span>
        </button>

        {open && (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-popover p-2 shadow-md">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Schools</p>
            <div className="grid grid-cols-3 gap-1 pb-2">
              {SCHOOL_ESTABLISHMENTS.map((est) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => handleSelect(est.id, est.name)}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 text-center text-xs transition hover:bg-accent"
                >
                  <EstablishmentIcon id={est.id} className="size-8 rounded" />
                  <span className="line-clamp-2">{est.name}</span>
                </button>
              ))}
            </div>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Brands</p>
            <div className="grid grid-cols-3 gap-1">
              {BRAND_ESTABLISHMENTS.map((est) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => handleSelect(est.id, est.name)}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 text-center text-xs transition hover:bg-accent"
                >
                  <EstablishmentIcon id={est.id} className="size-8 rounded" />
                  <span className="line-clamp-2">{est.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="establishment_name">Establishment name</Label>
        <Input
          id="establishment_name"
          name="establishment_name"
          value={establishmentName}
          onChange={(e) => setEstablishmentName(e.target.value)}
          placeholder="e.g. Carleton Women in Engineering"
          required
        />
      </div>
    </div>
  );
}
