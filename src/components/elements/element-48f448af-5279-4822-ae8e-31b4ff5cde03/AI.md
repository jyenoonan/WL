name: selectable-dropdown
description: A customizable dropdown component with selectable items that display checkmarks when selected, supporting search and multi-selection.
keywords: dropdown, select, multi-select, checkboxes, filter, search, selectable

#### Selectable Dropdown

***Purpose:***
A flexible dropdown component that allows users to select multiple items from a list, with each selected item displaying a blue checkmark. Users can toggle selection by clicking items, similar to WeWeb's data collection interface.

***Features:***
- Multi-select functionality with visual checkmark indicators
- Optional search filtering for large item lists
- "Select All" option for quick selection of all items
- Customizable display and value fields for working with complex data structures
- Responsive design that adapts to container width
- Maintains internal state of selected items

***Properties:***
- items: array - The list of items to display in the dropdown. Default structure is `[{label: 'Item 1', value: 'item1'}, ...]`
- displayField: string - The property from each item to display in the dropdown. Default is 'label'
- valueField: string - The property from each item to use as the unique identifier. Default is 'value'
- initialValue: array - The initially selected items in the dropdown
- placeholder: string - Text to display when no items are selected
- showSearch: boolean - Whether to show a search input in the dropdown
- searchPlaceholder: string - Placeholder text for the search input
- showSelectAll: boolean - Whether to show a "Select All" option
- selectAllText: string - Text for the "Select All" option
- dropdownWidth: string - The width of the dropdown (e.g., '100%', '300px')
- borderColor: string - The color of the dropdown border
- accentColor: string - The accent color used for selected items and focus states

***Events:***
- change: Triggered when selection changes. Payload: { value: [selected items array], item: {clicked item}, action: 'select'|'deselect'|'selectAll'|'deselectAll' }
- open: Triggered when the dropdown opens. No payload
- close: Triggered when the dropdown closes. No payload

***Exposed Actions:***
- `selectItem`: Select a specific item. Args: item (object)
- `deselectItem`: Deselect a specific item. Args: item (object)
- `selectAll`: Select all available items
- `deselectAll`: Deselect all items
- `openDropdown`: Open the dropdown
- `closeDropdown`: Close the dropdown

***Exposed Variables:***
- selectedItems: Array of currently selected items. (path: variables['current_element_uid-selectedItems'])

***Notes:***
- The component maintains its own internal state of selected items, making it easy to integrate with data sources
- When binding to dynamic data, make sure your items have consistent structure with unique identifiers
- For Supabase integration, you can use the 'change' event to trigger updates to your database 

***Supabase Integration:***
To update a Supabase row when an item is selected/deselected:

1. Create a Supabase action in WeWeb that updates a specific column to true/false
2. Connect the dropdown's 'change' event to this action
3. In the action configuration, use the event payload to determine:
- Which item was clicked (event.item)
- Whether it was selected or deselected (event.action)
- Pass the appropriate true/false value to your Supabase update

Example workflow:
1. User clicks an item in the dropdown
2. The 'change' event fires with payload containing the clicked item and action ('select' or 'deselect')
3. Your WeWeb action receives this payload and calls Supabase with:
- Table name: 'your_table'
- Row identifier: Based on event.item.id (or whatever unique identifier your items have)
- Column to update: 'is_selected'
- New value: event.action === 'select' ? true : false

This creates a complete selection system that persists selections to your Supabase database. 

***Supabase Integration with workflow_api_information:***
To toggle the Display_Frontend column in the workflow_api_information table:

1. Create a workflow that triggers on item selection:
```javascript
// Function to toggle item selection and update Supabase
function toggleItemSelection(itemId) {
// Check if item is already selected
const isSelected = selectedItems.includes(itemId);

// Update local selection state
if (isSelected) {
// Remove from selection
const newSelectedItems = selectedItems.filter(id => id !== itemId);
setSelectedItems(newSelectedItems);

// Update Supabase - set Display_Frontend to false
await supabase
.from('workflow_api_information')
.update({ Display_Frontend: false })
.eq('id', itemId);
} else {
// Add to selection
const newSelectedItems = [...selectedItems, itemId];
setSelectedItems(newSelectedItems);

// Update Supabase - set Display_Frontend to true
await supabase
.from('workflow_api_information')
.update({ Display_Frontend: true })
.eq('id', itemId);
}

// Refresh data to show latest changes
await fetchWorkflowApiInformation();
}
```

2. Connect the dropdown's 'change' event to this workflow
3. After updating the database, refresh your collection to show the latest changes

This creates a complete selection system that persists the Display_Frontend status to your Supabase database.