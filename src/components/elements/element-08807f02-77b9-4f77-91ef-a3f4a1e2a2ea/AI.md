---
name: rich-text-mentions
description: A rich text editor with support for @mentions that display with images in a dropdown positioned above the input field.
keywords: rich text, editor, mentions, dropdown, images, text input
---

#### Rich Text Mentions

***Purpose:***
A customizable rich text input field that supports @mentions with an image-enhanced dropdown that appears above the input field. Users can type '@' to trigger a dropdown of mentionable items, each displaying both text and an associated image.

***Features:***
- Dropdown appears above the input field when typing '@'
- Each mention item displays both text and an image
- Customizable styling for the editor, mentions, and dropdown
- Keyboard navigation in the dropdown (arrow keys, enter, escape)
- Flexible mention item configuration with custom label paths
- Rich text editing capabilities

***Properties:***
- initialValue: string - The initial HTML content to display in the editor
- placeholder: string - Text displayed when the editor is empty
- mentionItems: array - List of items that can be mentioned, each with id, name, and image properties
- mentionLabelPath: string - Property path to use for displaying mention labels
- Various styling properties for the editor, mentions, and dropdown

***Events:***
- change: Triggered when the editor content changes. Payload: { value: string }
- focus: Triggered when the editor receives focus. No payload.
- blur: Triggered when the editor loses focus. No payload.
- mention: Triggered when a mention is selected. Payload: { item: object, value: string }
- initValueChange: Triggered when the initial value changes. Payload: { value: string }

***Exposed Actions:***
- `setValue`: Sets the editor content. Args: value (string)
- `clear`: Clears the editor content. No args.
- `focus`: Focuses the editor. No args.

***Exposed Variables:***
- value: The current HTML content of the editor. (path: variables['current_element_uid-value'])

***Notes:***
- Type '@' to trigger the mentions dropdown
- The dropdown appears above the input field to avoid being cut off at the bottom of the screen
- Images in the dropdown are displayed as circles by default (can be customized)
- Mentions in the text are highlighted with customizable colors
- The component uses TipTap editor for rich text capabilities