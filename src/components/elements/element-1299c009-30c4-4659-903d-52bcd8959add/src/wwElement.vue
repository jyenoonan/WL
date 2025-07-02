<template>
  <div class="component-root-container">
    <div
      class="chart-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--title-color': content.titleColor,
        '--subtitle-color': content.subtitleColor,
        '--line-color': content.lineColor,
        '--line-width': `${content.lineWidth}px`,
        '--area-color-top': content.areaColorTop,
        '--area-color-bottom': content.areaColorBottom,
        '--point-color': content.pointColor,
        '--point-border-color': content.pointBorderColor,
        '--grid-color': content.gridColor,
        '--axis-label-color': content.axisLabelColor,
      }"
    >
      <div class="header">
        <h2 class="title">{{ content.title }}</h2>
        <h3 class="subtitle">{{ content.subtitle }}</h3>
      </div>

      <div class="chart-area" ref="chartAreaRef" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
        <svg v-if="height > 0 && width > 0" class="chart-svg" :viewBox="`0 0 ${width} ${height}`">
            <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" class="gradient-start" />
                    <stop offset="100%" class="gradient-end" />
                </linearGradient>
            </defs>
            
            <g v-if="content.showGrid" class="grid">
                <g v-for="line in yAxisLines" :key="line.value">
                <line :x1="yAxisWidth" :y1="line.y" :x2="width" :y2="line.y" />
                <text :x="yAxisWidth - 8" :y="line.y">{{ line.value }}</text>
                </g>
            </g>

            <g class="chart-paths">
                <path v-if="content.showArea" class="area-path" :d="areaPath" />
                <path class="line-path" :d="linePath" />
            </g>

            <g v-if="content.showPoints" class="points">
                <circle v-for="point in dataPoints" :key="point.xField" :cx="point.x" :cy="point.y" r="4" class="data-point" />
            </g>

            <g v-if="hoveredPoint" class="hover-indicator">
                <line class="scrubber-line" y1="0" :y2="height - xAxisHeight" :x1="hoveredPoint.x" :x2="hoveredPoint.x" />
                <circle class="hover-point" :cx="hoveredPoint.x" :cy="hoveredPoint.y" r="6" />
            </g>

            <g class="x-axis">
                <text v-for="point in dataPoints" :key="point.xField" :x="point.x" :y="height - 10">{{ point.xField }}</text>
            </g>
        </svg>

        <div v-if="hoveredPoint" class="tooltip" :style="tooltipStyle">
            <div class="tooltip-label">{{ xField }}: {{ hoveredPoint.xField }}</div>
            <div class="tooltip-value">{{ yField }}: {{ hoveredPoint.yField }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const useResizeObserver = (el, callback) => {
    const observer = new ResizeObserver(callback);
    onMounted(() => el.value && observer.observe(el.value));
    onUnmounted(() => observer.disconnect());
};

export default {
  props: {
    content: { type: Object, required: true },
  },
  setup(props) {
    const chartAreaRef = ref(null);
    const width = ref(0);
    const height = ref(0);
    
    const yAxisWidth = 30;
    const xAxisHeight = 30;

    const onResize = ([entry]) => {
        width.value = entry.contentRect.width;
        height.value = entry.contentRect.height;
    };
    useResizeObserver(chartAreaRef, onResize);

    const data = computed(() => props.content.data || []);
    const xField = computed(() => props.content.xField || 'x');
    const yField = computed(() => props.content.yField || 'y');

    const scale = computed(() => {
        const xValues = data.value.map(d => d[xField.value] || 0);
        const yValues = data.value.map(d => d[yField.value] || 0);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMax = yValues.length > 0 ? Math.max(...yValues) : 100;
        const yTop = Math.ceil(yMax / 10) * 10; // Round up to nearest 10

        const chartWidth = width.value - yAxisWidth;
        const chartHeight = height.value - xAxisHeight;

        return {
            x: (val) => yAxisWidth + ((val - xMin) / (xMax - xMin)) * chartWidth,
            y: (val) => chartHeight - (val / yTop) * chartHeight,
            yMax: yTop,
        };
    });

    const dataPoints = computed(() => {
        if (!width.value || data.value.length === 0) return [];
        return data.value.map(d => ({
            x: scale.value.x(d[xField.value]),
            y: scale.value.y(d[yField.value]),
            xField: d[xField.value],
            yField: d[yField.value],
        }));
    });

    const linePath = computed(() => dataPoints.value.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' '));

    const areaPath = computed(() => {
        const path = linePath.value;
        const lastPoint = dataPoints.value[dataPoints.value.length - 1];
        const firstPoint = dataPoints.value[0];
        if (!path) return '';
        return `${path} L ${lastPoint.x} ${height.value - xAxisHeight} L ${firstPoint.x} ${height.value - xAxisHeight} Z`;
    });

    const yAxisLines = computed(() => {
        const chartHeight = height.value - xAxisHeight;
        const lines = [];
        for (let i = 0; i <= 4; i++) {
            const value = scale.value.yMax * (1 - i / 4);
            lines.push({ value: Math.round(value), y: chartHeight * (i / 4) });
        }
        return lines;
    });

    // Hover logic
    const hoveredPoint = ref(null);
    const mouseX = ref(0);
    const tooltipStyle = computed(() => {
        if (!chartAreaRef.value) return { display: 'none' };
        const chartRect = chartAreaRef.value.getBoundingClientRect();
        const x = mouseX.value - chartRect.left;
        const left = hoveredPoint.value.x + chartRect.left;
        // Position tooltip to stay within the chart area
        const containerWidth = chartRect.width;
        const tooltipWidth = 150; // Estimated tooltip width
        const finalLeft = (left + tooltipWidth / 2) > containerWidth + chartRect.left
          ? containerWidth + chartRect.left - tooltipWidth
          : left - tooltipWidth / 2;

        return {
          display: 'block',
          top: `${chartRect.top}px`,
          left: `${Math.max(chartRect.left, finalLeft)}px`,
        };
    });

    const handleMouseMove = (event) => {
        if (dataPoints.value.length === 0) return;
        const chartRect = chartAreaRef.value.getBoundingClientRect();
        mouseX.value = event.clientX;
        const currentX = event.clientX - chartRect.left;
        
        const closestPoint = dataPoints.value.reduce((prev, curr) => 
            Math.abs(curr.x - currentX) < Math.abs(prev.x - currentX) ? curr : prev
        );
        hoveredPoint.value = closestPoint;
    };
    const handleMouseLeave = () => {
        hoveredPoint.value = null;
    };
    
    return {
      chartAreaRef, width, height, yAxisWidth, xAxisHeight, scale,
      dataPoints, linePath, areaPath, yAxisLines, xField, yField,
      hoveredPoint, tooltipStyle, handleMouseMove, handleMouseLeave,
    };
  },
};
</script>

<style lang="scss" scoped>
.component-root-container { width: 100%; height: 100%; }
.chart-wrapper {
  font-family: 'Inter', -apple-system, sans-serif;
  display: flex; flex-direction: column; width: 100%; height: 100%;
  box-sizing: border-box; background-color: var(--background-color);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  color: white;
}
.header { margin-bottom: 1.5rem; flex-shrink: 0; }
.title { font-size: 1.25rem; font-weight: 600; margin: 0; color: var(--title-color); }
.subtitle { font-size: 0.875rem; font-weight: 400; margin: 0.25rem 0 0 0; color: var(--subtitle-color); }

.chart-area { position: relative; width: 100%; height: 100%; }
.chart-svg { width: 100%; height: 100%; overflow: visible; }

.grid line { stroke: var(--grid-color); stroke-width: 1; shape-rendering: crispEdges; }
.grid text, .x-axis text { font-size: 0.75rem; fill: var(--axis-label-color); text-anchor: end; dominant-baseline: middle; }
.x-axis text { text-anchor: middle; }

.line-path { fill: none; stroke: var(--line-color); stroke-width: var(--line-width); stroke-linejoin: round; stroke-linecap: round; }
.gradient-start { stop-color: var(--area-color-top); }
.gradient-end { stop-color: var(--area-color-bottom); }
.area-path { stroke: none; fill: url(#area-gradient); }

.data-point {
    stroke: var(--point-border-color);
    stroke-width: 2px;
    fill: var(--point-color);
}
.hover-indicator line { stroke: var(--grid-color); stroke-width: 1; stroke-dasharray: 4 4; }
.hover-indicator circle { stroke: var(--point-border-color); stroke-width: 2px; fill: var(--point-color); }

.tooltip {
    position: fixed;
    padding: 0.5rem 0.75rem;
    background-color: #0f172a;
    border: 1px solid var(--grid-color);
    color: #f1f5f9;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    pointer-events: none;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    text-align: center;
    white-space: nowrap;
    transition: opacity 0.2s;
    .tooltip-value { font-weight: 600; }
}
</style>