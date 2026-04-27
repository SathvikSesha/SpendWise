import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateSpace from "./pages/CreateSpace";
import SpaceDetails from "./pages/SpaceDetails";
import AddExpense from "./pages/AddExpense";
import EditExpense from "./pages/EditExpense";
import EditSpace from "./pages/EditSpace";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spaces/new"
              element={
                <ProtectedRoute>
                  <CreateSpace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spaces/:spaceId"
              element={
                <ProtectedRoute>
                  <SpaceDetails />
                </ProtectedRoute>
              }
            />
            {/* NEW DYNAMIC ROUTE */}
            <Route
              path="/spaces/:spaceId/add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spaces/:spaceId/edit-expense/:expenseId"
              element={
                <ProtectedRoute>
                  <EditExpense />
                </ProtectedRoute>
              }
            />
            <Route
              path="/spaces/:spaceId/edit"
              element={
                <ProtectedRoute>
                  <EditSpace />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
