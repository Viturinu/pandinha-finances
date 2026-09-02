import type { ReactNode } from "react";

import { NavegacaoLateral } from "@/components/painel/navegacao-lateral";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { buscarUsuarioPorId } from "@/data/usuario";
import { exigirSessaoNaPagina } from "@/lib/autenticacao";

export default async function LayoutPainel({
  children,
}: {
  children: ReactNode;
}) {
  const sessao = await exigirSessaoNaPagina();
  const usuario = await buscarUsuarioPorId(sessao.usuarioId);

  return (
    <SidebarProvider>
      <NavegacaoLateral
        nome={usuario?.nome ?? null}
        email={usuario?.email ?? sessao.email}
        imagemUrl={usuario?.imagemUrl ?? null}
      />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  );
}
