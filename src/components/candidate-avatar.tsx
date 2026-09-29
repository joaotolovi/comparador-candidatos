// Avatar de candidato — nunca círculo (evita o ar de rede social/campanha):
// retângulo de ficha técnica com as iniciais. Foto entra via next/image
// quando existir; iniciais são o estado transitório seguro.
export function CandidateAvatar({
  name,
  slot,
  size = "md",
  photo,
}: {
  name: string;
  slot: "a" | "b" | "c";
  size?: "sm" | "md" | "lg";
  photo?: string;
}) {
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
      className={`flex shrink-0 items-center justify-center rounded-md font-semibold text-foreground bg-muted border ${dims}`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className="size-full rounded-md object-cover"
        />
      ) : (
        <span className={`slot-${slot}`}>{initials}</span>
      )}
    </div>
  );
}
