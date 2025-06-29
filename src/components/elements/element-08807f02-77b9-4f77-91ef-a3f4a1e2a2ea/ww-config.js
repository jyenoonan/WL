export default {
  editor: {
    label: {
      en: 'Rich Text Mentions',
    },
    icon: 'text',
  },
  properties: {
    initialValue: {
      label: { en: 'Initial value' },
      type: 'Text',
      bindable: true,
      section: 'settings',
      defaultValue: '',
    },
    placeholder: {
      label: { en: 'Placeholder' },
      type: 'Text',
      bindable: true,
      section: 'settings',
      defaultValue: 'Type @ to mention...',
    },
    mentionItems: {
      label: { en: 'Mention Items' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        { id: '1', name: 'John Doe', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: '2', name: 'Jane Smith', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
        { id: '3', name: 'Robert Johnson', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { id: '4', name: 'Emily Davis', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
      ],
      options: {
        expandable: true,
        getItemLabel(item, index) {
          return item?.name || `Item ${index + 1}`;
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: '',
            name: '',
            image: '',
          },
          options: {
            item: {
              id: {
                label: 'ID',
                type: 'Text',
                options: { placeholder: 'Unique identifier' }
              },
              name: {
                label: 'Name',
                type: 'Text',
                options: { placeholder: 'Display name' }
              },
              image: {
                label: 'Image URL',
                type: 'Text',
                options: { placeholder: 'https://example.com/image.jpg' }
              }
            }
          }
        }
      },
    },
    mentionLabelPath: {
      label: { en: 'Mention Label Path' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.mentionItems?.[0] || {}
      }),
      defaultValue: 'name',
      hidden: (content, sidepanelContent, boundProps) => 
        !Array.isArray(content.mentionItems) || 
        !content.mentionItems?.length || 
        !boundProps.mentionItems,
    },
    minHeight: {
      label: { en: 'Min Height' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '100px',
    },
    maxHeight: {
      label: { en: 'Max Height' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '300px',
    },
    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#ffffff',
    },
    textColor: {
      label: { en: 'Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#333333',
    },
    borderRadius: {
      label: { en: 'Border Radius' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '4px',
    },
    border: {
      label: { en: 'Border' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '1px solid #ddd',
    },
    padding: {
      label: { en: 'Padding' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '10px',
    },
    fontSize: {
      label: { en: 'Font Size' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '14px',
    },
    fontFamily: {
      label: { en: 'Font Family' },
      type: 'FontFamily',
      section: 'style',
      bindable: true,
      defaultValue: 'inherit',
    },
    mentionColor: {
      label: { en: 'Mention Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#1e88e5',
    },
    mentionBackgroundColor: {
      label: { en: 'Mention Background' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: 'rgba(30, 136, 229, 0.1)',
    },
    dropdownMaxHeight: {
      label: { en: 'Dropdown Max Height' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '200px',
    },
    dropdownWidth: {
      label: { en: 'Dropdown Width' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '250px',
    },
    dropdownBackgroundColor: {
      label: { en: 'Dropdown Background' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#ffffff',
    },
    dropdownBorder: {
      label: { en: 'Dropdown Border' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '1px solid #ddd',
    },
    dropdownBorderRadius: {
      label: { en: 'Dropdown Border Radius' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '4px',
    },
    dropdownBoxShadow: {
      label: { en: 'Dropdown Shadow' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '0 2px 10px rgba(0,0,0,0.1)',
    },
    dropdownItemPadding: {
      label: { en: 'Dropdown Item Padding' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '8px 12px',
    },
    dropdownItemBorder: {
      label: { en: 'Dropdown Item Border' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '1px solid #eee',
},
dropdownItemTextColor: {
label: { en: 'Dropdown Item Text Color' },
type: 'Color',
section: 'style',
bindable: true,
defaultValue: '#333333',
},
dropdownItemFontSize: {
label: { en: 'Dropdown Item Font Size' },
type: 'Length',
section: 'style',
bindable: true,
defaultValue: '14px',
},
mentionImageSize: {
label: { en: 'Mention Image Size' },
type: 'Length',
section: 'style',
bindable: true,
defaultValue: '24px',
},
mentionImageBorderRadius: {
label: { en: 'Mention Image Border Radius' },
type: 'Length',
section: 'style',
bindable: true,
defaultValue: '50%',
},
},
triggerEvents: [
{
name: 'change',
label: { en: 'On change' },
event: { value: '' },
default: true
},
{
name: 'focus',
label: { en: 'On focus' },
event: {}
},
{
name: 'blur',
label: { en: 'On blur' },
event: {}
},
{
name: 'mention',
label: { en: 'On mention' },
event: { item: {}, value: '' }
},
{
name: 'initValueChange',
label: { en: 'On init value change' },
event: { value: '' }
}
],
actions: [
{
action: 'setValue',
label: { en: 'Set value' },
args: [
{
name: 'value',
type: 'string'
}
]
},
{
action: 'clear',
label: { en: 'Clear' }
},
{
action: 'focus',
label: { en: 'Focus' }
}
]
};