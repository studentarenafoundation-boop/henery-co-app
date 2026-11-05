
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

// Reuse existing Firebase app
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
auth.useDeviceLanguage();

const message = document.getElementById("message");
const signedOut = document.getElementById("signedOut");
const signedIn = document.getElementById("signedIn");
const emailForm = document.getElementById("emailForm");

let mode = "signup";
let confirmationResult = null;
let recaptcha = null;

function say(text, ok = false) {
  message.textContent = text;
  message.className = ok ? "message ok" : "message";
}

function friendlyError(error) {
  const errors = {
    "auth/invalid-api-key":
      "Firebase API key is missing or incorrect.",

    "auth/operation-not-allowed":
      "Enable this login method in Firebase Console.",

    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/email-already-in-use":
      "This email already exists. Please sign in.",

    "auth/weak-password":
      "Password must contain at least 6 characters.",

    "auth/invalid-phone-number":
      "Enter a valid phone number with country code, e.g. +91.",

    "auth/unauthorized-domain":
      "Add your website domain to Firebase Authorized domains.",

    "auth/too-many-requests":
      "Too many attempts. Please wait before trying again.",

    "auth/popup-blocked":
      "Sign-in was blocked by your browser.",

    "auth/invalid-verification-code":
      "Incorrect OTP. Please check and try again.",

    "auth/code-expired":
      "OTP expired. Please request a new OTP.",

    "auth/captcha-check-failed":
      "reCAPTCHA failed. Please refresh and try again.",

    "auth/invalid-app-credential":
      "Phone verification failed. Check Firebase phone authentication settings.",

    "auth/quota-exceeded":
      "SMS quota exceeded. Please try again later.",

    "auth/network-request-failed":
      "Network error. Check your internet connection."
  };

  return errors[error.code] ||
    error.message ||
    "Something went wrong. Please try again.";
}

// Clean up phone verification
async function clearRecaptcha() {
  if (recaptcha) {
    try {
      await recaptcha.clear();
    } catch (error) {
      console.warn("reCAPTCHA cleanup:", error);
    }
  }

  recaptcha = null;
}

// EMAIL SIGNUP AND LOGIN

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.tab;

    document.querySelectorAll(".tabs button").forEach(tab => {
      tab.classList.toggle("active", tab === button);
    });

    document.getElementById("name").hidden = mode === "login";
    document.getElementById("nameLabel").hidden = mode === "login";

    document.getElementById("emailSubmit").textContent =
      mode === "signup" ? "Create account" : "Sign in";

    document.getElementById("password").autocomplete =
      mode === "signup" ? "new-password" : "current-password";

    say("");
  });
});

emailForm.addEventListener("submit", async event => {
  event.preventDefault();

  say("Please wait...");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    if (mode === "signup") {
      const name = document.getElementById("name").value.trim();

      if (!name) {
        throw new Error("Please enter your name.");
      }

      const result = await createUserWithEmailAndPassword(
        auth, email, password
      );

      await updateProfile(result.user, {
        displayName: name
      });

      await sendEmailVerification(result.user);

      say("Account created! Please verify your email.", true);

    } else {
      await signInWithEmailAndPassword(auth, email, password);

      say("Signed in successfully!", true);
    }

  } catch (error) {
    say(friendlyError(error));
  }
});

// GOOGLE SIGN-IN

document.getElementById("googleBtn").addEventListener("click", async () => {
  try {
    say("Connecting to Google...");

    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account"
    });

    await signInWithRedirect(auth, provider);

  } catch (error) {
    say(friendlyError(error));
  }
});

// CHECK GOOGLE REDIRECT RESULT

getRedirectResult(auth)
  .then(result => {
    if (result && result.user) {
      say("Google sign-in successful!", true);
    }
  })
  .catch(error => {
    say(friendlyError(error));
  });

// PHONE OTP - SEND CODE

document.getElementById("sendCodeBtn").addEventListener("click", async () => {
  try {
    const phone = document.getElementById("phone").value.trim();

    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      throw new Error(
        "Enter a valid international number, e.g. +919876543210."
      );
    }

    say("Preparing phone verification...");

    if (!recaptcha) {
      recaptcha = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            say("reCAPTCHA expired. Please try again.");
          }
        }
      );
    }

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      recaptcha
    );

    document.getElementById("otpArea").hidden = false;

    say("OTP sent successfully! Check your phone.", true);

  } catch (error) {
    say(friendlyError(error));
    await clearRecaptcha();
  }
});

// PHONE OTP - VERIFY CODE

document.getElementById("verifyCodeBtn").addEventListener("click", async () => {
  try {
    const code = document.getElementById("otp").value.trim();

    if (!confirmationResult) {
      throw new Error("Please request an OTP first.");
    }

    if (!/^\d{6}$/.test(code)) {
      throw new Error("Enter the complete 6-digit OTP.");
    }

    say("Verifying OTP...");

    await confirmationResult.confirm(code);

    confirmationResult = null;
    await clearRecaptcha();

    document.getElementById("otpArea").hidden = true;

    say("Phone verification successful! You are signed in.", true);

  } catch (error) {
    say(friendlyError(error));
  }
});

// SIGN OUT

document.getElementById("signOutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);

    confirmationResult = null;
    await clearRecaptcha();

    say("You have signed out successfully.", true);

  } catch (error) {
    say(friendlyError(error));
  }
});

// AUTOMATIC LOGIN STATUS

onAuthStateChanged(auth, user => {
  signedOut.hidden = !!user;
  signedIn.hidden = !user;

  if (user) {
    document.getElementById("userDetails").textContent =
      user.displayName ||
      user.email ||
      user.phoneNumber ||
      "Your Henery & Co. account";
  }
});
