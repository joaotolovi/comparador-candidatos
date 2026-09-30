"use client";

// Avatar de candidato — nunca círculo (evita o ar de rede social/campanha):
// retângulo de ficha técnica. Foto local entra por <img>; se falhar ao carregar
// (arquivo ausente/403), volta para as iniciais em vez de mostrar imagem quebrada.
// Crédito (autor + licença) vai no title do elemento.
import { useState } from "react";

export function CandidateAvatar({
  name,
  slot,
  size = "md",
  photo,
  credit,
}: {
  name: string;
  slot: "a" | "b" | "c";
  size?: "sm" | "md" | "lg";
  photo?: string;
  credit?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photo) && !failed;
  const initials = name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const dims = {
    sm: "size-8 text-xs",
    md: "size-12 text-sm",
    lg: "size-20 text-xl",
  }[size];
  return (
    <div
      aria-hidden
      title={showPhoto && credit ? `Foto: ${credit}` : undefined}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md font-semibold text-foreground bg-muted border ${dims}`}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={`Foto de ${name}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full rounded-md object-cover"
        />
      ) : (
        <span className={`slot-${slot}`}>{initials}</span>
      )}
    </div>
  );
}
