import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="tabular text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="display-2">Página não encontrada</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        O endereço acessado não existe ou a candidatura não está entre as
        registradas nesta eleição.
      </p>
      <Link
        href="/"
        className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        Voltar ao comparador
      </Link>
    </div>
  );
}
