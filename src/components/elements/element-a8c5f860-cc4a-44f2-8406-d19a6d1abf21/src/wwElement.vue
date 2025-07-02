<template>
  <div class="component-root-container">
    <div
      class="card-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--status-color': statusColor,
        '--name-color': content.nameColor,
        '--description-color': content.descriptionColor,
        '--timestamp-color': content.timestampColor,
      }"
    >
      <div class="status-indicator"></div>
      
      <div class="icon-container">
        <ww-icon :name="displayIcon" class="icon"></ww-icon>
      </div>
      
      <div class="text-content">
        <div class="workflow-name">{{ content.workflowName }}</div>
        <div class="description">{{ content.description }}</div>
      </div>
      
      <div class="timestamp">
        {{ content.timestamp }}
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
    const isSuccess = computed(() => props.content.status === 'success');

    // Computes the color based on the status (success or failure)
    const statusColor = computed(() => {
        return isSuccess.value ? props.content.successColor : props.content.failureColor;
    });

    // Provides a smart default icon that can be overridden by the user
    const displayIcon = computed(() => {
        if (props.content.icon) {
            return props.content.icon; // User-defined icon takes priority
        }
        return isSuccess.value ? 'fas fa-check' : 'fas fa-times';
    });

    return {
      statusColor,
      displayIcon
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
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 70px;
  box-sizing: border-box;
  background-color: var(--background-color, #1e293b);
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  overflow: hidden;
  gap: 1rem;
}
.status-indicator {
  width: 4px;
  height: 100%;
  background-color: var(--status-color);
  // Position it neatly using a negative margin trick
  margin-left: -1.5rem;
  margin-right: -4px;
}
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background-color: var(--status-color);
  opacity: 0.15;
  .icon {
    font-size: 1rem;
    color: var(--status-color);
  }
}
.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  .workflow-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--name-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .description {
    font-size: 0.75rem;
    color: var(--description-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.timestamp {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--timestamp-color);
}
</style>