export default {
  editor: {
    label: {
      en: 'Gemini Chat UI'
    },
    icon: 'message-circle'
  },
  triggerEvents: [{
    name: 'message-sent',
    label: {
      en: 'On message sent'
    },
    event: {
      message: {},
      text: '',
      attachments: []
    }
  }, {
    name: 'message-received',
    label: {
      en: 'On message received'
    },
    event: {
      message: {}
    }
  }, {
    name: 'attachment-clicked',
    label: {
      en: 'On attachment click'
    },
    event: {
      attachment: {}
    }
  }, {
    name: 'pending-attachment-clicked',
    label: {
      en: 'On pending attachment click'
    },
    event: {
      attachment: {}
    }
  }, {
    name: 'message-right-click',
    label: {
      en: 'On message right click'
    },
    event: {
      message: {},
      x: 0,
      y: 0
    }
  }],
  properties: {
    messages: {
      label: {
        en: 'Messages'
      },
      type: 'Array',
      section: 'settings',
      defaultValue: [],
      bindable: true,
      options: {
        item: {
          type: 'Object',
          defaultValue: {
            id: '',
            content: '',
            role: 'user',
            timestamp: '',
            attachments: []
          }
        }
      }
    },
    isStreaming: {
      label: {
        en: 'Is streaming'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true
    },
    streamingText: {
      label: {
        en: 'Streaming Text'
      },
      type: 'Text',
      section: 'settings',
      defaultValue: '',
      bindable: true,
      hidden: (content) => !content.isStreaming,
    },
    placeholderText: {
      label: {
        en: 'Placeholder text'
      },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Message Gemini',
      bindable: true
    },
    disabled: {
      label: {
        en: 'Disabled'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true
    },
    userLabel: {
      label: {
        en: 'User Label'
      },
      type: 'Text',
      section: 'settings',
      defaultValue: 'You',
      bindable: true
    },
    assistantLabel: {
      label: {
        en: 'Assistant Label'
      },
      type: 'Text',
      section: 'settings',
      defaultValue: 'Assistant',
      bindable: true
    },
    allowAttachments: {
      label: {
        en: 'Allow attachments'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    autoScrollBehavior: {
      label: {
        en: 'Auto-scroll behavior'
      },
      type: 'Text',
      section: 'settings',
      defaultValue: 'smooth',
      options: [{
        value: 'smooth',
        label: {
          en: 'Smooth'
        }
      }, {
        value: 'instant',
        label: {
          en: 'Instant'
        }
      }],
      bindable: true
    },
    availableTools: {
      label: {
        en: 'Available Tools'
      },
      type: 'Array',
      section: 'settings',
      defaultValue: [
        { id: 'calendar', name: 'Google Calendar', description: 'Access your calendar events', icon: '📅', disabled: false },
        { id: 'keep', name: 'Google Keep', description: 'Access your notes', icon: '🗒️', disabled: false },
        { id: 'tasks', name: 'Google Tasks', description: 'Manage your tasks', icon: '✓', disabled: false }
      ],
      bindable: true,
      options: {
        item: {
          type: 'Object',
          defaultValue: {
            id: '',
            name: '',
            description: '',
            icon: '',
            disabled: false
          }
        }
      }
    },
    enableMentions: {
      label: {
        en: 'Enable mentions'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    showToolsButton: {
      label: {
        en: 'Show tools button'
      },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    maxAttachmentSize: {
      label: {
        en: 'Max attachment size (bytes)'
      },
      type: 'Number',
      section: 'settings',
      defaultValue: 10485760,
      bindable: true
    },
    allowedFileTypes: {
      label: {
        en: 'Allowed file types'
      },
      type: 'Array',
      section: 'settings',
      defaultValue: ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
      bindable: true,
      options: {
        item: {
          type: 'Text'
        }
      }
    }
  }
};