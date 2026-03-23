import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function AppLayout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
