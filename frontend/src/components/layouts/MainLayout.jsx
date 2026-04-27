import { Outlet } from "react-router-dom";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";

const MainLayout = () => (
  <div className="app-shell">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
