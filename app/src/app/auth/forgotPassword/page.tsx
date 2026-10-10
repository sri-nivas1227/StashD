"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { postForgotPasswordAction } from "@/app/actions";
import { ROUTES } from "@/config/constants";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (email.trim() === "") {
      setError("Please enter your email address!");
      return;
    }
    setLoading(true);
    try {
      const result = await postForgotPasswordAction(email.trim());
      if (result.success) {
        toast.success(result.message);
        router.push(ROUTES.RESET_PASSWORD);
        return;
      }
      setError(result.message || "Something went wrong. Please try again.");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md text-left">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">Locked out?</p>
          <h1 className="text-3xl font-semibold text-white">
            Forgot your password
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Enter your account email and we will send you a six digit code to
            reset your password.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleSubmit();
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
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
        <div className="mt-6 text-sm text-zinc-400">
          Remembered it?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-indigo-300 hover:text-indigo-200"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
