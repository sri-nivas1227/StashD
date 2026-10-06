"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import {
  API_URL,
  AUTH_COOKIE_NAME,
  COOKIE_CONFIG,
  ENDPOINTS,
} from "@/config/constants";

type responseFormat = { success: boolean; message: string; data?: any };

// Auth Actions

export async function postSignupAction(formData: {
  email: string;
  password: string;
  name: string;
}) {
  const response = await fetch(`${API_URL}${ENDPOINTS.SIGNUP}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  const responseData: responseFormat = await response.json();
  const setCookieHeader = response.headers.get("set-cookie");
  if (setCookieHeader != null) {
    const token = setCookieHeader?.split(";")[0].split("=")[1];

    const cookieStore = await cookies();
    cookieStore.set("X-OTPVerifier", token, {
      httpOnly: true,
      maxAge: 5000,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  }
  return responseData;
}
export async function postVerifyUsernameAvailability(username: string) {
  const response = await fetch(`${API_URL}${ENDPOINTS.VERIFY_USERNAME}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username }),
  });
  const responseData: responseFormat = await response.json();
  return responseData;
}

export async function postVerifyOTPAuthAction(otp: string) {
  {
    const cookieStore = await cookies();
    const token = cookieStore.get("X-OTPVerifier")?.value;
    if (token) {
      const payload = jwt.decode(token);
      if (typeof payload == "object") {
        const requestData = {
          otp: otp,
          user_id: payload!.user_id,
          otp_id: payload!.otp_id,
        };
        const response = await fetch(`${API_URL}${ENDPOINTS.VERIFY_OTP_AUTH}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
        const responseData: responseFormat = await response.json();
        if (response.ok) {
          // 2. Set the cookie on the server side
          const cookieStore = await cookies();
          cookieStore.set(
            AUTH_COOKIE_NAME,
            responseData.data.token,
            COOKIE_CONFIG,
          );
          return responseData;
        }
        return responseData;
      }
    }
  }
  return {
    success: false,
    message: "Something went wrong!",
  };
}

export async function postResendOTPAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("X-OTPVerifier")?.value;
  if (token) {
    const payload = jwt.decode(token);
    console.log(payload);
    if (typeof payload == "object") {
      const requestData = {
        user_id: payload!.user_id,
        otp_id: payload!.otp_id,
      };
      const response = await fetch(`${API_URL}${ENDPOINTS.RESEND_OTP}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      const responseData: responseFormat = await response.json();
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader != null) {
        const token = setCookieHeader?.split(";")[0].split("=")[1];

        const cookieStore = await cookies();
        cookieStore.delete("X-OTPVerifier");
        cookieStore.set("X-OTPVerifier", token, {
          httpOnly: true,
          maxAge: 5000,
          path: "/",
          sameSite: "none",
          secure: true,
        });
      }
      return responseData;
    } else {
      return {
        success: false,
        message: "Something went wrong! Please Login.",
        data: {
          redirect: "/auth/login",
        },
      };
    }
  } else {
    return {
      success: false,
      message: "Session Expired! Please login again.",
      data: {
        redirect: "/auth/login",
      },
    };
  }
}
export async function postLoginAction(formData: any) {
  // 1. Call your external API
  const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const responseData: responseFormat = await response.json();
  if (response.ok) {
    // 2. Set the cookie on the server side
    const cookieStore = await cookies();
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader != null) {
      const token = setCookieHeader?.split(";")[0].split("=")[1];
      const name = setCookieHeader?.split(";")[0].split("=")[0];
      cookieStore.set(name, token, COOKIE_CONFIG);
    }
    return responseData;
  }

  return responseData;
}

// Forgot password actions

const RESET_COOKIE_NAME = "X-ResetVerifier";

export async function postForgotPasswordAction(email: string) {
  const response = await fetch(`${API_URL}${ENDPOINTS.FORGOT_PASSWORD}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  const responseData: responseFormat = await response.json();
  const setCookieHeader = response.headers.get("set-cookie");
  if (response.ok && setCookieHeader != null) {
    const token = setCookieHeader.split(";")[0].split("=")[1];
    const cookieStore = await cookies();
    cookieStore.set(RESET_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: 900,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  }
  return responseData;
}

export async function getPasswordResetEmailAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(RESET_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = jwt.decode(token);
  if (payload && typeof payload == "object") {
    return (payload.email as string) ?? null;
  }
  return null;
}

export async function postResetPasswordAction(formData: {
  otp: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(RESET_COOKIE_NAME)?.value;
  if (!token) {
    return {
      success: false,
      message: "Session expired. Please request a new OTP.",
      data: { redirect: "/auth/forgotPassword" },
    } as responseFormat;
  }
  const response = await fetch(`${API_URL}${ENDPOINTS.RESET_PASSWORD}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${RESET_COOKIE_NAME}=${token}`,
    },
    body: JSON.stringify(formData),
  });
  const responseData: responseFormat = await response.json();
  if (response.ok || response.status === 401) {
    cookieStore.delete(RESET_COOKIE_NAME);
  }
  return responseData;
}

export async function pingServerAction() {
  const cookieStore = await cookies();

  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.PING}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
  });
  const data: responseFormat = await response.json();
  if (!data.success) {
    cookieStore.delete(AUTH_COOKIE_NAME);
  }
  return data;
}
export async function checkTokenAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return token ? true : false;
}

export async function extractTokenAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    const payload = jwt.decode(token);
    return payload;
  }
  return null;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return true;
}

// Homepage actions
export async function getCategoriesAction() {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.CATEGORIES}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
  });
  const data: responseFormat = await response.json();
  return data;
}

export async function getCategoryDetailsAction(categoryId: string) {
  const token = await getToken();
  const response = await fetch(
    `${API_URL}${ENDPOINTS.CATEGORIES}/${categoryId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.value}`,
      },
    },
  );
  const data: responseFormat = await response.json();
  return data;
}

export async function getLinksFromCategoriesAction(selectedCategoryId: string) {
  const token = await getToken();
  const response = await fetch(
    `${API_URL}${ENDPOINTS.LINKS_BY_CATEGORY}?category_id=${selectedCategoryId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.value}`,
      },
    },
  );
  const data: responseFormat = await response.json();
  return data;
}

export async function getAllLinksAction() {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.ALL_LINKS}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
  });
  const data: responseFormat = await response.json();

  return data;
}

export async function getLinkOnSearchAction(searchQuery: string) {
  const cookieStore = await cookies();
  const response = await fetch(
    `${API_URL}${ENDPOINTS.SEARCH_LINKS}?query=${searchQuery}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${cookieStore.get(AUTH_COOKIE_NAME)?.value}`,
      },
    },
  );
  const data: responseFormat = await response.json();
  return data;
}

export async function getLinkDataAction(linkId: string) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.LINK_DATA}/${linkId}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
  });
  const data: responseFormat = await response.json();
  return data;
}

export async function postAddURLAction(newLink: any) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.ADD_LINK}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
    body: JSON.stringify(newLink),
  });
  const data: responseFormat = await response.json();
  return data;
}

export async function putEditURLAction(updatedLink: any, linkId: string) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.EDIT_LINK}/${linkId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
    body: JSON.stringify(updatedLink),
  });
  const data: responseFormat = await response.json();
  return data;
}

export async function deleteURLAction(linkId: string) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.DELETE_LINK}/${linkId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
  });
  const data: responseFormat = await response.json();
  return data;
}

// Profile actions
export async function getProfileAction() {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.GET_PROFILE}`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
  });
  const data: responseFormat = await response.json();
  return data;
}

export async function getPublicProfileAction(username: string) {
  const response = await fetch(
    `${API_URL}${ENDPOINTS.PUBLIC_PROFILE}/${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    },
  );
  const data: responseFormat = await response.json();
  return data;
}

export async function postUpdateProfileAction(updatedProfile: any) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.POST_PROFILE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
    body: JSON.stringify(updatedProfile),
  });
  const data: responseFormat = await response.json();
  return data;
}

export async function updateCategoryAction(
  categoryId: string,
  updatedCategory: { name?: string; isPublic?: boolean },
) {
  const token = await getToken();
  const response = await fetch(
    `${API_URL}${ENDPOINTS.CATEGORIES}/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.value}`,
      },
      body: JSON.stringify(updatedCategory),
    },
  );
  const data: responseFormat = await response.json();
  return data;
}

export async function getCollectionPublicURLAction(formData: { categoryId: string }) {
  const token = await getToken();
  const response = await fetch(
    `${API_URL}${ENDPOINTS.GENERATE_PUBLIC_COLLECTION_URL}/${formData.categoryId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.value}`,
      },
    },
  );
  const data: responseFormat = await response.json();
  return data;
}

export async function postChangePasswordAction(formData: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const token = await getToken();
  const response = await fetch(`${API_URL}${ENDPOINTS.UPDATE_PASSWORD}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token?.value}`,
    },
    body: JSON.stringify(formData),
  });
  const data: responseFormat = await response.json();

  return data;
}

// Admin actions
export async function postReportIssueAction(issueData: any) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(issueData)) {
    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else {
      formData.append(key, String(value));
    }
  }
  console.log(issueData);
  const response = await fetch(`${API_URL}${ENDPOINTS.REPORT_ISSUE}`, {
    method: "POST",
    body: formData,
  });
  const data: responseFormat = await response.json();
  console.log(data);
  return data;
}
// Public Endpoint Actions
export async function getLinksFromPublicCollection(
  username: string,
  collectionSlug: string,
  searchQuery: string,
) {
  const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
  const response = await fetch(
    `${API_URL}${ENDPOINTS.SHARED_COLLECTION}/${username}/${collectionSlug}${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data: responseFormat = await response.json();
  return data;
}
// Helper function to get token from cookies
async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME);
}
