import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type CreditBalanceProps = {
  credits: number
}

export function CreditBalance({ credits }: CreditBalanceProps) {
  const isLow = credits <= 2

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        data-testid="credit-amount"
        className={cn(
          'text-3xl font-bold font-mono',
          isLow ? 'text-cabo-gold animate-pulse' : 'text-foreground'
        )}
      >
        {credits}
      </span>
      <span className="text-sm text-muted-foreground">credits</span>
      {isLow && (
        <Badge variant="destructive">Low credits</Badge>
      )}
    </div>
  )
}
