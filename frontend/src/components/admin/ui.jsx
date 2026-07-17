export function PageHeader({ title, subtitle, actions, testid }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8" data-testid={testid || "page-header"}>
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-[#FF5A1F] font-bold mb-2">{subtitle}</div>
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "ripple relative overflow-hidden inline-flex items-center gap-2 font-bold uppercase text-xs tracking-widest px-5 py-2.5 transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-[#FF5A1F] hover:bg-[#FF8A00] text-white",
    outline: "border border-[#2A2A2A] hover:border-[#FF5A1F] hover:text-[#FF5A1F] text-white",
    danger: "border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white",
    ghost: "text-[#CFCFCF] hover:text-white",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = "" }) {
  return <div className={`bg-[#171717] border border-[#2A2A2A] p-6 ${className}`}>{children}</div>;
}

export function Input({ label, className = "", ...props }) {
  return (
    <div>
      {label && <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>}
      <input className={`bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2.5 px-3 w-full transition-colors text-white text-sm ${className}`} {...props} />
    </div>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <div>
      {label && <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>}
      <textarea className={`bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2.5 px-3 w-full transition-colors text-white text-sm resize-none ${className}`} {...props} />
    </div>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <div>
      {label && <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">{label}</label>}
      <select className={`bg-[#0B0B0B] border border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-2.5 px-3 w-full transition-colors text-white text-sm ${className}`} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Switch({ checked, onChange, label, testid }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer" data-testid={testid}>
      <span className={`relative inline-block w-10 h-5 transition-colors ${checked ? "bg-[#FF5A1F]" : "bg-[#2A2A2A]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-[#2A2A2A] text-white",
    primary: "bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40",
    success: "bg-[#3DDC84]/20 text-[#3DDC84] border border-[#3DDC84]/40",
    danger: "bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40",
    info: "bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/40",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold ${variants[variant]}`}>{children}</span>;
}
