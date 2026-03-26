const variants = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-soft",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
