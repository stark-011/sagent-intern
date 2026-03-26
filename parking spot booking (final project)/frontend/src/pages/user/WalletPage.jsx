import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import TransactionTable from "../../components/wallet/TransactionTable";
import { useAuth } from "../../hooks/useAuth";
import { walletService } from "../../services/walletService";
import { formatCurrency } from "../../utils/format";

const WalletPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [amount, setAmount] = useState("");

  const load = async () => {
    const [walletRes, txnRes] = await Promise.all([
      walletService.getWalletByUser(user.user_id),
      walletService.getTransactionsByUser(user.user_id, filter),
    ]);
    setWallet(walletRes);
    setTransactions(txnRes);
  };

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, filter]);

  const summary = useMemo(() => {
    const credits = transactions
      .filter((item) => item.txn_type === "credit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const debits = transactions
      .filter((item) => item.txn_type === "debit")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { credits, debits };
  }, [transactions]);

  const handleAddCredits = async (e) => {
    e.preventDefault();
    try {
      await walletService.addCredits(user.user_id, Number(amount));
      toast.success("Credits added to wallet.");
      setAmount("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Wallet" subtitle="Manage credits and monitor payment history." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Balance</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(wallet?.credit_balance || 0)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Total Credits</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(summary.credits)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Total Debits</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{formatCurrency(summary.debits)}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-lg font-semibold text-slate-900">Add Credits</h3>
        <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={handleAddCredits}>
          <input
            type="number"
            min={100}
            className="input-base sm:max-w-xs"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button type="submit">Add to Wallet</Button>
        </form>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-slate-900">Transaction History</h3>
          <Tabs
            tabs={[
              { label: "All", value: "all" },
              { label: "Credit", value: "credit" },
              { label: "Debit", value: "debit" },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
        <TransactionTable transactions={transactions} />
      </Card>
    </div>
  );
};

export default WalletPage;
