export default {
  editor: {
    label: {
      en: 'Line Chart',
    },
    icon: 'trending-up',
  },
  properties: {
    title: {
      label: { en: 'Title' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Executions per Day',
    },
    subtitle: {
        label: { en: 'Subtitle' },
        type: 'Text',
        section: 'settings',
        bindable: true,
        defaultValue: 'Last 30 Days',
    },
    data: {
      label: { en: 'Data' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { day: 1, executions: 45 }, { day: 5, executions: 52 }, { day: 10, executions: 78 },
        { day: 15, executions: 65 }, { day: 20, executions: 88 }, { day: 25, executions: 95 },
        { day: 30, executions: 120 },
      ],
      options: {
        expandable: true,
        getItemLabel: (item, index) => `Point ${index + 1}`,
        item: {
          type: 'Object',
          defaultValue: { day: 31, executions: 100 },
        },
      },
    },
    xField: {
        label: { en: 'X-axis Field' },
        type: 'ObjectPropertyPath',
        options: content => ({ object: content.data?.[0] || {} }),
        defaultValue: 'day',
    },
    yField: {
        label: { en: 'Y-axis Field' },
        type: 'ObjectPropertyPath',
        options: content => ({ object: content.data?.[0] || {} }),
        defaultValue: 'executions',
    },
    showGrid: {
        label: { en: 'Show Y-axis Grid' },
        type: 'OnOff',
        section: 'settings',
        defaultValue: true,
    },
    showArea: {
        label: { en: 'Show Area Gradient' },
        type: 'OnOff',
        section: 'settings',
        defaultValue: true,
    },
    showPoints: {
        label: { en: 'Show Data Points' },
        type: 'OnOff',
        section: 'settings',
        defaultValue: true,
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
    subtitleColor: {
        label: { en: 'Subtitle Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#94a3b8',
    },
    lineColor: {
      label: { en: 'Line Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#3b82f6',
    },
    lineWidth: {
        label: { en: 'Line Width'},
        type: 'Number',
        section: 'style',
        defaultValue: 2,
    },
    areaColorTop: {
        label: { en: 'Area Gradient Top' },
        type: 'Color',
        section: 'style',
        defaultValue: 'rgba(59, 130, 246, 0.2)',
    },
    areaColorBottom: {
        label: { en: 'Area Gradient Bottom' },
        type: 'Color',
        section: 'style',
        defaultValue: 'rgba(59, 130, 246, 0)',
    },
    pointColor: {
        label: { en: 'Point Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#ffffff',
    },
    pointBorderColor: {
        label: { en: 'Point Border Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#3b82f6',
    },
    axisLabelColor: {
      label: { en: 'Axis Label Color' },
      type: 'Color',
      section: 'style',
      defaultValue: '#94a3b8',
    },
    gridColor: {
        label: { en: 'Grid Line Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#334155',
    },
  },
};