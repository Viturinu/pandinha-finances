import type { NextRequest } from "next/server";

export const obterOrigemPublica = (request: NextRequest) =>
  process.env.APP_URL?.trim() || request.nextUrl.origin;

export const montarUrlPublica = (request: NextRequest, caminho: string) =>
  new URL(caminho, obterOrigemPublica(request));
