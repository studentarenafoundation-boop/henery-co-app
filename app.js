import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, updateProfile, GoogleAuthProvider,
  signInWithRedirect, getRedirectResult, RecaptchaVerifier,
  signInWithPhoneNumber, signOut, sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const message = document.getElementById("message");
const signedOut = document.getElementById("signedOut");
const signedIn = document.getElementById("signedIn");
const emailForm = document.getElementById("emailForm");
let mode = "signup";
let confirmationResult = null;
let recaptcha = null;

function say(text, ok=false) {
  message.textContent = text;
  message.className = ok ? "message ok" : "message";
}
function friendlyError(error) {
  const map = {
    "auth/invalid-api-key":"Firebase API key is missing or incorrect.",
    "auth/operation-not-allowed":"Enable this sign-in method in Firebase Console.",
    "auth/invalid-credential":"Email or password is incorrect.",
    "auth/email-already-in-use":"This email already has an account. Try Sign in.",
    "auth/weak-password":"Choose a password with at least 6 characters.",
    "auth/invalid-phone-number":"Enter the phone number with country code, e.g. +91...",
    "auth/unauthorized-domain":"Add this website domain to Firebase Authorized domains.",
    "auth/too-many-requests":"Too many attempts. Please wait and try again.",
    "auth/popup-blocked":"The sign-in window was blocked. Try again."
  };
  return map[error.code] || error.message || "Something went wrong. Please try again.";
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
  mode = button.dataset.tab;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === button));
  document.getElementById("name").hidden = mode === "login";
  document.getElementById("nameLabel").hidden = mode === "login";
  document.getElementById("emailSubmit").textContent = mode === "signup" ? "Create account" : "Sign in";
  document.getElementById("password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  say("");
}));

emailForm.addEventListener("submit", async event => {
  event.preventDefault();
  say("Please wait...");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    if (mode === "signup") {
      const name = document.getElementById("name").value.trim();
      if (!name) throw new Error("Please enter your name.");
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, {displayName:name});
      await sendEmailVerification(result.user);
      say("Account created. Check your email for a verification link.", true);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      say("Signed in successfully.", true);
    }
  } catch(error) { say(friendlyError(error)); }
});

document.getElementById("googleBtn").addEventListener("click", async () => {
  try {
    say("Opening Google sign-in...");
    await signInWithRedirect(auth, new GoogleAuthProvider());
  } catch(error) { say(friendlyError(error)); }
});
getRedirectResult(auth).catch(error => say(friendlyError(error)));

document.getElementById("sendCodeBtn").addEventListener("click", async () => {
  try {
    const phone = document.getElementById("phone").value.trim();
    if (!phone.startsWith("+")) throw new Error("Include country code, e.g. +91 followed by your number.");
    say("Preparing phone verification...");
    if (!recaptcha) recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {size:"normal"});
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha);
    document.getElementById("otpArea").hidden = false;
    say("Verification code sent. Enter the 6-digit code.", true);
  } catch(error) {
    say(friendlyError(error));
    if (recaptcha) { try { await recaptcha.clear(); } catch(_) {} recaptcha = null; }
  }
});
document.getElementById("verifyCodeBtn").addEventListener("click", async () => {
  try {
    const code = document.getElementById("otp").value.trim();
    if (!confirmationResult) throw new Error("Request a verification code first.");
    await confirmationResult.confirm(code);
    say("Phone number verified. Signed in.", true);
  } catch(error) { say(friendlyError(error)); }
});
document.getElementById("signOutBtn").addEventListener("click", async () => {
  try { await signOut(auth); say("You have signed out.", true); }
  catch(error) { say(friendlyError(error)); }
});
onAuthStateChanged(auth, user => {
  signedOut.hidden = !!user;
  signedIn.hidden = !user;
  if (user) {
    document.getElementById("userDetails").textContent = user.displayName || user.email || user.phoneNumber || "Your Henery & Co. account";
  }
});
