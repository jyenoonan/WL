export default {
  editor: {
    label: {
      en: 'App Customization Dashboard',
    },
    icon: 'settings',
  },
  properties: {
    // Section: Branding
    appName: {
      label: { en: 'App Name' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'My Awesome App',
    },
    logoUrl: {
      label: { en: 'Logo URL' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'https://cdn.worldvectorlogo.com/logos/n8n.svg',
    },
    // Section: Colors
    primaryColor: {
      label: { en: 'Primary Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#3b82f6',
    },
    surfaceColor: {
      label: { en: 'Surface Color (Cards)' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#1e293b',
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#0f172a',
    },
    textColor: {
      label: { en: 'Primary Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#f1f5f9',
    },
    subtleTextColor: {
      label: { en: 'Subtle Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#94a3b8',
    },
    // Section: Typography
    fontFamily: {
      label: { en: 'Font Family' },
      type: 'Select',
      section: 'style',
      options: {
        options: [
          { label: 'Inter', value: "'Inter', sans-serif" },
          { label: 'Roboto', value: "'Roboto', sans-serif" },
          { label: 'Lato', value: "'Lato', sans-serif" },
          { label: 'Montserrat', value: "'Montserrat', sans-serif" },
        ],
      },
      bindable: true,
      defaultValue: "'Inter', sans-serif",
    },
    // Section: UI Elements
    buttonStyle: {
      label: { en: 'Button Style' },
      type: 'Select',
      section: 'style',
      options: {
        options: [
          { label: 'Pill', value: '9999px' },
          { label: 'Rounded', value: '0.5rem' },
          { label: 'Sharp', value: '0px' },
        ],
      },
      bindable: true,
      defaultValue: '0.5rem',
    },
    cardCornerRadius: {
      label: { en: 'Card Corner Radius' },
      type: 'Length',
      section: 'style',
      options: {
          unitChoices: [{ value: 'rem', label: 'rem', min: 0, max: 2, step: 0.1 }],
      },
      bindable: true,
      defaultValue: '1rem',
    },
  },
  triggerEvents: [
    { name: 'save-settings', label: { en: 'On Save' }, event: {} },
    { name: 'reset-settings', label: { en: 'On Reset' }, event: {} },
  ],
};