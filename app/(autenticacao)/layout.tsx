import type { ReactNode } from "react";
import Image from "next/image";

export default function LayoutAutenticacao({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute -top-40 -left-32 size-[28rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-40 size-[28rem] rounded-full bg-chart-2/20 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/pandinha-logo.svg"
            alt="Pandinha finances"
            width={260}
            height={200}
            priority
            className="h-32 w-auto sm:h-40"
          />
          <p className="text-sm text-muted-foreground">
            Seu controle financeiro pessoal, do jeito simples.
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}
