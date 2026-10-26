import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("DAWG 360 portfolio shell", () => {
  it("makes the unconnected foundation state explicit without inventing portfolio metrics", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /build deliberately\. allocate attention wisely/i })).toBeTruthy();
    expect(screen.getByText(/not connected/i)).toBeTruthy();
    expect(screen.getByText(/no venture, financial or customer figures are being represented as real/i)).toBeTruthy();
    expect(screen.getByText("Active ventures")).toBeTruthy();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(4);
  });

  it("switches to the venture registry view", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /ventures/i }));
    expect(screen.getByRole("heading", { name: /every venture has a stage and a reason/i })).toBeTruthy();
    expect(screen.getByText(/workflow implementation not yet complete/i)).toBeTruthy();
  });

  it("opens and closes the search panel", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /search workspace/i }));
    expect(screen.getByRole("textbox", { name: /search portfolio/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("textbox", { name: /search portfolio/i })).toBeNull();
  });
});