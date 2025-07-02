export default {
  editor: {
    label: {
      en: 'Pie Chart',
    },
    icon: 'chart-pie',
  },
  properties: {
    title: {
      label: { en: 'Title' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Traffic Sources',
    },
    data: {
      label: { en: 'Data' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { source: 'Organic Search', value: 4500 },
        { source: 'Social Media', value: 2500 },
        { source: 'Direct', value: 1500 },
        { source: 'Referral', value: 500 },
      ],
      options: {
        expandable: true,
        getItemLabel: (item, index) => item.source || `Item ${index + 1}`,
        item: {
          type: 'Object',
          defaultValue: { source: 'New Source', value: 1000 },
        },
      },
    },
    labelField: {
      label: { en: 'Label Field' },
      type: 'ObjectPropertyPath',
      options: (content) => ({ object: content.data?.[0] || {} }),
      defaultValue: 'source',
    },
    valueField: {
      label: { en: 'Value Field' },
      type: 'ObjectPropertyPath',
      options: (content) => ({ object: content.data?.[0] || {} }),
      defaultValue: 'value',
    },
    showTooltip: {
      label: { en: 'Show Tooltip' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
    },
    showLegend: {
        label: { en: 'Show Legend' },
        type: 'OnOff',
        section: 'settings',
        defaultValue: true,
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#1e293b',
    },
    titleColor: {
      label: { en: 'Title Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#f1f5f9',
    },
    sliceColors: {
      label: { en: 'Slice Colors' },
      type: 'Array',
      section: 'style',
      options: {
        item: {
          type: 'Color',
        },
      },
      defaultValue: ['#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#ef4444'],
    },
    legendTextColor: {
      label: { en: 'Legend Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#cbd5e0',
    },
    sliceBorderColor: {
        label: { en: 'Slice Border Color' },
        type: 'Color',
        section: 'style',
        defaultValue: '#1e293b',
    },
    sliceBorderWidth: {
        label: { en: 'Slice Border Width' },
        type: 'Number',
        section: 'style',
        defaultValue: 2,
    },
  },
};