export default {
  editor: {
    label: {
      en: 'n8n Connector Card',
    },
    icon: 'plug',
  },
  properties: {
    title: {
      label: { en: 'Title' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'n8n Connection',
    },
    statusText: {
        label: { en: 'Status Text' },
        type: 'Text',
        section: 'settings',
        bindable: true,
        defaultValue: 'Not Connected',
    },
    isConnected: {
        label: { en: 'Is Connected?' },
        type: 'OnOff',
        section: 'settings',
        bindable: true,
        defaultValue: false,
    },
    baseUrl: {
        label: { en: 'Base URL' },
        type: 'Text',
        section: 'settings',
        bindable: true,
        defaultValue: '',
    },
    apiKey: {
        label: { en: 'API Key' },
        type: 'Text',
        section: 'settings',
        bindable: true,
        defaultValue: '',
    },
    buttonText: {
        label: { en: 'Button Text' },
        type: 'Text',
        section: 'settings',
        bindable: true,
        defaultValue: 'Connect',
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#1e293b',
    },
    titleColor: {
      label: { en: 'Title Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#f1f5f9',
    },
    statusConnectedColor: {
        label: { en: 'Status Connected Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#22c55e',
    },
    statusDisconnectedColor: {
        label: { en: 'Status Disconnected Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#ef4444',
    },
    inputBackgroundColor: {
        label: { en: 'Input BG Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#0f172a',
    },
    inputBorderColor: {
        label: { en: 'Input Border Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#334155',
    },
    buttonColor: {
        label: { en: 'Button Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#3b82f6',
    },
  },
  triggerEvents: [
    {
      name: 'connect',
      label: { en: 'On Connect' },
      event: {
        baseUrl: '',
        apiKey: '',
      },
    },
  ],
};