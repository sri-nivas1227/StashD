// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Cookie Configuration
export const AUTH_COOKIE_NAME = "auth_token";
export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// Routes
export const ROUTES = {
  HOME: "/home",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  VERIFY_EMAIL: "/auth/verifyEmail",
  FORGOT_PASSWORD: "/auth/forgotPassword",
  RESET_PASSWORD: "/auth/resetPassword",
  ADD_LINK: "/addLink",
  PROFILE: "/profile",
  ROOT: "/",
  FEEDBACK: "/feedback",
  SHARE: "/share",
} as const;

// PUBLIC_PATHS
export const PUBLIC_PATHS = [
  ROUTES.ROOT,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.VERIFY_EMAIL,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.FEEDBACK,
  ROUTES.SHARE,
];
// UI Configuration
export const UI_CONFIG = {
  COPY_NOTIFICATION_TIMEOUT: 1500,
  DEFAULT_USERNAME: "Hello! New Here?",
} as const;

// App Metadata
export const APP_CONFIG = {
  NAME: "StashD",
  LOGO: "LH",
  DESCRIPTION: "Your personal hub for curated links.",
} as const;

// StashD API Endpoints
export const ENDPOINTS = {
  PING: "/ping",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_USERNAME: "/signup/verify_username",
  VERIFY_OTP_AUTH: "/auth/verify_otp",
  RESEND_OTP: "/auth/resend_otp",
  FORGOT_PASSWORD: "/auth/forgot_password",
  RESET_PASSWORD: "/auth/reset_password",
  CATEGORIES: "/categories",
  LINKS_BY_CATEGORY: "/urls/category",
  GENERATE_PUBLIC_COLLECTION_URL: "/categories/generate_public_url",
  LINK_DATA: "/urls",
  ALL_LINKS: "/urls/user",
  SEARCH_LINKS: "/urls/search",
  SHARED_COLLECTION: "/share",
  ADD_LINK: "/urls",
  DELETE_LINK: "/urls",
  EDIT_LINK: "/urls",
  GET_PROFILE: "/profile",
  POST_PROFILE: "/profile",
  PUBLIC_PROFILE: "/profile",
  CHANGE_PASSWORD_SEND_OTP: "/auth/change_password/send_otp",
  REPORT_ISSUE: "/admin/report_issue",
} as const;

// Footer Data

// Social Links
export const SOCIAL_LINKS = {
  GITHUB: "https://github.com/sri-nivas1227",
  X_TWITTER: "https://x.com/sri_nivas1227",
  LINKEDIN: "https://www.linkedin.com/in/sri-nivas1227",
  GOFUNDME: "",
};

export const FOOTER_LINKS = {
  ABOUT: "/",
  CHANGELOG: "/",
  REPORT_ISSUE: "/feedback",
  TERMS: "/",
};
