export default {
  editor: {
    label: {
      en: 'Mention Input',
    },
    icon: 'chat',
  },
  properties: {
    initialValue: {
      label: {
        en: 'Initial value',
      },
      type: 'Text',
      bindable: true,
      section: 'settings',
      defaultValue: '',
    },
    placeholder: {
      label: {
        en: 'Placeholder',
      },
      type: 'Text',
      bindable: true,
      section: 'settings',
      defaultValue: 'Type @ to mention someone...',
    },
    users: {
      label: {
        en: 'Users',
      },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [
        {
          id: '1',
          name: 'Rob Johnson',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          description: 'Product Manager'
        },
        {
          id: '2',
          name: 'Kiara Smith',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          description: 'UX Designer'
        },
        {
          id: '3',
          name: 'Alex Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
          description: 'Frontend Developer'
        },
        {
          id: '4',
          name: 'Sarah Chen',
          avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
          description: 'Marketing Specialist'
        },
        {
          id: '5',
          name: 'David Kim',
          avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
          description: 'Data Analyst'
        }
      ],
      options: {
        expandable: true,
        getItemLabel(_, index) {
          return `User ${index + 1}`;
        },
        item: {
          type: 'Object',
          defaultValue: {
            id: '',
            name: 'User Name',
            avatar: '',
            description: 'User description'
          },
          options: {
            item: {
              id: {
                label: 'ID',
                type: 'Text',
                options: { placeholder: 'User ID' }
              },
              name: {
                label: 'Name',
                type: 'Text',
                options: { placeholder: 'User Name' }
              },
              avatar: {
                label: 'Avatar',
                type: 'Image',
                options: { nullable: true }
              },
              description: {
                label: 'Description',
                type: 'Text',
                options: { placeholder: 'Short description' }
              }
            }
          }
        }
      },
    },
    userIdPath: {
      label: { en: 'User ID Field' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.users?.[0] || {}
      }),
      defaultValue: 'id',
      hidden: (content, sidepanelContent, boundProps) => !Array.isArray(content.users) || !content.users?.length || !boundProps.users,
    },
    userNamePath: {
      label: { en: 'User Name Field' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.users?.[0] || {}
      }),
      defaultValue: 'name',
      hidden: (content, sidepanelContent, boundProps) => !Array.isArray(content.users) || !content.users?.length || !boundProps.users,
    },
    userAvatarPath: {
      label: { en: 'User Avatar Field' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.users?.[0] || {}
      }),
      defaultValue: 'avatar',
      hidden: (content, sidepanelContent, boundProps) => !Array.isArray(content.users) || !content.users?.length || !boundProps.users,
    },
    userDescriptionPath: {
      label: { en: 'User Description Field' },
      type: 'ObjectPropertyPath',
      section: 'settings',
      bindable: true,
      options: content => ({
        object: content.users?.[0] || {}
      }),
      defaultValue: 'description',
      hidden: (content, sidepanelContent, boundProps) => !Array.isArray(content.users) || !content.users?.length || !boundProps.users,
    }
  },
  triggerEvents: [
    {
      name: 'change',
      label: { en: 'On change' },
      event: { value: '' },
      default: true
    },
    {
      name: 'mention',
      label: { en: 'On mention' },
      event: { user: {} }
    },
    {
      name: 'initValueChange',
      label: { en: 'On init value change' },
      event: { value: '' }
    },
    // ADD THIS NEW ENTRY
    {
      name: 'enterPressed', // Matches the name in your emit('trigger-event', { name: 'enterPressed', ... });
      label: { en: 'On Enter key press' }, // What will appear in the WeWeb editor
      event: { value: '' }, // Defines the structure of the event data (it will contain the plain text value)
      // You can add a tooltip for the editor too:
      // propertyHelp: {
      //   tooltip: 'Triggers when the user presses the Enter key in the input field.',
      // },
    }
  ],
  actions: [
    {
      action: 'focus',
      label: { en: 'Focus input' }
    },
    {
      action: 'clear',
      label: { en: 'Clear input' }
    },
    {
      action: 'setValue',
      label: { en: 'Set value' },
      args: [
        {
          name: 'value',
          type: 'string'
        }
      ]
    }
  ]
};