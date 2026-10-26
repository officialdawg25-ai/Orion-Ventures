import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthPanel from "./AuthPanel";

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { auth: authMocks },
}));

describe("AuthPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.signInWithPassword.mockResolvedValue({ error: null });
    authMocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
  });

  it("submits trimmed email credentials to Supabase Auth", async () => {
    render(<AuthPanel />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "  user@example.com " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in securely/i }));

    await waitFor(() => expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "correct-horse-battery",
    }));
  });

  it("requires a display name and reports the email-confirmation path on signup", async () => {
    render(<AuthPanel />);
    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Portfolio Owner" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "owner@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "a-strong-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(authMocks.signUp).toHaveBeenCalled());
    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "a-strong-password-123",
      options: { data: { display_name: "Portfolio Owner" } },
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/check your email for the confirmation link/i);
  });

  it("shows a safe generic message when authentication fails", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ error: new Error("private provider details") });
    render(<AuthPanel />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in securely/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't complete that request/i);
    expect(screen.queryByText(/private provider details/i)).toBeNull();
  });
});
