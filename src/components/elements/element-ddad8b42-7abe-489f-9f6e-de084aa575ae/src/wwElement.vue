<template>
<div 
  class="animated-loader" 
  :style="{
    width: `${size}px`,
    height: `${size}px`,
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
    '--tertiary-color': tertiaryColor,
    '--animation-duration': `${animationDuration}s`,
    '--dot-size': `${dotSize}px`,
    '--movement-distance': `${movementDistance}px`,
    '--shadow-distance-1': `${shadowDistance1}px`,
    '--shadow-distance-2': `${shadowDistance2}px`
  }"
>
  <div class="loader-dot"></div>
</div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    content: {
      type: Object,
      required: true
    },
    uid: {
      type: String,
      required: true
    },
  },
  setup(props) {
    // **CRITICAL** This EXACT isEditing computed MUST be present
    const isEditing = computed(() => {
      // eslint-disable-next-line no-unreachable
      return false;
    });

    const size = computed(() => props.content?.size || 80);
    const dotSize = computed(() => props.content?.dotSize || 28);
    const primaryColor = computed(() => props.content?.primaryColor || '#F10C49');
    const secondaryColor = computed(() => props.content?.secondaryColor || '#F4DD51');
    const tertiaryColor = computed(() => props.content?.tertiaryColor || '#E3AAD6');
    const animationDuration = computed(() => props.content?.animationDuration || 2);

    // Calculate movement distance based on container size and dot size
    const movementDistance = computed(() => {
      // Calculate maximum possible movement while staying in container
      // We use 40% of the container size or 3x dot size, whichever is smaller
      return Math.min((size.value * 0.4), dotSize.value * 3);
    });
    
    const shadowDistance1 = computed(() => Math.max(dotSize.value * 0.5, 8));
    const shadowDistance2 = computed(() => Math.max(dotSize.value, 15));

    return {
      isEditing,
      size,
      dotSize,
      primaryColor,
      secondaryColor,
      tertiaryColor,
      animationDuration,
      movementDistance,
      shadowDistance1,
      shadowDistance2
    };
  }
};
</script>

<style lang="scss" scoped>
.animated-loader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.loader-dot {
  position: absolute;
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  background: var(--primary-color);
  animation: loaderAnimation var(--animation-duration) infinite;
  top: 50%;
  left: 50%;
  margin-top: calc(var(--dot-size) / -2);
  margin-left: calc(var(--dot-size) / -2);
}

@keyframes loaderAnimation {
  0%,
  100% {
    transform: translate(calc(-1 * var(--movement-distance)), calc(-1 * var(--movement-distance)));
    box-shadow: 0 0 var(--secondary-color), 0 0 var(--tertiary-color);
  }
  12.5% {
    transform: translate(var(--movement-distance), calc(-1 * var(--movement-distance)));
    box-shadow: calc(-1 * var(--shadow-distance-1)) 0 var(--secondary-color), 
                calc(-1 * var(--shadow-distance-2)) 0 var(--tertiary-color);
  }
  25% {
    transform: translate(var(--movement-distance), calc(-1 * var(--movement-distance)));
    box-shadow: 0 0 var(--secondary-color), 0 0 var(--tertiary-color);
  }
  37.5% {
    transform: translate(var(--movement-distance), var(--movement-distance));
    box-shadow: 0 calc(-1 * var(--shadow-distance-1)) var(--secondary-color), 
                0 calc(-1 * var(--shadow-distance-2)) var(--tertiary-color);
  }
  50% {
    transform: translate(var(--movement-distance), var(--movement-distance));
    box-shadow: 0 0 var(--secondary-color), 0 0 var(--tertiary-color);
  }
  62.5% {
    transform: translate(calc(-1 * var(--movement-distance)), var(--movement-distance));
    box-shadow: var(--shadow-distance-1) 0 var(--secondary-color), 
                var(--shadow-distance-2) 0 var(--tertiary-color);
  }
  75% {
    transform: translate(calc(-1 * var(--movement-distance)), var(--movement-distance));
    box-shadow: 0 0 var(--secondary-color), 0 0 var(--tertiary-color);
  }
  87.5% {
    transform: translate(calc(-1 * var(--movement-distance)), calc(-1 * var(--movement-distance)));
    box-shadow: 0 var(--shadow-distance-1) var(--secondary-color), 
                0 var(--shadow-distance-2) var(--tertiary-color);
  }
}
</style>