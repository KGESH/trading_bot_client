import { CardContent } from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';

type Props = {
  balance: string;
  balanceDescription: string;
  unrealizedProfit: string | null;
  totalBalance: string;
  className?: string;
};

export default function WalletCardContent({
  balance,
  balanceDescription,
  totalBalance,
  unrealizedProfit,
  className,
}: Props) {
  return (
    <div className={className}>
      <CardContent className="flex flex-col justify-center space-y-2 p-6">
        {/*총 잔고*/}
        <div className="flex flex-col">
          <div className="text-3xl font-bold">총 잔고</div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{totalBalance}</div>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex flex-col space-y-2 p-6">
        {/*보유 잔고 e.g. (KRW, USDT)*/}
        <div className="font-bold">{balance}</div>
        <div className="font-semibold">{balanceDescription}</div>
        {/*미실현 이익*/}
        {unrealizedProfit && (
          <div className="flex flex-col">
            <div className="font-bold">미실현 이익</div>
            <div className="font-semibold">{unrealizedProfit}</div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
