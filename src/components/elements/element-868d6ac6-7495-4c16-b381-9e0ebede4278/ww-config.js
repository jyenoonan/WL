/* ww-config.js */
export default {
  editor: {
    label: {
      en: 'n8n Workflow Visualizer',
    },
    icon: 'git-merge',
  },
  properties: {
    workflowJsonString: {
      label: {
        en: 'Workflow JSON (as Text)',
      },
      type: 'Text',
      bindable: true,
      defaultValue: '',
      section: 'settings',
      multiLine: true,
    },
  },
};