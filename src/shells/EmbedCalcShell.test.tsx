import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { IPCResult } from "@/data/types";

vi.mock("@/components/EvolutionChart", () => ({
  default: (props: { isCustom: boolean; data: unknown[] }) => (
    <div data-testid="evolution-chart">
      <span data-testid="is-custom">{String(props.isCustom)}</span>
      <span data-testid="points">{props.data.length}</span>
    </div>
  ),
}));

import EmbedCalcShell from "./EmbedCalcShell";

const RESULT: IPCResult = {
  personalIPC: 3.21,
  officialIPC: 2.5,
  difference: 0.71,
  evolution: [
    { month: "2024-01", personal: 0, official: 0 },
    { month: "2024-02", personal: 0.5, official: 0.4 },
  ],
  breakdown: [],
};

describe("EmbedCalcShell", () => {
  it("renders personal IPC, official IPC, and difference", async () => {
    render(
      <EmbedCalcShell
        result={RESULT}
        isCustom
        startMonth="2024-01"
        endMonth="2025-01"
      />,
    );
    expect(screen.getByText(/Tu IPC personal/i)).toBeInTheDocument();
    expect(screen.getByText(/IPC oficial/i)).toBeInTheDocument();
    expect(screen.getByText(/Diferencia/i)).toBeInTheDocument();
    expect(screen.getByText(/\+3\.21%/)).toBeInTheDocument();
    expect(screen.getByText(/\+2\.50%/)).toBeInTheDocument();
    expect(screen.getByText(/\+0\.71 pp/)).toBeInTheDocument();
  });

  it("passes evolution data through to the evolution chart", async () => {
    render(
      <EmbedCalcShell
        result={RESULT}
        isCustom
        startMonth="2024-01"
        endMonth="2025-01"
      />,
    );
    expect(await screen.findByTestId("evolution-chart")).toBeInTheDocument();
    expect(screen.getByTestId("points")).toHaveTextContent("2");
    expect(screen.getByTestId("is-custom")).toHaveTextContent("true");
  });

  it("renders an INE attribution link to tu-ipc.es", () => {
    render(
      <EmbedCalcShell
        result={RESULT}
        isCustom={false}
        startMonth="2024-01"
        endMonth="2025-01"
      />,
    );
    const link = screen.getByRole("link", { name: /tu-ipc\.es/i });
    expect(link).toHaveAttribute("href", "https://tu-ipc.es");
  });

  it("does not render the global header or footer chrome", () => {
    render(
      <EmbedCalcShell
        result={RESULT}
        isCustom
        startMonth="2024-01"
        endMonth="2025-01"
      />,
    );
    expect(
      screen.queryByRole("heading", { name: /Tu IPC Personal/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Política de privacidad/i)).not.toBeInTheDocument();
  });
});
