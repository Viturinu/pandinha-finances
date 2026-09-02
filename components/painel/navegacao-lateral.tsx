"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { enviarJson } from "@/lib/cliente-api";

const ITENS_DE_NAVEGACAO = [
  { titulo: "Dashboard", href: "/dashboard", icone: LayoutDashboard },
  { titulo: "Lançamentos", href: "/lancamentos", icone: Receipt },
  { titulo: "Categorias", href: "/categorias", icone: Tags },
  { titulo: "Formas de pagamento", href: "/formas-pagamento", icone: CreditCard },
] as const;

type NavegacaoLateralProps = {
  nome: string | null;
  email: string;
  imagemUrl: string | null;
};

export function NavegacaoLateral({
  nome,
  email,
  imagemUrl,
}: NavegacaoLateralProps) {
  const caminhoAtual = usePathname();
  const roteador = useRouter();

  const sair = async () => {
    try {
      await enviarJson("/api/auth/logout", "POST");
      roteador.replace("/login");
      roteador.refresh();
    } catch {
      toast.error("Não foi possível encerrar a sessão.");
    }
  };

  const iniciais = (nome ?? email).slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src="/pandinha-simbolo.svg"
                  alt="Pandinha finances"
                  width={32}
                  height={32}
                  className="size-8 shrink-0"
                />
                <span className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Pandinha</span>
                  <span className="text-xs tracking-widest text-muted-foreground">
                    FINANCES
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITENS_DE_NAVEGACAO.map(({ titulo, href, icone: Icone }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={titulo}
                    isActive={caminhoAtual === href}
                  >
                    <Link href={href}>
                      <Icone />
                      <span>{titulo}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default">
              <Avatar className="size-8 rounded-lg">
                {imagemUrl ? (
                  <Image
                    src={imagemUrl}
                    alt={nome ?? email}
                    width={32}
                    height={32}
                    className="size-8 rounded-lg object-cover"
                  />
                ) : (
                  <AvatarFallback className="rounded-lg bg-primary/15 text-primary">
                    {iniciais}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="flex min-w-0 flex-col gap-0.5 leading-none">
                <span className="truncate font-medium">{nome ?? "Usuário"}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={sair} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
