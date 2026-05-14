import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/RubricasExplorer", () => ({
  default: (props: {
    startMonth: string;
    endMonth: string;
    userWeights: Record<string, number>;
  }) => (
    <div data-testid="rubricas-explorer">
      <span data-testid="start">{props.startMonth}</span>
      <span data-testid="end">{props.endMonth}</span>
      <span data-testid="weight-04">{props.userWeights["04"] ?? 0}</span>
    </div>
  ),
}));

import EmbedRubricasShell from "./EmbedRubricasShell";

describe("EmbedRubricasShell", () => {
  it("forwards startMonth, endMonth, and userWeights to the rubricas explorer", async () => {
    render(
      <EmbedRubricasShell
        startMonth="2024-01"
        endMonth="2025-01"
        userWeights={{ "04": 12.5 }}
      />,
    );
    expect(await screen.findByTestId("rubricas-explorer")).toBeInTheDocument();
    expect(screen.getByTestId("start")).toHaveTextContent("2024-01");
    expect(screen.getByTestId("end")).toHaveTextContent("2025-01");
    expect(screen.getByTestId("weight-04")).toHaveTextContent("12.5");
  });

  it("renders an INE attribution link to tu-ipc.es", async () => {
    render(
      <EmbedRubricasShell
        startMonth="2024-01"
        endMonth="2025-01"
        userWeights={{}}
      />,
    );
    await screen.findByTestId("rubricas-explorer");
    const link = screen.getByRole("link", { name: /tu-ipc\.es/i });
    expect(link).toHaveAttribute("href", "https://tu-ipc.es");
  });

  it("does not render the global header or footer chrome", async () => {
    render(
      <EmbedRubricasShell
        startMonth="2024-01"
        endMonth="2025-01"
        userWeights={{}}
      />,
    );
    await screen.findByTestId("rubricas-explorer");
    // Embed shell is intentionally chrome-less: no Header (Tu IPC Personal title)
    // and no Footer (privacy / analytics consent controls).
    expect(
      screen.queryByRole("heading", { name: /Tu IPC Personal/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Política de privacidad/i)).not.toBeInTheDocument();
  });
});
