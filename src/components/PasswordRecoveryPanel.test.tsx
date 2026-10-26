import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PasswordRecoveryPanel from "./PasswordRecoveryPanel";

const authMocks = vi.hoisted(() => ({ updateUser: vi.fn() }));
vi.mock("../lib/supabase", () => ({ supabase: { auth: authMocks } }));

describe("PasswordRecoveryPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.updateUser.mockResolvedValue({ error: null });
  });

  it("rejects mismatched passwords without sending an update", async () => {
    render(<PasswordRecoveryPanel onComplete={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/New password/), { target: { value: "new-strong-password-123" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/passwords do not match/i);
    expect(authMocks.updateUser).not.toHaveBeenCalled();
  });

  it("updates the password and returns to the workspace after success", async () => {
    const onComplete = vi.fn();
    render(<PasswordRecoveryPanel onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText(/New password/), { target: { value: "new-strong-password-123" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-strong-password-123" } });
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByRole("heading", { name: /password updated/i })).toBeTruthy();
    expect(authMocks.updateUser).toHaveBeenCalledWith({ password: "new-strong-password-123" });
    fireEvent.click(screen.getByRole("button", { name: /continue to workspace/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
