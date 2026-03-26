import DataTable from "../common/DataTable";
import Badge from "../common/Badge";
import { formatCurrency, formatDateTime } from "../../utils/format";

const TransactionTable = ({ transactions = [] }) => {
  const rows = transactions.map((item) => ({
    id: item.wallet_txn_id,
    ...item,
  }));

  const columns = [
    {
      key: "created_at",
      header: "Date",
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "txn_type",
      header: "Type",
      render: (row) => <Badge status={row.txn_type} />,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: "reference_id",
      header: "Reference",
    },
  ];

  return <DataTable columns={columns} rows={rows} emptyTitle="No wallet transactions yet." />;
};

export default TransactionTable;
