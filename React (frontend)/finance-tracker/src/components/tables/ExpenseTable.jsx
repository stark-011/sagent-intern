import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EmptyState from "../EmptyState";

const formatAmount = (value) => `$${Number(value).toFixed(2)}`;

const ExpenseTable = ({ expenses, onDelete }) => {
  if (!expenses || expenses.length === 0) {
    return <EmptyState title="No expenses" description="Log spending entries to track where your money goes." />;
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id || `${expense.category}-${expense.date}-${expense.amount}`}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {expense.category}
                </Typography>
              </TableCell>
              <TableCell>{formatAmount(expense.amount)}</TableCell>
              <TableCell>{expense.date}</TableCell>
              <TableCell>{expense.description || "-"}</TableCell>
              <TableCell align="right">
                <Tooltip title="Delete expense">
                  <IconButton color="error" onClick={() => onDelete(expense.id)} disabled={!expense.id}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExpenseTable;
