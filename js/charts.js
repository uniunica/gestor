// Charts functionality for SGP System
class SGPCharts {
  constructor() {
    this.chartInstances = new Map();
    this.defaultColors = [
      "#6B46C1",
      "#8B5CF6",
      "#A78BFA",
      "#C4B5FD",
      "#DDD6FE",
      "#059669",
      "#10B981",
      "#34D399",
      "#6EE7B7",
      "#A7F3D0",
    ];
  }

  // Create a simple chart using HTML/CSS (fallback for when Chart.js is not available)
  createSimpleChart(containerId, data, type = "bar") {
    const container = document.getElementById(containerId);
    if (!container) return;

    switch (type) {
      case "bar":
        this.createSimpleBarChart(container, data);
        break;
      case "line":
        this.createSimpleLineChart(container, data);
        break;
      case "pie":
        this.createSimplePieChart(container, data);
        break;
      case "donut":
        this.createSimpleDonutChart(container, data);
        break;
      default:
        this.createSimpleBarChart(container, data);
    }
  }

  createSimpleBarChart(container, data) {
    const maxValue = Math.max(...data.values);

    container.innerHTML = `
            <div class="simple-chart bar-chart">
                <div class="chart-bars">
                    ${data.labels
                      .map((label, index) => {
                        const height = (data.values[index] / maxValue) * 100;
                        const color =
                          this.defaultColors[index % this.defaultColors.length];
                        return `
                            <div class="bar-container">
                                <div class="bar" style="height: ${height}%; background-color: ${color};" title="${label}: ${data.values[index]}"></div>
                                <div class="bar-label">${label}</div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        `;
  }

  createSimpleLineChart(container, data) {
    const maxValue = Math.max(...data.values);
    const minValue = Math.min(...data.values);
    const range = maxValue - minValue;

    const points = data.values
      .map((value, index) => {
        const x = (index / (data.values.length - 1)) * 100;
        const y = 100 - ((value - minValue) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    container.innerHTML = `
            <div class="simple-chart line-chart">
                <svg width="100%" height="200" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline points="${points}" fill="none" stroke="${
      this.defaultColors[0]
    }" stroke-width="2" vector-effect="non-scaling-stroke"/>
                    ${data.values
                      .map((value, index) => {
                        const x = (index / (data.values.length - 1)) * 100;
                        const y = 100 - ((value - minValue) / range) * 100;
                        return `<circle cx="${x}" cy="${y}" r="3" fill="${this.defaultColors[0]}" vector-effect="non-scaling-stroke"/>`;
                      })
                      .join("")}
                </svg>
                <div class="chart-labels">
                    ${data.labels
                      .map((label) => `<span class="label">${label}</span>`)
                      .join("")}
                </div>
            </div>
        `;
  }

  createSimplePieChart(container, data) {
    const total = data.values.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    const slices = data.values.map((value, index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      const largeArcFlag = angle > 180 ? 1 : 0;
      const x1 = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
      const y1 = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
      const x2 = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
      const y2 = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      const color = this.defaultColors[index % this.defaultColors.length];

      return {
        path: pathData,
        color: color,
        label: data.labels[index],
        value: value,
        percentage: percentage.toFixed(1),
      };
    });

    container.innerHTML = `
            <div class="simple-chart pie-chart">
                <svg width="200" height="200" viewBox="0 0 100 100">
                    ${slices
                      .map(
                        (slice) =>
                          `<path d="${slice.path}" fill="${slice.color}" stroke="#fff" stroke-width="1" title="${slice.label}: ${slice.value}"/>`
                      )
                      .join("")}
                </svg>
                <div class="pie-legend">
                    ${slices
                      .map(
                        (slice) => `
                        <div class="legend-item">
                            <div class="legend-color" style="background-color: ${slice.color}"></div>
                            <span class="legend-text">${slice.label}: ${slice.percentage}%</span>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  createSimpleDonutChart(container, data) {
    const total = data.values.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    const slices = data.values.map((value, index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      const largeArcFlag = angle > 180 ? 1 : 0;
      const x1 = 50 + 35 * Math.cos(((startAngle - 90) * Math.PI) / 180);
      const y1 = 50 + 35 * Math.sin(((startAngle - 90) * Math.PI) / 180);
      const x2 = 50 + 35 * Math.cos(((endAngle - 90) * Math.PI) / 180);
      const y2 = 50 + 35 * Math.sin(((endAngle - 90) * Math.PI) / 180);
      const x3 = 50 + 20 * Math.cos(((endAngle - 90) * Math.PI) / 180);
      const y3 = 50 + 20 * Math.sin(((endAngle - 90) * Math.PI) / 180);
      const x4 = 50 + 20 * Math.cos(((startAngle - 90) * Math.PI) / 180);
      const y4 = 50 + 20 * Math.sin(((startAngle - 90) * Math.PI) / 180);

      const pathData = `M ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A 20 20 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
      const color = this.defaultColors[index % this.defaultColors.length];

      return {
        path: pathData,
        color: color,
        label: data.labels[index],
        value: value,
        percentage: percentage.toFixed(1),
      };
    });

    container.innerHTML = `
            <div class="simple-chart donut-chart">
                <svg width="200" height="200" viewBox="0 0 100 100">
                    ${slices
                      .map(
                        (slice) =>
                          `<path d="${slice.path}" fill="${slice.color}" stroke="#fff" stroke-width="1" title="${slice.label}: ${slice.value}"/>`
                      )
                      .join("")}
                    <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="#374151">
                        Total: ${total}
                    </text>
                </svg>
                <div class="donut-legend">
                    ${slices
                      .map(
                        (slice) => `
                        <div class="legend-item">
                            <div class="legend-color" style="background-color: ${slice.color}"></div>
                            <span class="legend-text">${slice.label}: ${slice.percentage}%</span>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

  // Generate sample data for demonstrations
  generateSampleData(type = "monthly") {
    switch (type) {
      case "monthly":
        return {
          labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
          values: [12, 19, 15, 25, 22, 30],
        };
      case "status":
        return {
          labels: ["Ativo", "Inativo", "Pendente"],
          values: [45, 8, 12],
        };
      case "regions":
        return {
          labels: ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"],
          values: [35, 20, 25, 15, 5],
        };
      case "performance":
        return {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          values: [85, 92, 78, 96],
        };
      default:
        return {
          labels: ["A", "B", "C", "D"],
          values: [10, 20, 15, 25],
        };
    }
  }

  // Initialize charts for dashboard
  initializeDashboardCharts() {
    // Parceiros evolution chart
    this.createSimpleChart(
      "parceirosChart",
      this.generateSampleData("monthly"),
      "line"
    );

    // Polos distribution chart
    this.createSimpleChart(
      "polosChart",
      this.generateSampleData("regions"),
      "pie"
    );

    // Performance chart
    this.createSimpleChart(
      "performanceChart",
      this.generateSampleData("performance"),
      "bar"
    );

    // Status chart
    this.createSimpleChart(
      "statusChart",
      this.generateSampleData("status"),
      "donut"
    );
  }

  // Destroy chart instance
  destroyChart(chartId) {
    if (this.chartInstances.has(chartId)) {
      const chart = this.chartInstances.get(chartId);
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
      this.chartInstances.delete(chartId);
    }
  }

  // Destroy all charts
  destroyAllCharts() {
    this.chartInstances.forEach((chart, id) => {
      this.destroyChart(id);
    });
  }
}

// CSS for simple charts
const chartStyles = `
<style>
.simple-chart {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.bar-chart .chart-bars {
    display: flex;
    align-items: end;
    justify-content: space-around;
    width: 100%;
    height: 200px;
    padding: 20px 0;
}

.bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    margin: 0 2px;
}

.bar {
    width: 100%;
    max-width: 40px;
    min-height: 5px;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease;
    cursor: pointer;
}

.bar:hover {
    opacity: 0.8;
    transform: translateY(-2px);
}

.bar-label {
    margin-top: 8px;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
}

.line-chart {
    position: relative;
}

.line-chart svg {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--background-light);
}

.chart-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding: 0 10px;
}

.chart-labels .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.pie-chart, .donut-chart {
    display: flex;
    align-items: center;
    gap: 20px;
}

.pie-legend, .donut-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.legend-text {
    font-size: 0.875rem;
    color: var(--text-primary);
}

@media (max-width: 768px) {
    .pie-chart, .donut-chart {
        flex-direction: column;
        gap: 15px;
    }
    
    .bar-chart .chart-bars {
        height: 150px;
    }
    
    .chart-labels .label {
        font-size: 0.625rem;
    }
}
</style>
`;

// Inject chart styles
if (!document.getElementById("chart-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "chart-styles";
  styleElement.innerHTML = chartStyles;
  document.head.appendChild(styleElement);
}

// Global charts instance
window.sgpCharts = new SGPCharts();
