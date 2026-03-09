/** Component tests for UserBar — user info, sign-out. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@/test/utils";
import { UserBar } from "./UserBar";

describe("UserBar", () => {
  it("renders user name when provided", () => {
    render(<UserBar userName="Jane Doe" userEmail="jane@example.com" />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/Signed in as/)).toBeInTheDocument();
  });

  it("renders email when userName is null", () => {
    render(<UserBar userName={null} userEmail="jane@example.com" />);
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders User when both are null", () => {
    render(<UserBar userName={null} userEmail={null} />);
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("renders History link", () => {
    render(<UserBar userName="Jane" userEmail={null} />);
    expect(screen.getByRole("link", { name: "History" })).toBeInTheDocument();
  });

  it("renders Sign Out button", () => {
    render(<UserBar userName="Jane" userEmail={null} />);
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
  });
});
