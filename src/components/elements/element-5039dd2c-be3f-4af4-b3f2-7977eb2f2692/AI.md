---
name: mention-input
description: A rich text input component with @mention functionality that filters users, supports keyboard navigation, and highlights selected mentions.
keywords: mention, input, rich text, @mention, users, tagging, autocomplete
---

#### Mention Input

***Purpose:***
A rich text input field that allows users to mention others by typing '@' followed by a name, with smart filtering, keyboard navigation, and visual highlighting of selected mentions.

***Features:***
- Smart filtering that prioritizes matches by where the search term appears (start of name first)
- Keyboard navigation with arrow keys and Enter to select suggestions
- Popup positioned at cursor location for contextual suggestions
- Auto-dismissal when clicking outside or removing the '@' character
- Scrollable suggestion list for handling many results
- User cards with image, name and description
- Visual highlighting of selected mentions with blue background

***Properties:***
- initialValue: string - The initial HTML content of the input field
- placeholder: string - Placeholder text shown when the input is empty
- users: array - List of users that can be mentioned, with id, name, avatar, and description
- userIdPath: string - The property path to use as the user ID (when binding custom data)
- userNamePath: string - The property path to use as the user name (when binding custom data)
- userAvatarPath: string - The property path to use as the user avatar (when binding custom data)
- userDescriptionPath: string - The property path to use as the user description (when binding custom data)

***Events:***
- change: Triggered when the input content changes. Payload: { value: "content" }
- mention: Triggered when a user is mentioned. Payload: { user: {id, name, avatar, description} }
- initValueChange: Triggered when the initial value changes. Payload: { value: "content" }

***Exposed Actions:***
- `focus`: Focuses the input field. No arguments.
- `clear`: Clears the input content. No arguments.
- `setValue`: Sets the input content. Args: value (string)

***Exposed Variables:***
- value: The current HTML content of the input field. (path: variables['current_element_uid-value'])

***Notes:***
- The component uses contenteditable for rich text editing
- Mentions are highlighted with a blue background when selected
- The suggestion dropdown appears directly at the cursor position
- Users are filtered and sorted by relevance when typing after '@'
- Press Enter to select the top suggestion or use arrow keys to navigate
- Click outside or press Escape to dismiss the suggestions