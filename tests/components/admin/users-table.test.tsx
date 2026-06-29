// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsersTable } from "@/components/admin/users-table";
import type { AdminUser } from "@/components/admin/users-table";

// Mock fetch for role toggle
global.fetch = vi.fn().mockResolvedValue({ ok: true });

function makeUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "user-1",
    email: "test@example.com",
    display_name: "Test User",
    role: "user",
    tier: "free",
    joined: "2024-01-01",
    last_sign_in: "2024-12-01",
    sub_status: "inactive",
    ...overrides,
  };
}

describe("UsersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user email in the table", () => {
    render(<UsersTable initialUsers={[makeUser()]} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders multiple users", () => {
    render(
      <UsersTable
        initialUsers={[
          makeUser({ id: "1", email: "alice@test.com" }),
          makeUser({ id: "2", email: "bob@test.com" }),
        ]}
      />,
    );
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  it("filters users by search query", () => {
    render(
      <UsersTable
        initialUsers={[
          makeUser({ id: "1", email: "alice@test.com" }),
          makeUser({ id: "2", email: "bob@test.com" }),
        ]}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "alice" } });
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.queryByText("bob@test.com")).not.toBeInTheDocument();
  });

  it("search is case-insensitive", () => {
    render(<UsersTable initialUsers={[makeUser({ email: "Alice@Test.com" })]} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "alice" } });
    expect(screen.getByText("Alice@Test.com")).toBeInTheDocument();
  });

  it("shows no rows when search matches nothing", () => {
    render(<UsersTable initialUsers={[makeUser({ email: "alice@test.com" })]} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "zzznomatch" } });
    expect(screen.queryByText("alice@test.com")).not.toBeInTheDocument();
  });

  it("filters by admin role", () => {
    render(
      <UsersTable
        initialUsers={[
          makeUser({ id: "1", email: "admin@test.com", role: "admin" }),
          makeUser({ id: "2", email: "user@test.com", role: "user" }),
        ]}
      />,
    );
    const roleSelect = screen.getAllByRole("combobox")[0]!;
    fireEvent.change(roleSelect, { target: { value: "admin" } });
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    expect(screen.queryByText("user@test.com")).not.toBeInTheDocument();
  });

  it("filters by tier", () => {
    render(
      <UsersTable
        initialUsers={[
          makeUser({ id: "1", email: "pro@test.com", tier: "pro" }),
          makeUser({ id: "2", email: "free@test.com", tier: "free" }),
        ]}
      />,
    );
    const tierSelect = screen.getAllByRole("combobox")[1]!;
    fireEvent.change(tierSelect, { target: { value: "pro" } });
    expect(screen.getByText("pro@test.com")).toBeInTheDocument();
    expect(screen.queryByText("free@test.com")).not.toBeInTheDocument();
  });

  it("renders an empty table with no user emails", () => {
    render(<UsersTable initialUsers={[]} />);
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });
});
