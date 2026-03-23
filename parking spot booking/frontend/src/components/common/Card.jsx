const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}>
    {children}
  </div>
);

export default Card;
