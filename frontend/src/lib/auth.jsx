import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ClerkProvider as RealClerkProvider,
  SignIn as RealSignIn,
  SignInButton as RealSignInButton,
  SignUp as RealSignUp,
  UserButton as RealUserButton,
  useAuth as useRealAuth,
  useUser as useRealUser,
} from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

const DEV_AUTH_STORAGE_KEY = "study-mantra-dev-user";
const AuthModeContext = createContext({ clerkEnabled: false });
const AppAuthContext = createContext({
  isLoaded: true,
  isSignedIn: false,
  user: null,
  signIn: () => false,
  signOut: async () => {},
  getToken: async () => null,
});

const isPublishableKeyConfigured = (value) => {
  const key = String(value || "").trim();
  if (!key) return false;

  const lowered = key.toLowerCase();
  if (
    lowered === "your_clerk_publishable_key" ||
    lowered === "pk_live_your_clerk_publishable_key" ||
    lowered === "pk_test_your_clerk_publishable_key" ||
    lowered === "replace_me" ||
    lowered === "changeme"
  ) {
    return false;
  }

  return /^pk_(test|live)_[a-z0-9_\-$]+$/i.test(key);
};

class ClerkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("Clerk failed to initialize. Falling back to local auth mode.", error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const createDevUser = ({ name, email }) => {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanName || !cleanEmail) {
    return null;
  }

  return {
    id: `dev-${cleanEmail.replace(/[^a-z0-9]/gi, "-")}`,
    firstName: cleanName.split(" ")[0] || cleanName,
    lastName: cleanName.split(" ").slice(1).join(" "),
    fullName: cleanName,
    primaryEmailAddress: {
      emailAddress: cleanEmail,
    },
    publicMetadata: {},
  };
};

function DevAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEV_AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (error) {
      console.warn("Could not restore local auth session.", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      isLoaded: true,
      isSignedIn: Boolean(user),
      user,
      signIn: ({ name, email }) => {
        const nextUser = createDevUser({ name, email });
        if (!nextUser) return false;
        setUser(nextUser);
        localStorage.setItem(DEV_AUTH_STORAGE_KEY, JSON.stringify(nextUser));
        return true;
      },
      signOut: async () => {
        setUser(null);
        localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
      },
      getToken: async () => null,
    }),
    [user]
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

function ClerkBridge({ children }) {
  const { isLoaded, isSignedIn, user } = useRealUser();
  const { getToken, signOut } = useRealAuth();

  const value = useMemo(
    () => ({
      isLoaded,
      isSignedIn,
      user: user || null,
      signIn: () => false,
      signOut,
      getToken,
    }),
    [getToken, isLoaded, isSignedIn, signOut, user]
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

function DevAuthScreen({ mode }) {
  const navigate = useNavigate();
  const auth = useContext(AppAuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const title = mode === "signup" ? "Create your local session" : "Continue in local mode";
  const subtitle =
    "Clerk is unavailable right now, so this project is using local development auth in the browser.";

  const handleSubmit = (event) => {
    event.preventDefault();

    const ok = auth.signIn({ name: name || email.split("@")[0], email });
    if (!ok) {
      setError("Enter a valid name and email.");
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-[70vh] pt-24 px-4 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Local Auth Mode</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-600">{subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            {mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AuthProvider({ publishableKey, children }) {
  const configured = isPublishableKeyConfigured(publishableKey);
  const [clerkFailed, setClerkFailed] = useState(false);
  const clerkEnabled = configured && !clerkFailed;
  const fallback = (
    <AuthModeContext.Provider value={{ clerkEnabled: false }}>
      <DevAuthProvider>{children}</DevAuthProvider>
    </AuthModeContext.Provider>
  );

  if (!clerkEnabled) {
    return fallback;
  }

  return (
    <ClerkErrorBoundary fallback={fallback} onError={() => setClerkFailed(true)}>
      <AuthModeContext.Provider value={{ clerkEnabled: true }}>
        <RealClerkProvider publishableKey={publishableKey}>
          <ClerkBridge>{children}</ClerkBridge>
        </RealClerkProvider>
      </AuthModeContext.Provider>
    </ClerkErrorBoundary>
  );
}

export function useUser() {
  const auth = useContext(AppAuthContext);
  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    user: auth.user,
  };
}

export function useAuth() {
  const auth = useContext(AppAuthContext);
  return {
    getToken: auth.getToken,
    signOut: auth.signOut,
  };
}

export function SignedIn({ children }) {
  const { isSignedIn } = useUser();
  return isSignedIn ? children : null;
}

export function SignedOut({ children }) {
  const { isSignedIn } = useUser();
  return isSignedIn ? null : children;
}

export function SignInButton({ children }) {
  const { clerkEnabled } = useContext(AuthModeContext);

  if (clerkEnabled) {
    return <RealSignInButton>{children}</RealSignInButton>;
  }

  return <Link to="/login">{children}</Link>;
}

export function UserButton(props) {
  const { clerkEnabled } = useContext(AuthModeContext);
  const { user } = useUser();
  const { signOut } = useAuth();

  if (clerkEnabled) {
    return <RealUserButton {...props} />;
  }

  if (!user) return null;

  return (
    <button
      onClick={() => signOut()}
      className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      title={`Signed in as ${user.primaryEmailAddress?.emailAddress}. Click to sign out.`}
    >
      {user.firstName || "User"}
    </button>
  );
}

export function SignIn(props) {
  const { clerkEnabled } = useContext(AuthModeContext);
  if (clerkEnabled) return <RealSignIn {...props} />;
  return <DevAuthScreen mode="signin" />;
}

export function SignUp(props) {
  const { clerkEnabled } = useContext(AuthModeContext);
  if (clerkEnabled) return <RealSignUp {...props} />;
  return <DevAuthScreen mode="signup" />;
}
