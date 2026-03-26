import { getStatusClass, toTitleCase } from "../../utils/status";

const Badge = ({ status, label, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
      status || label
    )} ${className}`}
  >
    {toTitleCase(label || status || "unknown")}
  </span>
);

export default Badge;
