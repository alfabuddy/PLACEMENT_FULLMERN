import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow">
      <Link
        to={user ? "/dashboard" : "/"}
        className="text-xl font-bold"
      >
        RideShare
      </Link>

      <nav className="flex gap-4 items-center">
        <Link to={user ? "/dashboard" : "/login"}>Find Rides</Link>

        {user ? (
          <>
            <Link to="/profile">Hi, {user.name}</Link>
            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
              Get Started
            </button>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
