import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import dayjs from "dayjs";
import EmptyState from "./EmptyState";
import { parseBloodPressure, sortByDateAsc } from "../../utils/formatters";

const HealthTrendChart = ({ logs }) => {
  const chartData = useMemo(() => {
    const orderedLogs = sortByDateAsc(logs || [], "recordedAt");

    return orderedLogs.map((log) => {
      const bp = parseBloodPressure(log.bloodPressure);
      const recordedAt = dayjs(log.recordedAt);

      return {
        id: log.id,
        label: recordedAt.isValid() ? recordedAt.format("DD MMM") : "-",
        heartRate: Number(log.heartRate) || 0,
        oxygenLevel: Number(log.oxygenLevel) || 0,
        temperature: Number(log.temperature) || 0,
        systolic: bp.systolic,
        diastolic: bp.diastolic
      };
    });
  }, [logs]);

  if (!chartData.length) {
    return <EmptyState message="No health logs to visualize yet." />;
  }

  return (
    <Box sx={{ width: "100%", height: 340 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Health Trends (Heart Rate, Oxygen, Blood Pressure, Temperature)
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#d0d7e7" />
          <XAxis dataKey="label" />
          <YAxis yAxisId="vitals" />
          <YAxis yAxisId="temp" orientation="right" domain={[34, 42]} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="vitals"
            type="monotone"
            dataKey="heartRate"
            stroke="#136f63"
            strokeWidth={2}
            dot={false}
            name="Heart Rate"
          />
          <Line
            yAxisId="vitals"
            type="monotone"
            dataKey="oxygenLevel"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
            name="Oxygen Level"
          />
          <Line
            yAxisId="vitals"
            type="monotone"
            dataKey="systolic"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="BP Systolic"
          />
          <Line
            yAxisId="vitals"
            type="monotone"
            dataKey="diastolic"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            name="BP Diastolic"
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            name="Temperature"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HealthTrendChart;
