const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          activeTab === tab.value ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tabs;
