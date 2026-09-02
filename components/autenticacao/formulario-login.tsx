"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { BotaoGoogle } from "@/components/autenticacao/botao-google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { enviarJson } from "@/lib/cliente-api";
import { esquemaLogin, type EntradaLogin } from "@/lib/esquemas";

type FormularioLoginProps = {
  googleHabilitado: boolean;
};

export function FormularioLogin({ googleHabilitado }: FormularioLoginProps) {
  const roteador = useRouter();
  const parametros = useSearchParams();
  const destino = parametros.get("redirecionar") ?? "/dashboard";
  const erroDeRetorno = parametros.get("erro");

  useEffect(() => {
    if (erroDeRetorno) {
      toast.error(erroDeRetorno);
    }
  }, [erroDeRetorno]);

  const formulario = useForm<EntradaLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: "", senha: "" },
  });

  const aoEnviar = async (entrada: EntradaLogin) => {
    try {
      await enviarJson("/api/auth/login", "POST", entrada);
      roteador.replace(destino);
      roteador.refresh();
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível entrar."
      );
    }
  };

  const { isSubmitting } = formulario.formState;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para acompanhar suas finanças.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formulario.handleSubmit(aoEnviar)}>
          <FieldGroup>
            <Controller
              name="email"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="senha"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="senha">Senha</FieldLabel>
                  <Input
                    {...field}
                    id="senha"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Entrar
            </Button>

            {googleHabilitado && (
              <>
                <FieldSeparator className="[&>span]:bg-card">ou</FieldSeparator>
                <BotaoGoogle rotulo="Entrar com Google" />
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link
                href="/cadastro"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
