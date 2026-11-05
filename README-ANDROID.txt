HENERY & CO. — LOGIN / SIGNUP STARTER
Phone-only setup guide (Android)

WHAT IS INCLUDED
- Email + password create-account and sign-in.
- Email verification message after signup.
- Google sign-in using redirect (better suited to mobile web).
- Phone OTP flow with Firebase reCAPTCHA.
- Sign-out and signed-in state.
- Firebase config placeholder.

IMPORTANT ZERO-BUDGET NOTE
Email/password and Google sign-in are available on Firebase Spark at no cost within Firebase's terms and limits.
Firebase Phone Authentication SMS is billed per SMS and is not available on the Spark plan. To test without paying, configure Firebase fictional/test phone numbers and their fixed test codes. Real SMS OTP requires moving to a billing-enabled plan and can incur charges. Do not enable billing if you want to keep the project strictly free.
Official pricing: https://firebase.google.com/pricing
Phone auth guide: https://firebase.google.com/docs/auth/web/phone-auth

PART A — CREATE FIREBASE PROJECT ON YOUR PHONE
1. Open Chrome and go to https://console.firebase.google.com/
2. Sign in with your Google account.
3. Tap Add project; name it henery-co (or another available project ID).
4. Google Analytics is optional; you can turn it off for this starter.
5. When project is ready, tap the Web icon </> to add a web app.
6. App nickname: Henery Co Web. Register app.
7. Copy the Firebase config shown. Keep it available; do not share it publicly in chats.

PART B — TURN ON LOGIN PROVIDERS
1. Firebase Console > Build > Authentication > Get started.
2. Open Sign-in method.
3. Enable Email/Password and save.
4. Enable Google, choose a support email, save.
5. Phone: you may enable it for test-number work, but real SMS costs money and requires Blaze billing.
6. For phone testing, open Phone numbers for testing and add your own test entry with a made-up fixed 6-digit code. Firebase will not send a real SMS for this test number.

PART C — PUT YOUR FIREBASE CONFIG INTO THE PROJECT
1. Extract the ZIP on your phone.
2. Open the folder in Acode.
3. Open firebase-config.js.
4. Replace PASTE_API_KEY_HERE, PASTE_PROJECT_ID and PASTE_APP_ID with the values from Firebase's web app config. The authDomain should be your actual project ID + .firebaseapp.com.
5. Save.

PART D — HOST THE APP ON HTTPS (NEEDED FOR PHONE AUTH)
The page must be served from an HTTPS domain; opening index.html directly as a file will not work with Firebase modules and phone auth.
A free option is GitHub Pages:
1. In Chrome, open https://github.com/ and create/sign in to an account.
2. Create a new public repository named henery-co-app.
3. Upload the extracted project files (index.html, styles.css, app.js, firebase-config.js).
4. In repository Settings > Pages, choose Deploy from a branch, select main and /(root), then Save.
5. Wait for GitHub Pages to publish and open the provided https://...github.io/henery-co-app/ URL.
6. In Firebase Console > Authentication > Settings > Authorized domains, add the hostname only (for example, username.github.io). Do not include https:// or a path.
7. Reload the app URL.

PART E — TEST
- Test email signup with an email address you can access, then check verification email.
- Sign out and test email sign-in.
- Test Google sign-in from the HTTPS URL.
- For phone, use the exact fictional phone number and fixed code you added in Firebase test numbers. No SMS is sent for this test.
- Real OTP SMS is not zero-cost on Firebase Spark.

SECURITY / NEXT STEPS
- Firebase web config is not a private secret, but database rules and authorized domains must be configured before launch.
- Never put service account JSON, private keys, or admin credentials in this frontend project.
- This starter authenticates users only. It does not yet create public profiles in Firestore or implement social matching/chat.
- Users can choose more than one login method later by linking credentials; do not assume separate email/Google/phone signups automatically merge into one account.
