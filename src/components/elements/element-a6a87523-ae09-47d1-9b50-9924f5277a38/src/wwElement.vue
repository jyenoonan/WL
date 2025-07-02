<template>
  <div class="component-root-container">
    <div
      class="card-wrapper"
      ref="cardRef"
      :style="{
        '--background-color': content.backgroundColor,
        '--title-color': content.titleColor,
        '--status-connected-color': content.statusConnectedColor,
        '--status-disconnected-color': content.statusDisconnectedColor,
        '--input-bg-color': content.inputBackgroundColor,
        '--input-border-color': content.inputBorderColor,
        '--button-color': content.buttonColor,
      }"
    >
      <div class="card-header" @click="toggleDropdown">
        <div class="header-content">
          <ww-icon name="n8n-logo" class="n8n-icon"></ww-icon>
          <h2 class="title">{{ content.title }}</h2>
        </div>
        <div class="status-section">
          <div class="status" :class="{ connected: content.isConnected }">
            <span class="status-dot"></span>
            <span class="status-text">{{ content.statusText }}</span>
          </div>
          <ww-icon name="chevron-down" class="chevron-icon" :class="{ rotated: isOpen }"></ww-icon>
        </div>
      </div>

      <div class="dropdown-content" :class="{ open: isOpen }">
        <div class="input-group">
          <label class="input-label">Base URL</label>
          <input type="text" class="input-field" placeholder="https://n8n.example.com" v-model="internalBaseUrl" />
        </div>
        <div class="input-group">
          <label class="input-label">API Key</label>
          <input type="password" class="input-field" placeholder="••••••••••••••••••••" v-model="internalApiKey" />
        </div>
        <button class="connect-button" @click.stop="triggerConnectEvent">
          {{ content.buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const cardRef = ref(null);

    const { value: internalBaseUrl, setValue: setBaseUrl } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'baseUrl', type: 'string', defaultValue: props.content.baseUrl || ''
    });
    const { value: internalApiKey, setValue: setApiKey } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid, name: 'apiKey', type: 'string', defaultValue: props.content.apiKey || ''
    });

    watch(() => props.content.baseUrl, (val) => setBaseUrl(val));
    watch(() => props.content.apiKey, (val) => setApiKey(val));

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const closeDropdown = () => {
      isOpen.value = false;
    };

    const handleClickOutside = (event) => {
      if (cardRef.value && !cardRef.value.contains(event.target)) {
        closeDropdown();
      }
    };

    const triggerConnectEvent = () => {
        emit('trigger-event', {
            name: 'connect',
            event: {
                baseUrl: internalBaseUrl.value,
                apiKey: internalApiKey.value,
            },
        });
        closeDropdown();
    };

    onMounted(() => document.addEventListener('click', handleClickOutside));
    onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

    return {
      isOpen,
      cardRef,
      internalBaseUrl,
      internalApiKey,
      toggleDropdown,
      triggerConnectEvent,
    };
  },
};
</script>

<style lang="scss" scoped>
.component-root-container { width: 100%; height: 100%; }
.card-wrapper {
  font-family: 'Inter', -apple-system, sans-serif;
  box-sizing: border-box; background-color: var(--background-color);
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  color: white;
  transition: all 0.3s ease-in-out;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
}
.header-content, .status-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.n8n-icon {
    font-size: 1.5rem;
    color: #FF4747; /* Official n8n red */
}
.title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--title-color);
}
.status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--status-disconnected-color);
    &.connected {
        color: var(--status-connected-color);
    }
}
.status-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background-color: currentColor;
}
.chevron-icon {
    font-size: 1.25rem;
    color: #94a3b8;
    transition: transform 0.3s ease-in-out;
    &.rotated {
        transform: rotate(180deg);
    }
}
.dropdown-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
    padding: 0 1.5rem;
    &.open {
        max-height: 300px;
        padding: 0 1.5rem 1.5rem 1.5rem;
        border-top: 1px solid #334155;
    }
}
.input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}
.input-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 0.5rem;
}
.input-field {
    width: 100%;
    background-color: var(--input-bg-color);
    border: 1px solid var(--input-border-color);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: white;
    box-sizing: border-box;
    transition: border-color 0.2s;
    &:focus {
        outline: none;
        border-color: var(--button-color);
    }
}
.connect-button {
    width: 100%;
    background-color: var(--button-color);
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover {
        opacity: 0.9;
    }
}
</style>