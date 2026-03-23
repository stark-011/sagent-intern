import { Card, CardContent, Stack, Typography } from "@mui/material";

const SummaryCard = ({ title, value, subtitle, icon, color = "primary.main" }) => (
  <Card sx={{ height: "100%", borderRadius: 3 }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        <Stack
          sx={{
            bgcolor: color,
            color: "#fff",
            borderRadius: "50%",
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default SummaryCard;
