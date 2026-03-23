import { Card, CardContent, CardHeader } from "@mui/material";

const SectionCard = ({ title, subtitle, action, children, contentSx }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%"
      }}
      className="card-fade-in"
    >
      {(title || subtitle || action) && (
        <CardHeader title={title} subheader={subtitle} action={action} />
      )}
      <CardContent sx={contentSx}>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
