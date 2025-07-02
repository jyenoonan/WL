export default {
  editor: {
    label: {
      en: 'Live History Card',
    },
    icon: 'history',
  },
  properties: {
    status: {
      label: { en: 'Status' },
      type: 'Select',
      options: {
        options: [
          { label: 'Success', value: 'success' },
          { label: 'Failure', value: 'failure' },
        ],
      },
      section: 'settings',
      defaultValue: 'success',
    },
    workflowName: {
      label: { en: 'Workflow Name' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'User Onboarding Flow',
    },
    description: {
      label: { en: 'Description' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'ID: 8a2f-b9e1-4c7d',
    },
    timestamp: {
      label: { en: 'Timestamp' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Just now',
    },
    icon: {
        label: { en: 'Icon (Optional)' },
        type: 'Icon',
        section: 'settings',
        bindable: true,
        defaultValue: null,
        helper: 'Overrides the default status icon.'
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#1e293b',
    },
    successColor: {
      label: { en: 'Success Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#22c55e',
    },
    failureColor: {
      label: { en: 'Failure Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#ef4444',
    },
    nameColor: {
        label: { en: 'Name Color' },
        type: 'Color',
        section: 'style',
        bindable: true,
        defaultValue: '#f1f5f9',
    },
    descriptionColor: {
        label: { en: 'Description Color' },
        type: 'Color',
        section: 'style',
        bindable: true,
        defaultValue: '#94a3b8',
    },
    timestampColor: {
        label: { en: 'Timestamp Color' },
        type: 'Color',
        section: 'style',
        bindable: true,
        defaultValue: '#94a3b8',
    },
  },
};