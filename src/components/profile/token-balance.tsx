import { Coins } from "lucide-react";

interface TokenBalanceProps {
  value: number;
}

export function TokenBalance({ value }: TokenBalanceProps) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
      <Coins className="size-4" />
      {value} Tokens
    </div>
  );
}
