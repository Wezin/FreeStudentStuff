import { getEstablishment, establishmentIconUrl } from "@/features/listings/establishments";
import { cn } from "@/lib/utils";

type EstablishmentIconProps = {
  id: string | null;
  className?: string;
};

/** Renders a school crest or brand logo for a curated establishment id. Renders nothing if id is unset/unknown. */
export function EstablishmentIcon({ id, className }: EstablishmentIconProps) {
  const establishment = getEstablishment(id);
  if (!establishment) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small dynamic/local icon, not worth next/image sizing overhead
    <img
      src={establishmentIconUrl(establishment.icon)}
      alt={establishment.name}
      className={cn("object-contain", className)}
    />
  );
}
