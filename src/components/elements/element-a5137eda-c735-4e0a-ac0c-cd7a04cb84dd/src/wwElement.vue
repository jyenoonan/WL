<template>
  <div class="component-root-container">
    <div
      class="chart-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--title-color': content.titleColor,
        '--bar-color': content.barColor,
        '--bar-hover-color': content.barHoverColor,
        '--grid-color': content.gridColor,
        '--axis-label-color': content.axisLabelColor,
        '--tooltip-bg-color': content.tooltipBackgroundColor,
        '--tooltip-text-color': content.tooltipTextColor
      }"
    >
      <h2 class="title">{{ content.title }}</h2>

      <div class="chart-area" ref="chartAreaRef">
        <svg v-if="height > 0 && width > 0" class="chart-svg" :viewBox="`0 0 ${width} ${height}`">
          <g v-if="content.showGrid" class="grid">
            <g v-for="line in yAxisLines" :key="line.value">
              <line :x1="yAxisWidth" :y1="line.y" :x2="width" :y2="line.y" />
              <text :x="yAxisWidth - 8" :y="line.y">{{ line.value }}</text>
            </g>
          </g>

          <g class="bars">
            <rect
              v-for="bar in bars"
              :key="bar.label"
              class="bar"
              :x="bar.x"
              :y="bar.y"
              :rx="content.barRadius"
              :width="bar.width"
              :height="bar.height"
              @mouseover="handleMouseOver(bar, $event)"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            />
          </g>

          <g class="x-axis">
             <text v-for="bar in bars" :key="bar.label" :x="bar.x + bar.width / 2" :y="height - 10">{{ bar.label }}</text>
          </g>
        </svg>

        <div v-if="tooltip.visible" class="tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
            <div class="tooltip-label">{{ tooltip.label }}</div>
            <div class="tooltip-value">{{ tooltip.value }}</div>
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
    // ✅ FIX: Increased bottom padding to prevent overhang
    const xAxisHeight = 30;

    const onResize = ([entry]) => {
        width.value = entry.contentRect.width;
        height.value = entry.contentRect.height;
    };

    useResizeObserver(chartAreaRef, onResize);

    const data = computed(() => props.content.data || []);
    const valueField = computed(() => props.content.valueField || 'value');
    const labelField = computed(() => props.content.labelField || 'label');
    
    const maxValue = computed(() => {
        if (data.value.length === 0) return 100;
        const max = Math.max(...data.value.map(item => item[valueField.value] || 0));
        if (max === 0) return 100;
        return Math.ceil(max / 10) * 10;
    });

    const yAxisLines = computed(() => {
        const chartHeight = height.value - xAxisHeight;
        const lines = [];
        for (let i = 0; i <= 4; i++) {
            const value = maxValue.value * (1 - i / 4);
            const y = chartHeight * (i / 4);
            lines.push({ value: Math.round(value), y });
        }
        return lines;
    });

    const bars = computed(() => {
        if (data.value.length === 0) return [];
        const chartWidth = width.value - yAxisWidth;
        const chartHeight = height.value - xAxisHeight;
        const barWidth = (chartWidth / data.value.length) * 0.6;
        const barMargin = (chartWidth / data.value.length) * 0.4;
        
        return data.value.map((item, index) => {
            const value = item[valueField.value] || 0;
            const barHeight = (value / maxValue.value) * chartHeight;
            return {
                label: item[labelField.value],
                value: value,
                x: yAxisWidth + index * (barWidth + barMargin) + barMargin / 2,
                y: chartHeight - barHeight,
                width: barWidth,
                height: barHeight,
            }
        });
    });

    const tooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '' });
    const handleMouseOver = (bar, event) => {
        if (!props.content.showTooltip) return;
        tooltip.value.visible = true;
        tooltip.value.label = bar.label;
        tooltip.value.value = bar.value;
    };
    const handleMouseMove = (event) => {
        tooltip.value.x = event.clientX + 15;
        tooltip.value.y = event.clientY;
    };
    const handleMouseLeave = () => {
        tooltip.value.visible = false;
    };
    
    return {
      chartAreaRef,
      width,
      height,
      yAxisWidth,
      yAxisLines,
      bars,
      tooltip,
      handleMouseOver,
      handleMouseMove,
      handleMouseLeave,
    };
  },
};
</script>

<style lang="scss" scoped>
.component-root-container {
  width: 100%;
  height: 100%;
}
.chart-wrapper {
  font-family: 'Inter', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--background-color, #1e293b);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  color: white;
}
.title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: var(--title-color, #f1f5f9);
    flex-shrink: 0;
}
.chart-area {
    position: relative;
    width: 100%;
    height: 100%;
}
.chart-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}
.grid line {
    stroke: var(--grid-color, #334155);
    stroke-width: 1;
    shape-rendering: crispEdges;
}
.grid text, .x-axis text {
    font-size: 0.75rem;
    fill: var(--axis-label-color, #94a3b8);
    text-anchor: end;
    dominant-baseline: middle;
}
.x-axis text {
    text-anchor: middle;
    dominant-baseline: hanging;
}
.bar {
    fill: var(--bar-color, #3b82f6);
    transition: fill 0.2s ease;
    &:hover {
        fill: var(--bar-hover-color, #60a5fa);
    }
}
.tooltip {
    position: fixed;
    transform: translate(-50%, calc(-100% - 10px));
    background-color: var(--tooltip-bg-color, #0f172a);
    color: var(--tooltip-text-color, #f1f5f9);
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    pointer-events: none;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    text-align: center;
    white-space: nowrap;
    .tooltip-value {
        font-weight: 600;
    }
}
</style>