import { Suspense } from "react";

import { FormularioLogin } from "@/components/autenticacao/formulario-login";
import { Skeleton } from "@/components/ui/skeleton";
import { googleEstaConfigurado } from "@/lib/google";

export const dynamic = "force-dynamic";

export const metadata = { title: "Entrar | Pandinha Finances" };

export default function PaginaLogin() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <FormularioLogin googleHabilitado={googleEstaConfigurado()} />
    </Suspense>
  );
}
