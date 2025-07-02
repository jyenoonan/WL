export default {
  editor: {
    label: {
      en: 'Selectable Dropdown'
    },
    icon: 'menu'
  },
  properties: {
    items: {
      label: { en: 'Items' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { name: 'Item 1', id: 1 },
        { name: 'Item 2', id: 2 },
        { name: 'Item 3', id: 3 },
        { name: 'Item 4', id: 4 },
        { name: 'Item 5', id: 5 }
      ],
      options: {
        expandable: true,
        getItemLabel(_, index) {
          return `Item ${index + 1}`;
        },
        item: {
          type: 'Object',
          defaultValue: {
            name: 'New Item',
            id: 0
          },
          options: {
            item: {
              name: {
                label: 'Name',
                type: 'Text',
                options: { placeholder: 'Enter name' }
              },
              id: {
                label: 'ID',
                type: 'Number',
                options: { placeholder: 'Enter ID' }
              }
            }
          }
        }
      },
    },
    displayField: {
      label: { en: 'Display Field' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.items?.[0] || {}
      }),
      defaultValue: 'name',
      hidden: (content, sidepanelContent, boundProps) => 
        !Array.isArray(content.items) || 
        !content.items?.length || 
        !boundProps.items,
    },
    valueField: {
      label: { en: 'Value Field' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.items?.[0] || {}
      }),
      defaultValue: 'id',
      hidden: (content, sidepanelContent, boundProps) => 
        !Array.isArray(content.items) || 
        !content.items?.length || 
        !boundProps.items,
    },
    initialValue: {
      label: { en: 'Initial Selection' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
    },
    placeholder: {
      label: { en: 'Placeholder' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Select items',
    },
    showSearch: {
      label: { en: 'Show Search' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
    },
    searchPlaceholder: {
      label: { en: 'Search Placeholder' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Search...',
      hidden: content => !content.showSearch,
    },
    showSelectAll: {
      label: { en: 'Show Select All' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: true,
    },
    selectAllText: {
      label: { en: 'Select All Text' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Select All',
      hidden: content => !content.showSelectAll,
    },
    dropdownWidth: {
      label: { en: 'Dropdown Width' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '100%',
    },
    borderColor: {
      label: { en: 'Border Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#dddddd',
    },
    accentColor: {
      label: { en: 'Accent Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#007bff',
    }
  },
  triggerEvents: [
    {
      name: 'change',
      label: { en: 'On selection change' },
      event: { 
        value: [],
        item: {},
        action: 'select' // 'select', 'deselect', 'selectAll', 'deselectAll'
      },
      default: true
    },
    {
      name: 'open',
      label: { en: 'On dropdown open' },
      event: {}
    },
    {
      name: 'close',
      label: { en: 'On dropdown close' },
      event: {}
    }
  ],
  actions: [
    {
      action: 'selectItem',
      label: { en: 'Select item' },
      args: [
        {
          name: 'item',
          type: 'object',
          label: { en: 'Item to select' }
        }
      ]
    },
    {
      action: 'deselectItem',
      label: { en: 'Deselect item' },
      args: [
        {
          name: 'item',
          type: 'object',
          label: { en: 'Item to deselect' }
        }
      ]
    },
    {
      action: 'selectAll',
      label: { en: 'Select all items' }
    },
    {
      action: 'deselectAll',
      label: { en: 'Deselect all items' }
    },
    {
      action: 'openDropdown',
      label: { en: 'Open dropdown' }
    },
    {
      action: 'closeDropdown',
      label: { en: 'Close dropdown' }
    }
  ]
};