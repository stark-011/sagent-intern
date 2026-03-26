export const statusClassMap = {
  active: "bg-emerald-100 text-emerald-700",
  upcoming: "bg-sky-100 text-sky-700",
  overstay: "bg-amber-100 text-amber-800",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  paid: "bg-emerald-100 text-emerald-700",
  reserved: "bg-indigo-100 text-indigo-700",
  inactive: "bg-slate-100 text-slate-600",
  blocked: "bg-rose-100 text-rose-700",
  credit: "bg-emerald-100 text-emerald-700",
  debit: "bg-rose-100 text-rose-700",
};

export const getStatusClass = (status = "") =>
  statusClassMap[status.toLowerCase()] || "bg-slate-100 text-slate-700";

export const toTitleCase = (value = "") =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
