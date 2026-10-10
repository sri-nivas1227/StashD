"use client";
import {
  logoutAction,
  postChangePasswordSendOTPAction,
  postResetPasswordAction,
} from "@/app/actions";
import { ROUTES } from "@/config/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const inputClass =
  "mt-1 block w-full rounded-md border outline-none p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
const labelClass = "block text-sm font-semibold text-zinc-300";

export default function EditPasswordForm({
  setIsEditing,
  setChangePassword,
}: {
  setIsEditing: (isEditing: boolean) => void;
  setChangePassword: (changePassword: boolean) => void;
}) {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postChangePasswordSendOTPAction();
      if (response.success) {
        toast.success("OTP sent! Check your email.");
        setOtpSent(true);
      } else {
        setError(response.message || "Could not send the OTP. Try again!");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
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
      const response = await postResetPasswordAction(form);
      if (response.success) {
        toast.success(response.message || "Password changed successfully!");
        setIsEditing(false);
        setChangePassword(false);
        await logoutAction();
        router.push(ROUTES.LOGIN);
        return;
      }
      if (response.data?.redirect) {
        // reset session expired; go back to the send OTP step
        setOtpSent(false);
      }
      setError(response.message || "Password change failed. Try again!");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setChangePassword(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-lg bg-zinc-700/50 p-6 shadow-md"
    >
      <h2 className="text-2xl font-bold text-zinc-200">Change Password</h2>
      {!otpSent ? (
        <p className="text-sm text-zinc-400">
          For your security, we will email a six digit code to your account
          email. Enter it along with your new password to continue.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Enter the six digit code we emailed you and choose a new password.
          </p>
          <div>
            <label htmlFor="otp" className={labelClass}>
              OTP
            </label>
            <input
              type="text"
              name="otp"
              id="otp"
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
            <label htmlFor="newPassword" className={labelClass}>
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              id="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="newPasswordConfirm" className={labelClass}>
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPasswordConfirm"
              id="newPasswordConfirm"
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
          <div className="text-sm text-zinc-400">
            Didn&apos;t receive the OTP?{" "}
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="text-indigo-300 hover:text-indigo-200"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          onClick={handleCancel}
        >
          Cancel
        </button>
        {!otpSent ? (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </form>
  );
}
