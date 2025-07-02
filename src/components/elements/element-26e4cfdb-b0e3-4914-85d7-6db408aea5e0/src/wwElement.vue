<template>
  <div class="component-root-container">
    <div
      class="dashboard-wrapper"
      :style="{
        '--background-color': content.backgroundColor,
        '--surface-color': content.surfaceColor,
        '--primary-color': content.primaryColor,
        '--text-color': content.textColor,
        '--subtle-text-color': content.subtleTextColor,
        '--font-family': content.fontFamily,
        '--button-border-radius': content.buttonStyle,
        '--card-border-radius': content.cardCornerRadius,
      }"
    >
      <div class="settings-pane">
        <div class="section">
          <h3 class="section-title">Branding</h3>
          <div class="input-group">
            <label>App Name</label>
            <input type="text" v-model="appName" />
          </div>
          <div class="input-group">
            <label>Logo URL</label>
            <input type="text" v-model="logoUrl" />
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Colors</h3>
          <div class="color-grid">
            <div class="color-input">
              <label>Primary</label>
              <input type="color" v-model="primaryColor" />
            </div>
            <div class="color-input">
              <label>Surface</label>
              <input type="color" v-model="surfaceColor" />
            </div>
            <div class="color-input">
              <label>Background</label>
              <input type="color" v-model="backgroundColor" />
            </div>
            <div class="color-input">
              <label>Text</label>
              <input type="color" v-model="textColor" />
            </div>
            <div class="color-input">
              <label>Subtle Text</label>
              <input type="color" v-model="subtleTextColor" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">UI Elements</h3>
          <div class="input-group">
            <label>Font Family</label>
            <select v-model="fontFamily">
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Lato', sans-serif">Lato</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
            </select>
          </div>
          <div class="input-group">
            <label>Button Style</label>
            <select v-model="buttonStyle">
              <option value="9999px">Pill</option>
              <option value="0.5rem">Rounded</option>
              <option value="0px">Sharp</option>
            </select>
          </div>
        </div>
      </div>

      <div class="preview-pane">
        <div class="preview-header">
          <img :src="logoUrl" class="preview-logo" alt="Logo" @error="onLogoError" />
          <h4 class="preview-app-name">{{ appName }}</h4>
        </div>
        <div class="preview-card">
          <p class="preview-text">This is how your cards will look.</p>
          <button class="preview-button">Primary Button</button>
        </div>
        <p class="preview-subtle-text">This is subtle text for descriptions.</p>
      </div>

      <div class="actions-footer">
        <button class="reset-button" @click="triggerReset">Reset</button>
        <button class="save-button" @click="triggerSave">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // Create reactive variables linked to WeWeb's system
    const { value: appName, setValue: setAppName } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'appName', type: 'string', defaultValue: props.content.appName });
    const { value: logoUrl, setValue: setLogoUrl } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'logoUrl', type: 'string', defaultValue: props.content.logoUrl });
    const { value: primaryColor, setValue: setPrimaryColor } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'primaryColor', type: 'string', defaultValue: props.content.primaryColor });
    const { value: surfaceColor, setValue: setSurfaceColor } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'surfaceColor', type: 'string', defaultValue: props.content.surfaceColor });
    const { value: backgroundColor, setValue: setBackgroundColor } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'backgroundColor', type: 'string', defaultValue: props.content.backgroundColor });
    const { value: textColor, setValue: setTextColor } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'textColor', type: 'string', defaultValue: props.content.textColor });
    const { value: subtleTextColor, setValue: setSubtleTextColor } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'subtleTextColor', type: 'string', defaultValue: props.content.subtleTextColor });
    const { value: fontFamily, setValue: setFontFamily } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'fontFamily', type: 'string', defaultValue: props.content.fontFamily });
    const { value: buttonStyle, setValue: setButtonStyle } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'buttonStyle', type: 'string', defaultValue: props.content.buttonStyle });
    const { value: cardCornerRadius, setValue: setCardCornerRadius } = wwLib.wwVariable.useComponentVariable({ uid: props.uid, name: 'cardCornerRadius', type: 'string', defaultValue: props.content.cardCornerRadius });

    const onLogoError = (event) => {
        event.target.src = 'https://placehold.co/40x40/334155/94a3b8?text=Logo';
    };

    const triggerSave = () => {
        emit('trigger-event', { name: 'save-settings', event: {
            appName: appName.value, logoUrl: logoUrl.value, primaryColor: primaryColor.value, surfaceColor: surfaceColor.value,
            backgroundColor: backgroundColor.value, textColor: textColor.value, subtleTextColor: subtleTextColor.value,
            fontFamily: fontFamily.value, buttonStyle: buttonStyle.value, cardCornerRadius: cardCornerRadius.value,
        }});
    };

    const triggerReset = () => {
        emit('trigger-event', { name: 'reset-settings', event: {} });
    };

    return {
        appName, logoUrl, primaryColor, surfaceColor, backgroundColor, textColor, subtleTextColor, fontFamily, buttonStyle, cardCornerRadius,
        onLogoError, triggerSave, triggerReset
    };
  },
};
</script>

<style lang="scss" scoped>
.component-root-container { width: 100%; height: 100%; }
.dashboard-wrapper {
  font-family: var(--font-family);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-template-rows: 1fr auto;
  gap: 2rem;
  width: 100%; height: 100%; box-sizing: border-box;
  background-color: var(--background-color);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  color: var(--text-color);
}
.settings-pane {
    display: flex; flex-direction: column; gap: 1.5rem;
}
.section-title {
    font-size: 1.125rem; font-weight: 600; margin: 0 0 1rem 0;
    padding-bottom: 0.5rem; border-bottom: 1px solid #334155;
}
.input-group, .color-input { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group { margin-bottom: 1rem; }
label { font-size: 0.875rem; font-weight: 500; color: var(--subtle-text-color); }
input[type="text"], select {
    width: 100%; background-color: #0f172a; border: 1px solid #334155;
    border-radius: 0.5rem; padding: 0.75rem; font-size: 0.875rem;
    color: var(--text-color); box-sizing: border-box;
}
.color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; }
input[type="color"] {
    width: 100%; height: 40px; border: 1px solid #334155;
    padding: 0.25rem; border-radius: 0.5rem; background-color: #0f172a;
}

.preview-pane {
    background-color: var(--background-color);
    border: 1px dashed #334155;
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
}
.preview-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.preview-logo { width: 40px; height: 40px; object-fit: contain; }
.preview-app-name { font-size: 1.25rem; font-weight: 600; color: var(--text-color); margin: 0; }
.preview-card {
    background-color: var(--surface-color);
    border-radius: var(--card-border-radius);
    padding: 1.5rem;
    width: 100%;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
.preview-text { color: var(--text-color); margin: 0 0 1rem 0; }
.preview-subtle-text { color: var(--subtle-text-color); font-size: 0.875rem; margin-top: 1rem; }
.preview-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--button-border-radius);
    font-weight: 600;
}

.actions-footer {
    grid-column: 1 / -1;
    display: flex; justify-content: flex-end; gap: 1rem;
    padding-top: 1.5rem; border-top: 1px solid #334155;
}
.reset-button, .save-button {
    border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem;
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
}
.reset-button { background-color: #334155; color: #cbd5e0; }
.save-button { background-color: var(--primary-color); color: white; }
</style>