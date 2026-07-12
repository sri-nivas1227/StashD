"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  postSignupAction,
  postVerifyUsernameAvailability,
} from "../../actions";
import { ROUTES } from "@/config/constants";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameMessage, setUsernameMessage] = useState({
    success: false,
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "name") {
      setNameError(
        value.trim() === "" || isFullNameValid(value)
          ? ""
          : "Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes.",
      );
    }
    if (name === "email") {
      setEmailError(
        value.trim() === "" || isEmailValid(value)
          ? ""
          : "Please enter a valid email address.",
      );
    }
    if (name === "password") {
      setPasswordError(
        value === "" || isPasswordStrong(value)
          ? ""
          : "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      );
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    if (
      form.email === "" ||
      form.name === "" ||
      form.username === "" ||
      form.password === ""
    ) {
      setError("Please fill all fields!");
      setLoading(false);
      return;
    }
    if (!isFullNameValid(form.name)) {
      setError(
        "Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes.",
      );
      setLoading(false);
      return;
    }
    if (!isEmailValid(form.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!isPasswordStrong(form.password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      );
      setLoading(false);
      return;
    }
    try {
      const response = await postSignupAction(form);
      if (response.success) {
        toast.success(
          "Welcome to StashD! Please verify your email to continue.",
        );
        router.push(ROUTES.VERIFY_EMAIL);
        return;
      } else {
        setError(response.message || "Signup Failed :/ Try again!");
      }
    } catch (err) {
      // todo: add a report issue button when error occurs to let users report the issue with pre-filled error details
      setError(
        `Network error: ${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    } finally {
      setLoading(false);
    }
  };
  // validate password strength
  const isPasswordStrong = (password: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=?.,;:-])[A-Za-z\d!@#$%^&*()_+=?.,;:-]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  // validate full name format
  const isFullNameValid = (name: string) => {
    const fullNameRegex = /^[a-zA-Z][a-zA-Z\s'-]{1,49}$/;
    return fullNameRegex.test(name.trim());
  };

  // validate email format
  const isEmailValid = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  // handle enter key press for form submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (form.username.trim() === "") {
        setUsernameMessage((prev) => ({
          ...prev,
          success: false,
          message: "",
        }));
        return;
      }
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(form.username.trim())) {
        setUsernameMessage((prev) => ({
          ...prev,
          success: false,
          message:
            "Username must start with a letter and can only contain letters, numbers, and underscores.",
        }));
      } else if (form.username.length < 3 || form.username.length > 20) {
        setUsernameMessage((prev) => ({
          ...prev,
          success: false,
          message: "Username must be between 3 and 20 characters long.",
        }));
      } else {
        const usernameAvailable = await postVerifyUsernameAvailability(
          form.username.trim(),
        );
        if (usernameAvailable.success) {
          setUsernameMessage((prev) => ({
            ...prev,
            success: true,
            message: "Username is available!",
          }));
        } else {
          setUsernameMessage((prev) => ({
            ...prev,
            success: false,
            message: "Username is already taken. Please choose another one.",
          }));
        }
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [form.username]);
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md text-left">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">Create your account</p>
          <h1 className="text-3xl font-semibold text-white">Join StashD</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Start organizing your links with smart categories and quick access.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
            {nameError && (
              <span className="text-red-400 text-sm">{nameError}</span>
            )}
          </div>
          <div>
            <label className="text-sm text-zinc-300">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a unique username"
              value={form.username}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
            {!usernameMessage.success && form.username.trim() !== "" && (
              <span className="text-red-400 text-sm">
                {usernameMessage.message}
              </span>
            )}
            {usernameMessage.success && (
              <span className="text-green-400 text-sm">
                {usernameMessage.message}
              </span>
            )}
          </div>
          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
            {emailError && (
              <span className="text-red-400 text-sm">{emailError}</span>
            )}
          </div>
          <div>
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
            <p
              onClick={() => {
                setShowPassword((prev) => !prev);
              }}
              className="text-end m-1 text-xs cursor-pointer select-none text-indigo-300"
            >
              Show Password
            </p>
            {passwordError && (
              <span className="text-red-400 text-sm">{passwordError}</span>
            )}
          </div>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <button
            type="button"
            disabled={
              loading ||
              !usernameMessage.success ||
              !!nameError ||
              !!emailError ||
              !!passwordError ||
              form.name === "" ||
              form.email === "" ||
              form.password === ""
            }
            onClick={handleSignUp}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3 transition disabled:opacity-60"
          >
            {loading ? "Signing Up..." : "Create Account"}
          </button>
        </div>

        <div className="mt-6 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-indigo-300 hover:text-indigo-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
