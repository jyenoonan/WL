<template>
  <div class="component-root-container">
    <div
      class="chart-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--title-color': content.titleColor,
        '--center-value-color': content.centerValueColor,
        '--center-subtext-color': content.centerSubtextColor,
        '--legend-text-color': content.legendTextColor,
        '--legend-value-color': content.legendValueColor,
        '--dropdown-text-color': content.dropdownTextColor,
      }"
    >
      <div class="chart-header">
        <h2 class="title" :style="{ fontSize: content.titleSize }">{{ content.title }}</h2>
        <div class="dropdown">
          <span>This Month</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div class="donut-chart-container">
        <svg :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`" class="donut-chart">
          <g>
            <circle
              v-for="(slice, index) in slices"
              :key="index"
              :cx="center"
              :cy="center"
              :r="radius"
              fill="transparent"
              :stroke="slice.color"
              :stroke-width="content.strokeWidth"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="slice.offset"
              :transform="`rotate(${slice.rotation} ${center} ${center})`"
            />
          </g>
          <text
            :x="center"
            y="49%"
            text-anchor="middle"
            dominant-baseline="text-after-edge"
            class="center-value"
            :style="{ fontSize: content.centerValueSize }"
          >
            {{ content.valuePrefix || '' }}{{ formattedTotalValue }}
          </text>
          <text
            :x="center"
            y="51%"
            text-anchor="middle"
            dominant-baseline="text-before-edge"
            class="center-subtext"
            :style="{ fontSize: content.centerSubTextSize }"
          >
            {{ content.centerSubText }}
          </text>
        </svg>
      </div>

      <div class="legend-container">
        <div
          v-for="item in dataWithPercentage"
          :key="item.name"
          class="legend-item"
          :style="{ fontSize: content.legendFontSize }"
        >
          <div class="legend-info">
            <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-name">{{ item.name }}</span>
          </div>
          <span class="legend-percentage">{{ item.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
  },
  setup(props) {
    const viewBoxSize = 100;
    const center = viewBoxSize / 2;
    const radius = computed(() => center - (props.content.strokeWidth || 12) / 2);
    const circumference = computed(() => 2 * Math.PI * radius.value);

    const totalValue = computed(() => {
      const valueField = props.content.valueField || 'value';
      return (props.content.data || []).reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);
    });

    const formattedTotalValue = computed(() => {
        return totalValue.value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    });

    const slices = computed(() => {
      const valueField = props.content.valueField || 'value';
      const colorField = props.content.colorField || 'color';
      let cumulativePercentage = 0;

      return (props.content.data || []).map(item => {
        const value = item[valueField] || 0;
        const percentage = totalValue.value > 0 ? value / totalValue.value : 0;
        const offset = circumference.value * (1 - percentage);
        const rotation = (cumulativePercentage * 360) - 90;

        cumulativePercentage += percentage;

        return {
          color: item[colorField] || '#cccccc',
          offset,
          rotation,
        };
      });
    });

    const dataWithPercentage = computed(() => {
        const valueField = props.content.valueField || 'value';
        const nameField = props.content.nameField || 'name';
        const colorField = props.content.colorField || 'color';

        if (!props.content.data || totalValue.value === 0) return [];

        return props.content.data.map(item => ({
            name: item[nameField],
            color: item[colorField],
            percentage: Math.round(((item[valueField] / totalValue.value) * 100)),
        }));
    });

    return {
      viewBoxSize,
      center,
      radius,
      circumference,
      slices,
      formattedTotalValue,
      dataWithPercentage,
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
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;

  .title {
    font-weight: 600;
    margin: 0;
    color: var(--title-color, #e2e8f0);
  }

  .dropdown {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: var(--dropdown-text-color, #94a3b8);
    cursor: pointer;
  }
}

.donut-chart-container {
  position: relative;
  margin: 0 auto;
  flex-shrink: 0;
  width: 60%;
  max-width: 250px;
  min-width: 150px;
  aspect-ratio: 1 / 1;
}

.donut-chart {
  overflow: visible;

  .center-value {
    font-weight: 700;
    fill: var(--center-value-color, #f1f5f9);
  }

  .center-subtext {
    fill: var(--center-subtext-color, #94a3b8);
    font-weight: 500;
  }
}

.legend-container {
  margin-top: 1.5rem;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .legend-info {
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .legend-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .legend-name {
    color: var(--legend-text-color, #cbd5e0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .legend-percentage {
    font-weight: 500;
    color: var(--legend-value-color, #e2e8f0);
    margin-left: 8px;
  }
}
</style>