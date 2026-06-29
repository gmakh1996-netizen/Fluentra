// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatMessage } from "@/components/chat/chat-message";
import type { Message } from "ai";

// Mock heavy sub-components to keep test focused on ChatMessage logic
vi.mock("@/components/chat/markdown-content", () => ({
  MarkdownContent: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}));
vi.mock("@/components/chat/word-actions-popover", () => ({
  WordActionsPopover: () => null,
}));

const writeText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText },
  configurable: true,
});

function msg(role: "user" | "assistant", content: string): Message {
  return { id: "1", role, content, createdAt: new Date() };
}

describe("ChatMessage", () => {
  const defaultProps = {
    targetLanguage: "English",
    nativeLanguage: "Georgian",
    onGrammarCheck: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("renders user message content", () => {
    render(<ChatMessage message={msg("user", "Hello world")} {...defaultProps} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders assistant message via MarkdownContent", () => {
    render(<ChatMessage message={msg("assistant", "Hi there!")} {...defaultProps} />);
    expect(screen.getByTestId("markdown")).toHaveTextContent("Hi there!");
  });

  it("shows 'You' label for user messages", () => {
    render(<ChatMessage message={msg("user", "test")} {...defaultProps} />);
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("shows Copy button", () => {
    render(<ChatMessage message={msg("user", "copy me")} {...defaultProps} />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("calls clipboard on copy click", async () => {
    render(<ChatMessage message={msg("user", "copy text")} {...defaultProps} />);
    fireEvent.click(screen.getByText("Copy"));
    expect(writeText).toHaveBeenCalledWith("copy text");
  });

  it("shows 'Check grammar' button for user messages", () => {
    render(<ChatMessage message={msg("user", "check me")} {...defaultProps} />);
    expect(screen.getByText("Check grammar")).toBeInTheDocument();
  });

  it("calls onGrammarCheck with message content when clicked", () => {
    const onGrammarCheck = vi.fn();
    render(
      <ChatMessage
        message={msg("user", "grammar check this")}
        {...defaultProps}
        onGrammarCheck={onGrammarCheck}
      />,
    );
    fireEvent.click(screen.getByText("Check grammar"));
    expect(onGrammarCheck).toHaveBeenCalledWith("grammar check this");
  });

  it("shows 'Grammar' button for assistant messages", () => {
    render(<ChatMessage message={msg("assistant", "assistant text")} {...defaultProps} />);
    expect(screen.getByText("Grammar")).toBeInTheDocument();
  });
});
