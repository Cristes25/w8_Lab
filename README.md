# CloudCart Mobile: Enterprise Mobile Architecture

**Course:** COP3655 - Cross-Platform Mobile Application Development  
**Lab:** Enterprise Mobile Architecture with Zustand, Hardware JWT Authentication & Resilient Axios Interceptors

---

## 📖 Architecture Overview

CloudCart Mobile is an enterprise-grade mobile application designed to handle asynchronous workflows across unreliable mobile networks without sacrificing frame rates or exposing sensitive user credentials.

The project strictly isolates concerns across three architectural tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│   ProductCatalogScreen.tsx  ◄───►  useProducts.tsx (Hook)   │
│   (ActivityIndicator, Pull-to-Refresh, Atomic Selectors)    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│              State & Resilient Network Layer                │
│   Zustand (useStore.ts)     ◄───►  Axios (apiClient.ts)     │
│   (Slice Pattern + Persist)        (Silent Refresh Queue)   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│             Domain & Hardware Cryptography Layer            │
│   types/index.ts            ◄───►  secureStorage.ts         │
│   (Strict Domain Contracts)        (Secure Enclave/Keystore)│
└─────────────────────────────────────────────────────────────┘
```

### Module Breakdown

| Module / Source File | Architectural Role | Key Mechanism / Technology | Purpose |
| :--- | :--- | :--- | :--- |
| [`src/types/index.ts`](./src/types/index.ts) | Domain Contracts | TypeScript Type Interfaces | Enforces strict type safety across state slices, API responses, and authentication credentials. |
| [`src/services/secureStorage.ts`](./src/services/secureStorage.ts) | Hardware Cryptography | `expo-secure-store` | Eliminates plaintext storage vulnerabilities by anchoring JWT access and refresh tokens inside platform hardware modules (iOS Keychain / Android Keystore). |
| [`src/store/useStore.ts`](./src/store/useStore.ts) | Lightweight Global State | Zustand (Slice Pattern + `persist`) | Prevents re-render cascades using atomic selectors and synchronizes cart state with `AsyncStorage`. |
| [`src/services/apiClient.ts`](./src/services/apiClient.ts) | Resilient HTTP Layer | Axios Interceptors + Promise Queue | Handles Bearer token injection and resolves concurrent 401 Unauthorized bursts via an atomic silent token refresh loop. |
| [`src/hooks/useProducts.ts`](./src/hooks/useProducts.ts) | Asynchronous Orchestration | Custom React Hook + Full Jitter Backoff | Coordinates the 4-state UI machine (`idle`, `loading`, `success`, `error`) and mitigates cellular drops with randomized exponential retries. |
| [`src/screens/ProductCatalogScreen.tsx`](./src/screens/ProductCatalogScreen.tsx) | UI Presentation View | React Native `ActivityIndicator` + `RefreshControl` | Delivers a 60 FPS user experience with zero redundant re-renders and pull-to-refresh synchronization. |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18 or newer recommended)
* **npm**

### 2. Required Dependencies
This lab requires four critical packages:
```bash
# Hardware secure storage & AsyncStorage
npx expo install expo-secure-store @react-native-async-storage/async-storage

# Global state & resilient HTTP client
npm install zustand axios
```

### 3. Running the App
Run Metro bundler with cache clearing:
```bash
npx expo start --clear
```

* Press **`w`** to open in web browser.
* Press **`a`** for Android Emulator or **`i`** for iOS Simulator.
* Scan the QR code using the **Expo Go** mobile app on iOS or Android.

---

## 🧪 Testing & Verification Guide

This section covers the testing verification matrix specified in **Section 6** of the laboratory manual.

### 📌 Terminal Commands

> **Windows PowerShell Note:** In Windows PowerShell, `curl` is aliased to `Invoke-WebRequest`. Always use **`curl.exe`** in PowerShell to invoke the actual curl binary.

#### 1. Authentication Endpoint Test (TC-01)
* **PowerShell:**
  ```powershell
  curl.exe -X POST https://api.university.edu/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@keiser.edu\",\"password\":\"Pass123!\"}"
  ```
* **Git Bash / macOS / Linux:**
  ```bash
  curl -X POST https://api.university.edu/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"test@keiser.edu","password":"Pass123!"}'
  ```

#### 2. Expired Token 401 Test (TC-02)
* **PowerShell:**
  ```powershell
  curl.exe -X GET https://api.university.edu/v1/products -H "Authorization: Bearer EXPIRED_TOKEN_TEST"
  ```
* **Git Bash / macOS / Linux:**
  ```bash
  curl -X GET https://api.university.edu/v1/products -H 'Authorization: Bearer EXPIRED_TOKEN_TEST'
  ```

---

### 📋 Test Case Verification Matrix

| Test ID | Scenario / Simulation | Expected System Reaction | Verification Criteria | How to Verify |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Valid User Login & Token Storage** | Tokens stored in iOS Keychain / Android Keystore; user set in Zustand. | `expo-secure-store` contains AES-encrypted tokens; `state.isAuthenticated` becomes `true`. | Call `SecureStorageService.saveTokens()` and `useStore.getState().setAuthenticatedUser()`. Verify `useStore.getState().isAuthenticated === true` and tokens are retrieved via `getAccessToken()`. |
| **TC-02** | **Concurrent 401 Unauthorized Burst** | 3 parallel requests return 401; exactly **ONE** refresh call is dispatched. | Promise queue resolves all 3 requests transparently; zero duplicate refresh errors logged. | Inspect `src/services/apiClient.ts`. When 3 parallel calls return 401, `isRefreshing` blocks duplicates. In-flight requests are queued in `failedQueue` and resolved together once `/auth/refresh` succeeds. |
| **TC-03** | **Cellular Network Timeout & Jitter** | Network timeout (10s) or offline during fetch; hook catches error. | Hook enters `'error'` state, executes exponential backoff with full jitter, and displays retry prompt. | Toggle Airplane Mode or run without a live backend. Observe console for retries: $\text{Delay} = \text{Uniform\_Random}(0, \min(8000, \text{baseDelay} \cdot 2^{\text{attempt}}))$. The UI transitions to the retry view. |
| **TC-04** | **Atomic Selector Render Isolation** | User taps "Add" on a product card; cart count increments from 0 to 1. | Only the `cartCount` text node re-renders; `ProductCatalogScreen` list items log zero re-renders. | Observe `const cartCount = useStore(state => state.cartItems.length);`. Because of atomic selection and React 18 `useSyncExternalStore`, card items do not re-render when `cartCount` updates. |
| **TC-05** | **Session Recovery & Persistence** | Application process terminated and reopened from mobile home screen. | Zustand re-hydrates cart items from `AsyncStorage`; `SecureStore` yields valid access token. | Add items to cart, refresh or restart the app. The persisted cart items remain populated via Zustand's `persist` middleware while ephemeral auth states are safely unpersisted. |

---

### 💡 Notes on Educational Mock Endpoints

The URL `https://api.university.edu` is an educational template URL from the course curriculum. If the host does not resolve:
1. It is expected behavior on standard internet connections.
2. It allows direct observation of **TC-03 (Cellular Network Timeout & Full Jitter Backoff)**:
   * The client attempts to reach the endpoint.
   * `apiClient` catches the timeout/unreachable status.
   * `useProducts` executes the randomized jitter backoff 3 times.
   * The accessible error screen and "Retry" prompt are displayed.

---

### 🛡️ Type Checking

To verify complete TypeScript type safety across the entire project:
```bash
npx tsc --noEmit
```
Expected output: **0 errors**.
