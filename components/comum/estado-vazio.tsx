import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EstadoVazioProps = {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
};

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icone className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{titulo}</p>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>
      {acao}
    </div>
  );
}
