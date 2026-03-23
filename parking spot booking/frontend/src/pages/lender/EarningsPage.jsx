import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import TransactionTable from "../../components/wallet/TransactionTable";
import { useAuth } from "../../hooks/useAuth";
import { lenderService } from "../../services/lenderService";
import { walletService } from "../../services/walletService";
import { formatCurrency } from "../../utils/format";

const EarningsPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const load = async () => {
    if (!user) return;
    const [earningsRes, walletRes, txnsRes] = await Promise.all([
      lenderService.getEarningsSummary(user.user_id),
      walletService.getWalletByUser(),
      walletService.getTransactionsByUser(user.user_id, "all"),
    ]);
    setSummary(earningsRes);
    setWallet(walletRes);
    setTransactions(txnsRes);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleWithdraw = async (event) => {
    event.preventDefault();
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid withdrawal amount.");
      return;
    }

    try {
      setWithdrawing(true);
      await walletService.withdraw(amount);
      setWithdrawAmount("");
      toast.success("Withdrawal request completed.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Earnings" subtitle="Wallet-based earnings and lender withdrawals." />
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(summary?.totalRevenue || 0)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Completed Revenue</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatCurrency(summary?.completedRevenue || 0)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Pending Payout</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{formatCurrency(summary?.pendingPayout || 0)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Wallet Balance</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">{formatCurrency(wallet?.credit_balance || 0)}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Withdraw Earnings</h3>
        <p className="mt-1 text-sm text-slate-500">
          Booking earnings are credited to your wallet after driver checkout.
        </p>
        <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={handleWithdraw}>
          <input
            type="number"
            min={1}
            step="0.01"
            className="input-base sm:max-w-xs"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(event) => setWithdrawAmount(event.target.value)}
          />
          <Button type="submit" disabled={withdrawing}>
            {withdrawing ? "Processing..." : "Withdraw to Bank"}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Wallet Transactions</h3>
        <div className="mt-3">
          <TransactionTable transactions={transactions} />
        </div>
      </Card>
    </div>
  );
};

export default EarningsPage;
