import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components";
import { Login, Libros, Users } from "./pages";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />

            {/* Ruta protegida - Libros */}
            <Route
              path="/libros"
              element={
                <ProtectedRoute>
                  <Libros />
                </ProtectedRoute>
              }
            />

            {/* Ruta protegida - Usuarios (Solo Admin) */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/libros" replace />} />

            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="text-6xl">🔍</div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      404 - Página no encontrada
                    </h2>
                    <p className="text-gray-600">
                      La página que buscas no existe.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/libros")}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Ir a Libros
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
