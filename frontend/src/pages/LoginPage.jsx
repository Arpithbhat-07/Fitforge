import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("admin@fitforge.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!loading && user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(email, password);
    if (res.success) navigate("/admin");
    else setError(res.error || "Login failed");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 relative overflow-hidden noise-overlay" data-testid="login-page">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF5A1F]/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#FF8A00]/15 blur-3xl" />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#171717] border border-[#2A2A2A] p-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00]" />
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 flex items-center justify-center bg-[#FF5A1F]">
            <Zap className="w-5 h-5 text-black" strokeWidth={3} />
          </div>
          <span className="font-display text-2xl tracking-wider">FIT<span className="text-[#FF5A1F]">FORGE</span></span>
        </div>
        <div className="font-display text-4xl uppercase mb-2">Admin Access</div>
        <p className="text-sm text-[#8A8A8A] mb-8">Restricted area. Authorized personnel only.</p>

        <div className="space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-3 w-full transition-colors" data-testid="login-email" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 block">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent border-b border-[#2A2A2A] focus:border-[#FF5A1F] outline-none py-3 w-full transition-colors" data-testid="login-password" />
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-[#FF3B30]" data-testid="login-error">{error}</p>}

        <button type="submit" disabled={submitting} className="ripple relative overflow-hidden mt-8 w-full bg-[#FF5A1F] hover:bg-[#FF8A00] disabled:opacity-60 text-white font-bold uppercase tracking-widest py-4 transition-colors flex items-center justify-center gap-2" data-testid="login-submit">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <p className="mt-6 text-center text-xs text-[#8A8A8A]">
          <a href="/" className="hover:text-[#FF5A1F] transition-colors">← Back to site</a>
        </p>
      </motion.form>
    </div>
  );
}
