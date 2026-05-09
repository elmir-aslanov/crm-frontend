import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { useLogin } from "@/api/resources";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { IconCloud } from "@/components/magicui/icon-cloud";
import { Confetti, type ConfettiRef } from "@/registry/magicui/confetti";

const CLOUD_IMAGES = [
  "typescript", "javascript", "react", "html5", "css3",
  "nodedotjs", "express", "mongodb", "postgresql", "firebase",
  "nginx", "vercel", "docker", "git", "github",
  "gitlab", "visualstudiocode", "figma", "tailwindcss", "vite",
  "prisma", "nextdotjs", "jest",
].map((slug) => `https://cdn.simpleicons.org/${slug}/${slug}`);

export default function LoginPage() {
  const navigate     = useNavigate();
  const login        = useLogin();
  const confettiRef  = useRef<ConfettiRef>(null);

  const [email,      setEmail]      = React.useState("");
  const [password,   setPassword]   = React.useState("");
  const [showPwd,    setShowPwd]    = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      toast({
        title: "Login xətası",
        description: "Email və şifrə boş ola bilməz.",
        variant: "destructive",
      });
      return;
    }
    try {
      await login.mutateAsync({ email: normalizedEmail, password });

      toast({ title: "Uğurlu giriş", description: "Sistemə daxil oldunuz." });

      // Fire confetti on success, then navigate after a short delay so the
      // user can see the animation before the page changes.
      confettiRef.current?.fire({});
      await new Promise((res) => setTimeout(res, 800));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log(err);
      const msg =
        err instanceof ApiError ? err.message : "Email və ya şifrə yanlışdır.";
      toast({ title: "Login xətası", description: msg, variant: "destructive" });
    }
  };

  return (
    <>
      {/* Confetti canvas — fixed, full-screen, pointer-events-none */}
      <Confetti
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-[9999] size-full"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
        <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl">

          {/* ── Left: login form ───────────────────────────────── */}
          <div className="w-full lg:w-1/2 px-8 sm:px-12 py-12 flex flex-col justify-center">

            {/* Brand */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="text-white font-semibold text-lg tracking-tight">
                  Kometa CRM
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">Xoş gəldiniz 👋</h1>
              <p className="text-slate-400 text-sm mt-1">
                Sistemə daxil olmaq üçün məlumatlarınızı daxil edin.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Şifrə
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? "Şifrəni gizlət" : "Şifrəni göstər"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-xs text-slate-400">Məni xatırla</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  onClick={() =>
                    toast({
                      title: "Şifrəni unutdum",
                      description: "Bu funksiya tezliklə əlavə ediləcək.",
                    })
                  }
                >
                  Şifrəni unutdum?
                </button>
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-lg hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {login.isPending ? "Giriş edilir..." : "Daxil ol"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-600">
              Kometa CRM &mdash; daxili idarəetmə sistemi
            </p>
          </div>

          {/* ── Right: icon cloud panel (desktop only) ─────────── */}
          <div className="hidden lg:flex w-1/2 items-center justify-center p-8">
            <div className="flex h-[380px] w-[380px] items-center justify-center rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <IconCloud images={CLOUD_IMAGES} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
