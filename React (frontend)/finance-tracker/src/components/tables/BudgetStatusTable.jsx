import DeleteIcon from "@mui/icons-material/Delete";
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import EmptyState from "../EmptyState";

const formatAmount = (value) => `$${Number(value).toFixed(2)}`;

const BudgetStatusTable = ({ rows, onRemoveBudget }) => {
  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title="No budget limits"
        description="Set a monthly budget per category to monitor overspending."
      />
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Spent</TableCell>
            <TableCell>Budget</TableCell>
            <TableCell>Remaining</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const isOver = row.remaining < 0;

            return (
              <TableRow key={row.category}>
                <TableCell>{row.category}</TableCell>
                <TableCell>{formatAmount(row.spent)}</TableCell>
                <TableCell>{formatAmount(row.limit)}</TableCell>
                <TableCell sx={{ color: isOver ? "error.main" : "text.primary", fontWeight: 600 }}>
                  {formatAmount(row.remaining)}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={isOver ? "error" : "success"}
                    label={isOver ? "Exceeded" : "Within Budget"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Remove budget">
                    <IconButton color="error" onClick={() => onRemoveBudget(row.category)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BudgetStatusTable;
