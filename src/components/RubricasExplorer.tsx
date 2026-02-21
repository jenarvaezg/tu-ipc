import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import rubricasDataUrl from "@/data/ipc-rubricas.json?url";
import type { RubricasData, RubricaSeries } from "@/data/rubricasTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMonth } from "@/utils/formatMonth";
import {
  buildAccumulatedSeries,
  computeGeneralBenchmark,
} from "@/utils/accumulatedInflation";

const MAX_SELECTED_SERIES = 6;

const COLOR_PALETTE = [
  "hsl(var(--rubricas-1))",
  "hsl(var(--rubricas-2))",
  "hsl(var(--rubricas-3))",
  "hsl(var(--rubricas-4))",
  "hsl(var(--rubricas-5))",
  "hsl(var(--rubricas-6))",
];

const MONTH_NAMES_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

interface RubricasURLState {
  selectedSeriesIds: string[];
  fromMonth?: string;
  toMonth?: string;
}

function isMonthLabel(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value));
}

function parseRubricasURLState(): RubricasURLState {
  const params = new URLSearchParams(window.location.search);
  const rs = params.get("rs");
  const rf = params.get("rf");
  const re = params.get("re");

  return {
    selectedSeriesIds: rs ? rs.split(",").filter(Boolean) : [],
    fromMonth: isMonthLabel(rf) ? rf : undefined,
    toMonth: isMonthLabel(re) ? re : undefined,
  };
}

function formatTick(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES_SHORT[parseInt(m, 10) - 1]} ${year.slice(2)}`;
}

function dataKeyForSeries(seriesId: string): string {
  return `series_${seriesId.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function colorFromSeriesId(seriesId: string): string {
  let hash = 0;
  for (let i = 0; i < seriesId.length; i += 1) {
    hash = (hash * 31 + seriesId.charCodeAt(i)) | 0;
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

function getDefaultSelection(
  series: RubricaSeries[],
  baseMonth: string,
  endMonth: string,
): string[] {
  const ranked = series
    .map((item) => ({
      id: item.id,
      endAccumulated: computeGeneralBenchmark(item.points, baseMonth, endMonth),
    }))
    .filter((item) => item.endAccumulated != null)
    .sort(
      (a, b) =>
        Math.abs(b.endAccumulated ?? 0) - Math.abs(a.endAccumulated ?? 0),
    );

  return ranked.slice(0, 4).map((item) => item.id);
}

export default function RubricasExplorer() {
  const [rubricasData, setRubricasData] = useState<RubricasData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<string[]>([]);
  const [selectionNotice, setSelectionNotice] = useState<string>("");
  const [isWideViewport, setIsWideViewport] = useState(
    () => window.innerWidth >= 1024,
  );
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const response = await fetch(rubricasDataUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const parsed = (await response.json()) as RubricasData;
        if (!cancelled) {
          setRubricasData(parsed);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Error desconocido",
          );
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsWideViewport(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const baseMonth = rubricasData?.baseMonth ?? "2002-01";
  const timeline = useMemo(
    () =>
      rubricasData
        ? rubricasData.months.filter((month) => month >= baseMonth)
        : [],
    [baseMonth, rubricasData],
  );
  const defaultEndMonth = timeline[timeline.length - 1] ?? "";

  const classSeries = useMemo(
    () =>
      rubricasData
        ? rubricasData.series.filter((item) => item.level === "clase")
        : [],
    [rubricasData],
  );
  const generalSeries = useMemo(
    () =>
      rubricasData?.series.find(
        (item) => item.level === "grupo" && item.codigo === "00",
      ),
    [rubricasData],
  );

  const subgroupCatalog = useMemo(
    () =>
      new Map(
        (rubricasData?.catalog ?? [])
          .filter((node) => node.level === "subgrupo")
          .map((node) => [node.id, node]),
      ),
    [rubricasData],
  );
  const groupCatalog = useMemo(
    () =>
      new Map(
        (rubricasData?.catalog ?? [])
          .filter((node) => node.level === "grupo")
          .map((node) => [node.id, node]),
      ),
    [rubricasData],
  );
  const classSeriesById = useMemo(
    () => new Map(classSeries.map((item) => [item.id, item])),
    [classSeries],
  );

  useEffect(() => {
    if (!rubricasData || timeline.length === 0 || initializedRef.current)
      return;

    const urlState = parseRubricasURLState();
    const validIds = new Set(classSeries.map((item) => item.id));

    const nextFrom =
      urlState.fromMonth && timeline.includes(urlState.fromMonth)
        ? urlState.fromMonth
        : baseMonth;
    const rawTo =
      urlState.toMonth && timeline.includes(urlState.toMonth)
        ? urlState.toMonth
        : defaultEndMonth;
    const nextTo = rawTo < nextFrom ? nextFrom : rawTo;

    const parsedSelection = urlState.selectedSeriesIds
      .filter((id) => validIds.has(id))
      .slice(0, MAX_SELECTED_SERIES);

    setFromMonth(nextFrom);
    setToMonth(nextTo);
    setSelectedSeriesIds(
      parsedSelection.length > 0
        ? parsedSelection
        : getDefaultSelection(classSeries, baseMonth, nextTo),
    );

    initializedRef.current = true;
  }, [baseMonth, classSeries, defaultEndMonth, rubricasData, timeline]);

  useEffect(() => {
    if (!rubricasData || !fromMonth || !toMonth || !defaultEndMonth) return;

    const params = new URLSearchParams(window.location.search);

    if (selectedSeriesIds.length > 0) {
      params.set("rs", selectedSeriesIds.join(","));
    } else {
      params.delete("rs");
    }

    if (fromMonth !== baseMonth) {
      params.set("rf", fromMonth);
    } else {
      params.delete("rf");
    }

    if (toMonth !== defaultEndMonth) {
      params.set("re", toMonth);
    } else {
      params.delete("re");
    }

    const search = params.toString();
    const nextURL = search
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextURL);
  }, [
    baseMonth,
    defaultEndMonth,
    fromMonth,
    rubricasData,
    selectedSeriesIds,
    toMonth,
  ]);

  const searchId = useId();
  const listId = useId();
  const fromMonthId = useId();
  const toMonthId = useId();
  const selectionStatusId = useId();

  const filteredSeries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const rows = classSeries.map((item) => {
      const subgroup = item.parentRubricaId
        ? subgroupCatalog.get(item.parentRubricaId)
        : undefined;
      const group = subgroup?.parentIds?.[0]
        ? groupCatalog.get(subgroup.parentIds[0])
        : undefined;

      return {
        series: item,
        groupName: group?.nombre || "Otros grupos",
        subgroupName: subgroup?.nombre || "Otros subgrupos",
      };
    });

    if (!query) {
      return rows.sort(
        (a, b) =>
          a.groupName.localeCompare(b.groupName, "es") ||
          a.subgroupName.localeCompare(b.subgroupName, "es") ||
          a.series.nombre.localeCompare(b.series.nombre, "es"),
      );
    }

    return rows
      .filter((row) => {
        const target =
          `${row.series.codigo} ${row.series.nombre} ${row.subgroupName} ${row.groupName}`.toLowerCase();
        return target.includes(query);
      })
      .sort(
        (a, b) =>
          a.groupName.localeCompare(b.groupName, "es") ||
          a.subgroupName.localeCompare(b.subgroupName, "es") ||
          a.series.nombre.localeCompare(b.series.nombre, "es"),
      );
  }, [classSeries, groupCatalog, searchQuery, subgroupCatalog]);

  const visibleMonths = useMemo(
    () => timeline.filter((month) => month >= fromMonth && month <= toMonth),
    [fromMonth, timeline, toMonth],
  );

  const selectedSeries = useMemo(
    () =>
      selectedSeriesIds
        .map((id) => classSeriesById.get(id))
        .filter((item): item is RubricaSeries => Boolean(item)),
    [classSeriesById, selectedSeriesIds],
  );

  const seriesLines = useMemo(() => {
    return selectedSeries.map((item) => ({
      id: item.id,
      name: item.nombre,
      code: item.codigo,
      color: colorFromSeriesId(item.id),
      dataKey: dataKeyForSeries(item.id),
      accumulated: buildAccumulatedSeries(
        item.points,
        baseMonth,
        visibleMonths,
      ),
    }));
  }, [baseMonth, selectedSeries, visibleMonths]);

  const benchmarkValue = useMemo(() => {
    if (!generalSeries || visibleMonths.length === 0) return null;
    return computeGeneralBenchmark(
      generalSeries.points,
      baseMonth,
      visibleMonths[visibleMonths.length - 1],
    );
  }, [baseMonth, generalSeries, visibleMonths]);

  const chartData = useMemo(() => {
    return visibleMonths.map((month) => {
      const row: Record<string, number | string | null> = { month };
      for (const line of seriesLines) {
        const point = line.accumulated.find((item) => item.month === month);
        row[line.dataKey] = point?.value ?? null;
      }
      return row;
    });
  }, [seriesLines, visibleMonths]);

  const yDomain = useMemo<[number, number]>(() => {
    const values: number[] = [];

    if (benchmarkValue != null) values.push(benchmarkValue);

    for (const row of chartData) {
      for (const line of seriesLines) {
        const raw = row[line.dataKey];
        if (typeof raw === "number" && Number.isFinite(raw)) {
          values.push(raw);
        }
      }
    }

    if (values.length === 0) return [-10, 10];

    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) {
      const delta = Math.max(5, Math.abs(min) * 0.1);
      min -= delta;
      max += delta;
    }

    const padding = Math.max(5, (max - min) * 0.12);
    const domainMin = Math.floor((min - padding) / 10) * 10;
    const domainMax = Math.ceil((max + padding) / 10) * 10;
    return [domainMin, domainMax];
  }, [benchmarkValue, chartData, seriesLines]);

  const latestSeriesValues = useMemo(() => {
    const lastVisibleMonth = visibleMonths[visibleMonths.length - 1];
    if (!lastVisibleMonth) return [];

    return seriesLines
      .map((line) => {
        const lastPoint = line.accumulated.find(
          (item) => item.month === lastVisibleMonth,
        );
        return {
          ...line,
          value: lastPoint?.value ?? null,
        };
      })
      .filter((item) => item.value != null)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [seriesLines, visibleMonths]);

  const canAddMore = selectedSeriesIds.length < MAX_SELECTED_SERIES;
  const limitMessage = !canAddMore
    ? `Límite alcanzado: máximo ${MAX_SELECTED_SERIES} rúbricas.`
    : "";

  const handleToggleSeries = (seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      if (prev.includes(seriesId)) {
        setSelectionNotice("");
        return prev.filter((id) => id !== seriesId);
      }
      if (prev.length >= MAX_SELECTED_SERIES) {
        setSelectionNotice(
          `Límite alcanzado: máximo ${MAX_SELECTED_SERIES} rúbricas.`,
        );
        return prev;
      }
      setSelectionNotice("");
      return [...prev, seriesId];
    });
  };

  const handleFromMonthChange = (month: string) => {
    setFromMonth(month);
    if (toMonth && month > toMonth) {
      setToMonth(month);
    }
  };

  const handleToMonthChange = (month: string) => {
    setToMonth(month);
    if (fromMonth && month < fromMonth) {
      setFromMonth(month);
    }
  };

  const clearSelection = () => {
    setSelectionNotice("");
    setSelectedSeriesIds([]);
  };

  const resetSelection = () => {
    setSelectionNotice("");
    setSelectedSeriesIds(
      getDefaultSelection(classSeries, baseMonth, toMonth || defaultEndMonth),
    );
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No se pudo cargar el módulo de rúbricas ({loadError}).
        </CardContent>
      </Card>
    );
  }

  if (!rubricasData || !fromMonth || !toMonth) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Cargando rúbricas del INE...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <p className="text-sm font-medium text-foreground">
            Inflación acumulada por rúbricas desde {formatMonth(baseMonth)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Selecciona hasta {MAX_SELECTED_SERIES} clases ECOICOP y compáralas
            contra la referencia del IPC general.
          </p>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-base">Selector de rúbricas</CardTitle>
              <p
                className="mt-1 text-xs text-muted-foreground"
                id={selectionStatusId}
                aria-live="polite"
              >
                {selectedSeriesIds.length}/{MAX_SELECTED_SERIES} seleccionadas
                {selectionNotice ? ` · ${selectionNotice}` : ""}
                {!selectionNotice && limitMessage ? ` · ${limitMessage}` : ""}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={searchId}
                className="text-xs font-medium text-muted-foreground"
              >
                Buscar por código, nombre o subgrupo
              </label>
              <input
                id={searchId}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ej: 04.5 electricidad"
                aria-describedby={selectionStatusId}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  htmlFor={fromMonthId}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Desde
                </label>
                <Select value={fromMonth} onValueChange={handleFromMonthChange}>
                  <SelectTrigger id={fromMonthId} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeline.map((month) => (
                      <SelectItem key={`from-${month}`} value={month}>
                        {formatMonth(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={toMonthId}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Hasta
                </label>
                <Select value={toMonth} onValueChange={handleToMonthChange}>
                  <SelectTrigger id={toMonthId} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeline.map((month) => (
                      <SelectItem key={`to-${month}`} value={month}>
                        {formatMonth(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={resetSelection}>
                Selección sugerida
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={selectedSeriesIds.length === 0}
              >
                Limpiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              id={listId}
              className="max-h-[28rem] space-y-2 overflow-auto pr-1"
              role="group"
              aria-label="Listado de rúbricas disponibles"
            >
              {filteredSeries.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay resultados para tu búsqueda.
                </p>
              )}
              {filteredSeries.map((row) => {
                const selected = selectedSeriesIds.includes(row.series.id);
                const disabled = !selected && !canAddMore;

                return (
                  <button
                    key={row.series.id}
                    type="button"
                    onClick={() => handleToggleSeries(row.series.id)}
                    disabled={disabled}
                    className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    aria-pressed={selected}
                    aria-label={`${selected ? "Quitar" : "Seleccionar"} rúbrica ${row.series.codigo} ${row.series.nombre}`}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {row.series.codigo} · {row.series.nombre}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.groupName} · {row.subgroupName}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">
              Evolución acumulada (base {formatMonth(baseMonth)} = 0%)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Benchmark horizontal (rojo): IPC general acumulado hasta{" "}
              {formatMonth(toMonth)}
              {benchmarkValue != null ? ` · ${benchmarkValue.toFixed(1)}%` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSeries.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Selecciona al menos una rúbrica para mostrar el gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={560}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 8,
                    right: isWideViewport ? 200 : 16,
                    left: 0,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatTick}
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    stroke="hsl(var(--border))"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    stroke="hsl(var(--border))"
                    tickFormatter={(v: number) => `${v}%`}
                    domain={yDomain}
                  />
                  <Tooltip
                    labelFormatter={(value: string) => formatMonth(value)}
                    formatter={(
                      value: number | string | Array<number | string>,
                      name: string | number,
                    ) => {
                      const numericValue =
                        typeof value === "number"
                          ? value
                          : Array.isArray(value)
                            ? null
                            : Number(value);
                      const line = seriesLines.find(
                        (item) => item.dataKey === String(name),
                      );
                      return [
                        numericValue == null || Number.isNaN(numericValue)
                          ? "Sin dato"
                          : `${numericValue.toFixed(1)}%`,
                        line ? `${line.code} · ${line.name}` : String(name),
                      ];
                    }}
                    contentStyle={{
                      borderRadius: "var(--radius)",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                  />
                  {benchmarkValue != null && (
                    <ReferenceLine
                      y={benchmarkValue}
                      stroke="hsl(var(--rubricas-reference))"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      label={{
                        value: `IPC general ${benchmarkValue.toFixed(1)}%`,
                        fill: "hsl(var(--rubricas-reference))",
                        position: "insideBottomRight",
                        fontSize: 12,
                      }}
                    />
                  )}
                  {seriesLines.map((line) => (
                    <Line
                      key={line.id}
                      type="monotone"
                      dataKey={line.dataKey}
                      stroke={line.color}
                      strokeWidth={2.2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls={false}
                      label={
                        isWideViewport
                          ? (props) => {
                              const isLastPoint =
                                props.index === chartData.length - 1;
                              const value =
                                typeof props.value === "number"
                                  ? props.value
                                  : null;
                              if (
                                !isLastPoint ||
                                value == null ||
                                props.x == null ||
                                props.y == null
                              ) {
                                return <g />;
                              }
                              return (
                                <text
                                  x={Number(props.x) + 8}
                                  y={Number(props.y) + 4}
                                  fill={line.color}
                                  fontSize={11}
                                  fontWeight={600}
                                >
                                  {`${line.name.length > 20 ? line.name.slice(0, 20) + "…" : line.name} ${value.toFixed(1)}%`}
                                </text>
                              );
                            }
                          : undefined
                      }
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}

            {latestSeriesValues.length > 0 && (
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Valor acumulado en {formatMonth(toMonth)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {latestSeriesValues.map((item) => (
                    <Badge
                      key={`summary-${item.id}`}
                      variant="secondary"
                      className="flex items-center gap-2 border border-border bg-background text-xs text-foreground"
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="max-w-[16rem] truncate">
                        {item.code} · {item.name}
                      </span>
                      <span className="font-semibold">
                        {item.value!.toFixed(1)}%
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Fuente: INE (IPC, índices mensuales ECOICOP). Base fija para
              acumulado: {formatMonth(baseMonth)}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
