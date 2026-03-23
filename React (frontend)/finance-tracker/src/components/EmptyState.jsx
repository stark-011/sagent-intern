import InboxIcon from "@mui/icons-material/Inbox";
import { Paper, Stack, Typography } from "@mui/material";

const EmptyState = ({ title = "No records yet", description = "Add your first entry to get started." }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      borderStyle: "dashed",
      borderColor: "divider",
      borderWidth: 1,
      borderRadius: 2,
      bgcolor: "background.paper",
    }}
  >
    <Stack spacing={1} alignItems="center" textAlign="center">
      <InboxIcon color="disabled" />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  </Paper>
);

export default EmptyState;
