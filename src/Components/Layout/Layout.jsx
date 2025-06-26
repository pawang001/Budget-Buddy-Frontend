import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout-container">
      <header className="mobile-header">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <h1>Budget Buddy</h1>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`} onClick={closeSidebar}>
        <h2>Budget Buddy</h2>
        <nav>
            <NavLink to= "/dashboard" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
            <NavLink to= "/transactions" className={({isActive}) => isActive ? "active" : ""}>Transactions</NavLink>
            <NavLink to= "/profile" className={({isActive}) => isActive ? "active" : ""}>Profile</NavLink>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content"> 
        <Outlet/>
      </main>
    </div>
  );
};

export default Layout;
