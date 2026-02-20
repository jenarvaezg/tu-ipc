import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingQuiz from "./OnboardingQuiz";

describe("OnboardingQuiz", () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("shows sticky navigation actions with next disabled initially", () => {
    render(<OnboardingQuiz onComplete={() => {}} onSkip={() => {}} />);

    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Saltar al calculador/i }),
    ).toBeInTheDocument();
  });

  it("does not auto-advance after selecting an option", async () => {
    const user = userEvent.setup();

    render(<OnboardingQuiz onComplete={() => {}} onSkip={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Estudiante/i }));
    expect(screen.getByText(/Pregunta 1 de 7/)).toBeInTheDocument();
  });

  it("requires pressing Siguiente to advance", async () => {
    const user = userEvent.setup();

    render(<OnboardingQuiz onComplete={() => {}} onSkip={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Estudiante/i }));
    expect(screen.getByText(/Pregunta 1 de 7/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(screen.getByText(/Pregunta 2 de 7/)).toBeInTheDocument();
  });

  it("persists quiz progress in sessionStorage and restores it on remount", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onSkip = vi.fn();

    const view = render(<OnboardingQuiz onComplete={onComplete} onSkip={onSkip} />);

    await user.click(screen.getByRole("button", { name: /Estudiante/i }));
    await user.click(screen.getByRole("button", { name: /Siguiente/i }));

    expect(screen.getByText(/Pregunta 2 de 7/)).toBeInTheDocument();

    view.unmount();
    render(<OnboardingQuiz onComplete={onComplete} onSkip={onSkip} />);

    expect(screen.getByText(/Pregunta 2 de 7/)).toBeInTheDocument();
  });
});
