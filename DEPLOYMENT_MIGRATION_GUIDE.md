# DEPLOYMENT_MIGRATION_GUIDE

## 1. The "Manual" Pre-Flight Checklist (Firebase Console)

Before running the codebase locally or pushing it to production, you must explicitly authorize your new environments in the Firebase Console.

### Authorize Domains for Google Authentication
If you do not whitelist your local development port and your production domain, Google Sign-In will fail with an `unauthorized-domain` error.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Navigate to **Authentication** > **Settings** (or the **Authorized domains** tab).
3. Scroll down to **Authorized domains**.
4. Click **Add domain**.
5. Add `localhost` (if not already present). *Note: You do not need to include the port number (e.g., `:3000`), just `localhost` or `127.0.0.1`.*
6. Add your production domain (e.g., `app.yourdomain.com`).

### Retrieve Your Firebase Configuration
You need your Firebase configuration to connect your local app to your backend.

1. In the Firebase Console, click the **Gear Icon** (Project settings) next to "Project Overview".
2. Scroll down to the **Your apps** section.
3. If you haven't registered a Web App, click the `</>` icon to add one. Otherwise, select your existing Web App.
4. Look for the `firebaseConfig` object under "SDK setup and configuration". You will use these values to construct your environment configuration locally.
5. In your Firebase project settings, also copy the **Project ID**.

---

## 2. The Local Setup (VS Code)

When you download the source code as a ZIP file, dynamic environment variables managed by the cloud IDE might need to be explicitly set locally.

### Step 1: Extract and Open
1. Extract the downloaded ZIP file.
2. Open the extracted folder in VS Code.

### Step 2: Install Dependencies
Open your terminal in VS Code and run:
```bash
npm install
```
*(If you encounter severe dependency conflicts later, run `npm cache clean --force`, delete `node_modules` and `package-lock.json`, and run `npm install` again.)*

### Step 3: Ensure Firebase Configuration is Present
Check the root directory for `firebase-applet-config.json` (as that is what the AI Studio environment uses). If it is missing from the exported ZIP, create it at the root of the project:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT_ID.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```
*Replace the placeholder values with the values from your Firebase Console.*

If the project relied on Gemini API keys or other environment variables (check `.env.example` if available), create a `.env` file at the root of your project:
```env
VITE_GEMINI_API_KEY=your_actual_api_key
```

### Step 4: Run Locally
Start the development server:
```bash
npm run dev
```

---

## 3. Automated & "Anti-Gravity" Deployment

To push your application to a live production environment directly from your CLI, we will use Firebase Hosting.

### Step 1: Install Firebase CLI globally
```bash
npm install -g firebase-tools
```

### Step 2: Authenticate
Log in to your Google account associated with the Firebase project:
```bash
firebase login
```

### Step 3: Initialize Firebase in your project
Run this command at the root of your project:
```bash
firebase init hosting
```
**Follow the prompts exactly:**
- **Project Setup:** Select `Use an existing project` and choose your Firebase project.
- **Public Directory:** Type `dist` (This is where Vite outputs the production build).
- **Configure as a single-page app (rewrite all urls to /index.html)?** Yes.
- **Set up automatic builds and deploys with GitHub?** No (unless you want to configure GitHub Actions now).
- **File dist/index.html already exists. Overwrite?** No.

### Step 4: Build and Deploy
Every time you want to release a new version, run these two commands:

1. Create a highly optimized production build:
```bash
npm run build
```
2. Deploy the `dist` folder to Firebase global CDN:
```bash
firebase deploy --only hosting
```
*(Optionally, you can also run `firebase deploy --only firestore:rules` if your `firestore.rules` file has been updated).*

---

## 4. Common Failure Matrix (Troubleshooting)

| Error Message / Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **`auth/unauthorized-domain`** | The domain running the app is not whitelisted for Firebase Authentication. | Go to Firebase Console > Authentication > Settings > Authorized Domains. Add `localhost` or your custom production domain to the list. |
| **"Firebase: No Firebase App '[DEFAULT]' has been created..."** or Blank White Screen | Missing or malformed `firebase-applet-config.json` or missing API keys. | Ensure the `firebase-applet-config.json` file is present in the correct directory, contains valid JSON, and has all required properties from the Firebase Console. |
| **Firestore CORS Error** / `Missing or insufficient permissions` | Your Firestore Security Rules are preventing access, or you forgot to deploy them to your live project. | Ensure your `firestore.rules` are deployed using `firebase deploy --only firestore:rules`. Also verify that user authentication is fully succeeding before the app makes database queries. |
