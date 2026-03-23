const Loader = ({ text = "Loading..." }) => (
  <div className="flex min-h-[180px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-xl bg-white/80 px-5 py-3 shadow-soft">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <span className="text-sm font-medium text-slate-700">{text}</span>
    </div>
  </div>
);

export default Loader;
