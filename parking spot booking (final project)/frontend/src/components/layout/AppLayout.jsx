import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const AppLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default AppLayout;
