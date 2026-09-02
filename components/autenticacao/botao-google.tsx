import Image from "next/image";

import { Button } from "@/components/ui/button";

type BotaoGoogleProps = {
  rotulo: string;
};

export function BotaoGoogle({ rotulo }: BotaoGoogleProps) {
  return (
    <Button variant="outline" className="w-full" asChild>
      <a href="/api/auth/google">
        <Image
          src="/google.svg"
          alt=""
          width={16}
          height={16}
          className="size-4"
        />
        {rotulo}
      </a>
    </Button>
  );
}
