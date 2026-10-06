"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { postLoginAction } from "../../actions";
import { ROUTES } from "@/config/constants";
import { toast } from "sonner";
function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {
    // Handle login logic here
    setLoading(true);
    if (email === "" || password === "") {
      setError("Please fill in all fields!");
      setLoading(false);
      return;
    }
    const result = await postLoginAction({ email, password });
    if (result.success) {
      // Redirect or update UI
      setLoading(false);
      const redirect = searchParams.get("redirect");
      router.push(redirect ?? ROUTES.HOME);
    } else {
      if (result.data?.redirect) {
        toast.error(result.message || "Login failed. Please try again.");
        router.push(result.data.redirect);
        return;
      }
      toast.error(result.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };
  const handleLoginWithOTP = async () => {
    setLoading(true);
    if (email === "") {
      setError("Please fill in email address!");
      setLoading(false);
      return;
    }
    const result = await postLoginAction({ email, password, otp: true });
    if (result.success) {
      // Redirect or update UI
      setLoading(false);
      toast.success(
        result.message || "OTP sent to your email. Please check and login.",
      );
      const redirect = searchParams.get("redirect");
      router.push(result.data.redirect ?? redirect ?? ROUTES.HOME);
    } else {
      if (result.data?.redirect) {
        toast.error(result.message || "Login failed. Please try again.");
        router.push(result.data.redirect);
        return;
      }
      toast.error(result.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md text-left">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white">
            Sign in to StashD
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Access your saved links, categories, and collections in one place.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleLogin();
          }}
        >
          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-300">Password</label>
              <span
                onClick={handleLoginWithOTP}
                className="text-xs text-indigo-300 underline cursor-pointer"
              >
                Login with OTP instead.
              </span>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
            <div className="flex items-center justify-between m-1">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-indigo-300 hover:text-indigo-200"
              >
                Forgot password?
              </Link>
              <p
                onClick={() => {
                  setShowPassword((prev) => !prev);
                }}
                className="text-xs cursor-pointer select-none text-indigo-300"
              >
                Show Password
              </p>
            </div>
          </div>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.SIGNUP}
            className="text-indigo-300 hover:text-indigo-200"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
