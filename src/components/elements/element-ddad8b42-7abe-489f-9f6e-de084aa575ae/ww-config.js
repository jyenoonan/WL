export default {
  editor: {
    label: {
      en: 'Animated Loader'
    },
    icon: 'loader'
  },
  properties: {
    size: {
      label: { en: 'Container Size' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 80,
      options: {
        min: 40,
        max: 200,
        step: 1
      },
    },
    dotSize: {
      label: { en: 'Dot Size' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 28,
      options: {
        min: 5,
        max: 50,
        step: 1
      },
    },
    primaryColor: {
      label: { en: 'Primary Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#F10C49',
    },
    secondaryColor: {
      label: { en: 'Secondary Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#F4DD51',
    },
    tertiaryColor: {
      label: { en: 'Tertiary Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#E3AAD6',
    },
    animationDuration: {
      label: { en: 'Animation Speed' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 2,
      options: {
        min: 0.5,
        max: 5,
        step: 0.1
      },
    }
  }
};