import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type CabecalhoPaginaProps = {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
};

export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
}: CabecalhoPaginaProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="mr-1 h-6" />
        <div className="min-w-0 space-y-0.5">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {titulo}
          </h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {descricao}
          </p>
        </div>
      </div>

      {acao ? (
        <div className="flex flex-wrap items-center gap-2">{acao}</div>
      ) : null}
    </header>
  );
}
