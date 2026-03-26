import Card from "./Card";

const StatCard = ({ title, value, icon, accent = "text-brand-600", hint }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
      {icon ? <div className={`rounded-xl bg-slate-100 p-2 ${accent}`}>{icon}</div> : null}
    </div>
  </Card>
);

export default StatCard;
