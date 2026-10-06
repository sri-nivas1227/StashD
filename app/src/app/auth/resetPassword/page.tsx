"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getPasswordResetEmailAction,
  postForgotPasswordAction,
  postResetPasswordAction,
} from "@/app/actions";
import { ROUTES } from "@/config/constants";

const inputClass =
  "mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPasswordResetEmailAction().then((value) => {
      if (!value) {
        router.replace(ROUTES.FORGOT_PASSWORD);
        return;
      }
      setEmail(value);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = async () => {
    setError(null);
    if (!form.otp || !form.newPassword || !form.newPasswordConfirm) {
      setError("Please fill in all fields!");
      return;
    }
    if (form.newPassword !== form.newPasswordConfirm) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const result = await postResetPasswordAction(form);
      if (result.success) {
        toast.success(result.message);
        router.push(ROUTES.LOGIN);
        return;
      }
      if (result.data?.redirect) {
        toast.error(result.message);
        router.push(result.data.redirect);
        return;
      }
      setError(result.message || "Password reset failed. Try again!");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const result = await postForgotPasswordAction(email);
      if (result.success) {
        toast.success("OTP resent! Check your email.");
      } else {
        setError(result.message || "Could not resend the OTP.");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md text-left">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">Almost there</p>
          <h1 className="text-3xl font-semibold text-white">
            Reset your password
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Enter the six digit code we emailed
            {email ? ` to ${email}` : ""} and choose a new password.
          </p>
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleReset();
          }}
        >
          <div>
            <label className="text-sm text-zinc-300">OTP</label>
            <input
              type="text"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="Enter the OTP sent to your email"
              value={form.otp}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-300">New password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-300">
              Confirm new password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPasswordConfirm"
              placeholder="••••••••"
              value={form.newPasswordConfirm}
              onChange={handleChange}
              className={inputClass}
            />
            <p
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-end m-1 text-xs cursor-pointer select-none text-indigo-300"
            >
              Show Password
            </p>
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="mt-6 text-sm text-zinc-400">
          Didn&apos;t receive the OTP?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-indigo-300 hover:text-indigo-200"
          >
            Resend OTP
          </button>
          <div className="mt-2">
            <Link
              href={ROUTES.LOGIN}
              className="text-indigo-300 hover:text-indigo-200"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
