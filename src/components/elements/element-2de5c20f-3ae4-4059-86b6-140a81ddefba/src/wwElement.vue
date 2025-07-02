<template>
  <div class="component-root-container">
    <div
      class="chart-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--title-color': content.titleColor,
        '--legend-text-color': content.legendTextColor,
        '--slice-border-color': content.sliceBorderColor,
      }"
    >
      <h2 class="title">{{ content.title }}</h2>
      <div class="main-content">
        <div class="chart-area" ref="chartAreaRef">
          <svg v-if="width > 0" class="chart-svg" :viewBox="`0 0 ${width} ${width}`">
            <g :transform="`translate(${width / 2}, ${width / 2})`">
              <path
                v-for="(slice, index) in slices"
                :key="index"
                :d="slice.path"
                :fill="slice.color"
                class="slice-path"
                :style="{ 'stroke-width': `${content.sliceBorderWidth}px` }"
                :transform="activeSliceIndex === index ? `scale(1.05)` : 'scale(1)'"
                @click="handleSliceClick(index)"
                @mouseover="handleMouseOver(index, $event)"
                @mouseleave="handleMouseLeave"
              />
            </g>
          </svg>
        </div>
        <div v-if="content.showLegend" class="legend-container">
            <div
                v-for="(slice, index) in slices"
                :key="index"
                class="legend-item"
                @click="handleSliceClick(index)"
                @mouseover="handleMouseOver(index, $event)"
                @mouseleave="handleMouseLeave"
            >
                <div class="legend-dot" :style="{ backgroundColor: slice.color }"></div>
                <div class="legend-label">{{ slice.label }}</div>
                <div class="legend-value">{{ slice.percentage }}%</div>
            </div>
        </div>
      </div>
      <div v-if="tooltip.visible" class="tooltip" :style="{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }">
        <div class="tooltip-label">{{ tooltip.label }}</div>
        <div class="tooltip-value">{{ tooltip.value }} ({{ tooltip.percentage }}%)</div>
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

// Helper to create the SVG path for a pie slice
const getSlicePath = (startAngle, endAngle, radius) => {
    const x1 = radius * Math.cos(startAngle);
    const y1 = radius * Math.sin(startAngle);
    const x2 = radius * Math.cos(endAngle);
    const y2 = radius * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0 Z`;
};

export default {
  props: {
    content: { type: Object, required: true },
  },
  setup(props) {
    const chartAreaRef = ref(null);
    const width = ref(0);
    
    useResizeObserver(chartAreaRef, ([entry]) => {
        width.value = Math.min(entry.contentRect.width, entry.contentRect.height);
    });

    const data = computed(() => props.content.data || []);
    const labelField = computed(() => props.content.labelField || 'source');
    const valueField = computed(() => props.content.valueField || 'value');
    
    const totalValue = computed(() => data.value.reduce((sum, item) => sum + (item[valueField.value] || 0), 0));
    
    const slices = computed(() => {
        if (totalValue.value === 0) return [];
        const radius = width.value / 2;
        let startAngle = -Math.PI / 2; // Start at the top

        return data.value.map((item, index) => {
            const value = item[valueField.value] || 0;
            const percentage = (value / totalValue.value);
            const angle = percentage * 2 * Math.PI;
            const endAngle = startAngle + angle;
            
            const slice = {
                label: item[labelField.value],
                value: value,
                percentage: (percentage * 100).toFixed(1),
                path: getSlicePath(startAngle, endAngle, radius),
                color: props.content.sliceColors[index % props.content.sliceColors.length],
            };
            startAngle = endAngle;
            return slice;
        });
    });

    const activeSliceIndex = ref(null);
    const handleSliceClick = (index) => {
        activeSliceIndex.value = activeSliceIndex.value === index ? null : index;
    };
    
    // Tooltip logic
    const tooltip = ref({ visible: false, x: 0, y: 0, label: '', value: '', percentage: '' });
    const handleMouseOver = (index, event) => {
        if (!props.content.showTooltip || slices.value.length === 0) return;
        const slice = slices.value[index];
        tooltip.value = {
            visible: true,
            label: slice.label,
            value: slice.value.toLocaleString(),
            percentage: slice.percentage,
            x: event.clientX + 15,
            y: event.clientY,
        };
    };
    const handleMouseLeave = () => {
        tooltip.value.visible = false;
    };
    
    return {
      chartAreaRef, width, slices, activeSliceIndex, handleSliceClick,
      tooltip, handleMouseOver, handleMouseLeave
    };
  },
};
</script>

<style lang="scss" scoped>
.component-root-container { width: 100%; height: 100%; }
.chart-wrapper {
  font-family: 'Inter', -apple-system, sans-serif;
  display: flex; flex-direction: column; width: 100%; height: 100%;
  box-sizing: border-box; background-color: var(--background-color, #1e293b);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
.title {
    font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem 0;
    color: var(--title-color, #f1f5f9);
    flex-shrink: 0;
}
.main-content {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 2rem;
}
.chart-area {
    position: relative;
    width: 60%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.chart-svg {
    width: 100%;
    height: 100%;
    max-width: 400px;
    overflow: visible;
}
.slice-path {
    cursor: pointer;
    stroke: var(--slice-border-color);
    transition: transform 0.2s ease-out;
}
.legend-container {
    width: 40%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.legend-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
    &:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
}
.legend-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    flex-shrink: 0;
}
.legend-label {
    color: var(--legend-text-color, #cbd5e0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
}
.legend-value {
    color: var(--legend-text-color, #cbd5e0);
    font-weight: 500;
}
.tooltip {
    position: fixed;
    transform: translate(0, -50%);
    background-color: #0f172a;
    color: #f1f5f9;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    pointer-events: none;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    text-align: center;
    white-space: nowrap;
    border: 1px solid #334155;
    .tooltip-value { font-weight: 600; }
}
</style>