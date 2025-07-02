<template>
  <div class="component-root-container">
    <div
      class="card-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--icon-background-color': content.iconBackgroundColor,
        '--icon-color': content.iconColor,
        '--title-color': content.titleColor,
        '--value-color': content.valueColor,
        '--trend-up-color': content.trendUpColor,
        '--trend-down-color': content.trendDownColor,
      }"
    >
      <div class="card-header">
        <h3 class="title">{{ content.title }}</h3>
        <div class="icon-container">
          <ww-icon :name="content.icon" class="icon"></ww-icon>
        </div>
      </div>

      <div class="value-container">
        <h2 class="value">{{ formattedValue }}</h2>
      </div>

      <div class="trend-container">
        <div class="trend-value" :class="{ 'trend-up': isTrendUp, 'trend-down': !isTrendUp }">
          <svg v-if="isTrendUp" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5l0 14"/><path d="M18 11l-6-6"/><path d="M6 11l6-6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l0-14"/><path d="M18 13l-6 6"/><path d="M6 13l6 6"/></svg>
          <span>{{ formattedTrend }}%</span>
        </div>
        <span class="trend-label">{{ content.trendLabel }}</span>
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
    const formattedValue = computed(() => {
      const value = props.content.value || 0;
      return value.toLocaleString('en-US');
    });

    const isTrendUp = computed(() => (props.content.trend || 0) >= 0);

    const formattedTrend = computed(() => {
        const trend = props.content.trend || 0;
        return Math.abs(trend);
    });

    return {
      formattedValue,
      isTrendUp,
      formattedTrend
    };
  },
};
</script>

<style lang="scss" scoped>
.component-root-container {
  width: 100%;
  height: 100%;
}
.card-wrapper {
  font-family: 'Inter', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--background-color, #1e293b);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  color: white;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .title {
    font-weight: 500;
    color: var(--title-color, #94a3b8);
    font-size: 0.875rem;
    margin: 0;
  }
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    background-color: var(--icon-background-color, #3b82f6);
    flex-shrink: 0;
  }
  .icon {
    color: var(--icon-color, #ffffff);
    font-size: 1rem;
  }
}
.value-container {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  .value {
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--value-color, #f1f5f9);
    margin: 0;
    line-height: 1.1;
  }
}
.trend-container {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  .trend-value {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-right: 0.5rem;
    &.trend-up {
      color: var(--trend-up-color, #22c55e);
    }
    &.trend-down {
      color: var(--trend-down-color, #ef4444);
    }
    svg {
        margin-right: 0.25rem;
    }
  }
  .trend-label {
    color: var(--title-color, #94a3b8);
  }
}
</style>