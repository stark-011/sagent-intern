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

const IncomeTable = ({ incomes, onDelete }) => {
  if (!incomes || incomes.length === 0) {
    return <EmptyState title="No incomes" description="Add an income source to start tracking cash inflow." />;
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomes.map((income) => (
            <TableRow key={income.id || `${income.source}-${income.date}-${income.amount}`}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {income.source}
                </Typography>
              </TableCell>
              <TableCell>{formatAmount(income.amount)}</TableCell>
              <TableCell>{income.date}</TableCell>
              <TableCell>{income.description || "-"}</TableCell>
              <TableCell align="right">
                <Tooltip title="Delete income">
                  <IconButton color="error" onClick={() => onDelete(income.id)} disabled={!income.id}>
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

export default IncomeTable;
