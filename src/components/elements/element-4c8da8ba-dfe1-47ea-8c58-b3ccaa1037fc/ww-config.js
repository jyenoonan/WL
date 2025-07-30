/* ww-config.js */
export default {
  editor: {
    label: {
      en: 'Workflow Visualizer Pro',
    },
    icon: 'git-merge',
  },
  properties: {
    workflowJson: {
      label: {
        en: 'Workflow JSON',
      },
      type: 'Object',
      bindable: true,
      defaultValue: null,
      section: 'settings',
       options: {
        code: true,
      },
    },
  },
};
