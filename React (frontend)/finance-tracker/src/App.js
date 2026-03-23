import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";

const App = () => (
  <>
    <AppRoutes />
    <ToastContainer position="top-right" autoClose={3200} newestOnTop closeOnClick />
  </>
);

export default App;
