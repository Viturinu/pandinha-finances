import { FormularioCadastro } from "@/components/autenticacao/formulario-cadastro";
import { googleEstaConfigurado } from "@/lib/google";

export const metadata = { title: "Criar conta | Pandinha Finances" };

export default function PaginaCadastro() {
  return <FormularioCadastro googleHabilitado={googleEstaConfigurado()} />;
}
