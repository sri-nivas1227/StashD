"use client";
import { postResendOTPAction, postVerifyOTPAuthAction } from "@/app/actions";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ROUTES } from "@/config/constants";
import { toast } from "sonner";
function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [form, setForm] = useState({ otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleVerifyOTP = async () => {
    setLoading(true);
    setError(null);
    if (form.otp === "") {
      setError("Please enter the OTP!");
      setLoading(false);
      return;
    }
    try {
      // call verify OTP API
      const response = await postVerifyOTPAuthAction(form.otp);
      if (response.success) {
        // OTP verified successfully, redirect to login page
        toast.success("OTP verified successfully! You are Logged In🎉.");
        router.push(ROUTES.HOME);
      } else {
        setError(response.message || "OTP Verification Failed :/ Try again!");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };
  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postResendOTPAction();
      if (response.success) {
        toast.success("OTP resent successfully! Check your email.");
      } else {
        // setError(response.message || "OTP Verification Failed :/ Try again!");
        if(response.data.hasOwnProperty("redirect")){
          toast.error(response.message || "OTP Verification Failed. Try again!", {
            description: "Redirecting to login page...",
          });
          router.push(response.data?.redirect);
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md text-left">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">One final step😗 </p>
          <h1 className="text-3xl font-semibold text-white">
            Verify your Email
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            We emailed you the six digit code to verify your email address.
          </p>
        </div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleVerifyOTP();
          }}
        >
          <div>
            {/* <label className="text-sm text-zinc-300">OTP</label> */}
            <input
              type="text"
              name="otp"
              placeholder="Enter the OTP sent to your email"
              value={form.otp}
              onChange={handleChange}
              pattern="$[0-9](6)^"
              required
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
            {loading ? "Verifying OTP..." : "Verify OTP"}
          </button>
        </form>
        <div className="mt-6 text-sm text-zinc-400">
          Didn't receive the OTP?{" "}
          <button
            onClick={handleResendOTP}
            className="text-indigo-300 hover:text-indigo-200"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
