"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { enviarJson } from "@/lib/cliente-api";
import { esquemaCadastro, type EntradaCadastro } from "@/lib/esquemas";

type FormularioCadastroProps = {
  googleHabilitado: boolean;
};

export function FormularioCadastro({
  googleHabilitado,
}: FormularioCadastroProps) {
  const roteador = useRouter();

  const formulario = useForm<EntradaCadastro>({
    resolver: zodResolver(esquemaCadastro),
    defaultValues: { nome: "", email: "", senha: "" },
  });

  const aoEnviar = async (entrada: EntradaCadastro) => {
    try {
      await enviarJson("/api/auth/cadastro", "POST", entrada);
      toast.success("Conta criada! Categorias padrão já foram adicionadas.");
      roteador.replace("/dashboard");
      roteador.refresh();
    } catch (erro) {
      toast.error(
        erro instanceof Error ? erro.message : "Não foi possível cadastrar."
      );
    }
  };

  const { isSubmitting } = formulario.formState;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Comece a organizar suas receitas e despesas em minutos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formulario.handleSubmit(aoEnviar)}>
          <FieldGroup>
            <Controller
              name="nome"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input
                    {...field}
                    id="nome"
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Use pelo menos 8 caracteres.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Criar conta
            </Button>

            {googleHabilitado && (
              <>
                <FieldSeparator className="[&>span]:bg-card">ou</FieldSeparator>
                <BotaoGoogle rotulo="Cadastrar com Google" />
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Entrar
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
