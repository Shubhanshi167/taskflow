import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
  useNavigate
} from "react-router-dom";

import {
  useContext,
  useEffect
} from "react";

import { AuthContext } from "./context/AuthContext";

import { ToastProvider } from "./context/ToastContext";

import toast from "react-hot-toast";

import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WorkspacePage from "./pages/WorkspacePage";
import SettingsPage from "./pages/SettingsPage";

import { workspaceAPI } from "./api";



/* =======================================
   ACCEPT INVITE PAGE
======================================= */

function AcceptInvitePage() {

  const { token } = useParams()

  const navigate = useNavigate()

  const { user } = useContext(AuthContext)

  useEffect(() => {

    if (!user) {

      navigate(`/login?redirect=/invite/${token}`)

      return
    }

    workspaceAPI
      .acceptInvite(token)

      .then(({ data }) => {

        toast.success("Joined workspace!")

        navigate(`/workspace/${data.workspaceId}`)

      })

      .catch(() => {

        toast.error("Invalid or expired invite link")

        navigate("/dashboard")

      })

  }, [token, user])

  return (

    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "var(--bg-primary)"
      }}
    >

      <div
        style={{
          color: "var(--text-muted)",
          fontSize: "14px"
        }}
      >
        Joining workspace...
      </div>

    </div>

  )

}



/* =======================================
   PROTECTED ROUTE
======================================= */

function ProtectedRoute({ children }) {

  const { user, loading } = useContext(AuthContext)

  if (loading) {

    return (

      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          background: "var(--bg-primary)"
        }}
      >

        <div
          className="flex flex-col items-center gap-4"
        >

          <div
            className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"
          />

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              fontFamily: "var(--font-body)"
            }}
          >
            Loading TaskFlow...
          </p>

        </div>

      </div>

    )

  }

  if (!user) {

    return <Navigate to="/login" replace />

  }

  return children

}



/* =======================================
   PUBLIC ROUTE
======================================= */

function PublicRoute({ children }) {

  const { user, loading } = useContext(AuthContext)

  if (loading) return null

  if (user) {

    return <Navigate to="/dashboard" replace />

  }

  return children

}



/* =======================================
   APP LAYOUT
======================================= */

function AppLayout() {

  const location = useLocation()

  const showNavbar =
  location.pathname === "/";
  return (

    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)"
      }}
    >

      {showNavbar && <Navbar />}

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />


        {/* PROTECTED */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invite/:token"
          element={
            <ProtectedRoute>
              <AcceptInvitePage />
            </ProtectedRoute>
          }
        />


        {/* FALLBACK */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </div>

  )

}



/* =======================================
   MAIN APP
======================================= */

export default function App() {

  return (

    <BrowserRouter>

      <ToastProvider>

        <AppLayout />

      </ToastProvider>

    </BrowserRouter>

  )

}