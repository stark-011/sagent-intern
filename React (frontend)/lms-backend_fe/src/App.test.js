import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

test("renders login route", async () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(await screen.findByText(/sign in/i)).toBeInTheDocument();
});
