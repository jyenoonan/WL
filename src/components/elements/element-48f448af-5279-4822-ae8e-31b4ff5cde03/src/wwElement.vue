<template>
  <div ref="dropdownRef" class="selectable-dropdown" :class="{ 'is-open': isOpen }">
    <div class="dropdown-header" @click="toggleDropdown">
      <div class="dropdown-label">
        <span v-if="selectedItems.length === 0">{{ content.placeholder }}</span>
        <span v-else-if="selectedItems.length === 1">{{ getItemDisplayValue(selectedItems[0]) }}</span>
        <span v-else>{{ selectedItems.length }} items selected</span>
      </div>
      <div class="dropdown-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="{ 'icon-rotated': isOpen }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div v-if="isOpen" class="dropdown-content">
      <div v-if="content.showSearch" class="dropdown-search">
        <input
          type="text"
          :placeholder="content.searchPlaceholder"
          v-model="searchQuery"
          @click.stop
        />
      </div>

      <div v-if="content.showSelectAll" class="dropdown-select-all">
        <div class="dropdown-item" @click.stop="toggleSelectAll">
          <div class="item-content">
            <span>{{ content.selectAllText }}</span>
          </div>
          <div class="item-check">
            <div v-if="allSelected" class="check-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007bff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="dropdown-items">
        <div
          v-for="(item, index) in filteredItems"
          :key="getItemId(item, index)"
          class="dropdown-item"
          @click.stop="toggleItem(item)"
        >
          <div class="item-content">
            <span>{{ getItemDisplayValue(item) }}</span>
          </div>
          <div class="item-check">
            <div v-if="isItemSelected(item)" class="check-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007bff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // A ref to the dropdown's root element
    const dropdownRef = ref(null);

    // Editor state
    const isEditing = computed(() => {
      // eslint-disable-next-line no-unreachable
      return false;
    });

    // Component state
    const isOpen = ref(false);
    const searchQuery = ref('');

    // Internal variable for selected items
    const { value: selectedItems, setValue: setSelectedItems } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedItems',
      type: 'array',
      defaultValue: computed(() => props.content.initialValue || []),
    });

    // Computed properties
    const items = computed(() => props.content?.items || []);
    const displayField = computed(() => props.content?.displayField || 'name');
    const valueField = computed(() => props.content?.valueField || 'id');

    const filteredItems = computed(() => {
      if (!searchQuery.value) return items.value;

      const query = searchQuery.value.toLowerCase();
      return items.value.filter(item => {
        const displayValue = getItemDisplayValue(item)?.toString().toLowerCase() || '';
        return displayValue.includes(query);
      });
    });

    const allSelected = computed(() => {
      if (!items.value || items.value.length === 0) return false;
      return selectedItems.value.length === items.value.length;
    });

    // Helper functions
    const getItemDisplayValue = (item) => {
      if (!item) return '';
      return item[displayField.value] || item.name || item.label || '';
    };

    const getItemId = (item, index) => {
      return item[valueField.value] || item.id || index;
    };

    // Methods
    const toggleDropdown = () => {
      if (isEditing.value) return;
      isOpen.value = !isOpen.value;

      if (isOpen.value) {
        emit('trigger-event', {
          name: 'open',
          event: {}
        });
      } else {
        emit('trigger-event', {
          name: 'close',
          event: {}
        });
      }
    };

    const closeDropdown = () => {
      if (isOpen.value) {
        isOpen.value = false;
        emit('trigger-event', {
          name: 'close',
          event: {}
        });
      }
    };

    // ✅ START OF FIX: More efficient and reactive way to check for selected items
    const selectedIds = computed(() => new Set((selectedItems.value || []).map(item => getItemId(item))));

    const isItemSelected = (item) => {
        if (!item) return false;
        return selectedIds.value.has(getItemId(item));
    };
    // ✅ END OF FIX

    const toggleItem = (item) => {
      if (isEditing.value) return;

      const isSelected = isItemSelected(item);
      let newSelectedItems;

      if (isSelected) {
        // Remove item
        newSelectedItems = selectedItems.value.filter(selectedItem => 
          getItemId(selectedItem) !== getItemId(item)
        );
      } else {
        // Add item
        newSelectedItems = [...selectedItems.value, item];
      }

      setSelectedItems(newSelectedItems);

      // Emit change event
      emit('trigger-event', {
        name: 'change',
        event: { 
          value: newSelectedItems,
          item: item,
          action: isSelected ? 'deselect' : 'select'
        }
      });
    };

    const toggleSelectAll = () => {
      if (isEditing.value) return;

      let newSelectedItems;

      if (allSelected.value) {
        // Deselect all
        newSelectedItems = [];
      } else {
        // Select all
        newSelectedItems = [...items.value];
      }

      setSelectedItems(newSelectedItems);

      // Emit change event
      emit('trigger-event', {
        name: 'change',
        event: { 
          value: newSelectedItems,
          action: allSelected.value ? 'deselectAll' : 'selectAll'
        }
      });
    };

    // Component actions
    const selectItem = (item) => {
      if (isEditing.value || !item) return;
      if (!isItemSelected(item)) {
        const newSelectedItems = [...selectedItems.value, item];
        setSelectedItems(newSelectedItems);
        
        emit('trigger-event', {
          name: 'change',
          event: { 
            value: newSelectedItems,
            item: item,
            action: 'select'
          }
        });
      }
    };

    const deselectItem = (item) => {
      if (isEditing.value || !item) return;
      if (isItemSelected(item)) {
        const newSelectedItems = selectedItems.value.filter(selectedItem => 
          getItemId(selectedItem) !== getItemId(item)
        );
        setSelectedItems(newSelectedItems);
        
        emit('trigger-event', {
          name: 'change',
          event: { 
            value: newSelectedItems,
            item: item,
            action: 'deselect'
          }
        });
      }
    };

    const selectAll = () => {
      if (isEditing.value) return;
      const newSelectedItems = [...items.value];
      setSelectedItems(newSelectedItems);
      
      emit('trigger-event', {
        name: 'change',
        event: { 
          value: newSelectedItems,
          action: 'selectAll'
        }
      });
    };

    const deselectAll = () => {
      if (isEditing.value) return;
      setSelectedItems([]);
      
      emit('trigger-event', {
        name: 'change',
        event: { 
          value: [],
          action: 'deselectAll'
        }
      });
    };

    const openDropdown = () => {
      if (isEditing.value || isOpen.value) return;
      isOpen.value = true;
      
      emit('trigger-event', {
        name: 'open',
        event: {}
      });
    };

    // Handle click outside to close dropdown using the template ref
    const handleClickOutside = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        closeDropdown();
      }
    };

    // Watch for changes in initialValue
    watch(() => props.content.initialValue, (newValue) => {
      if (newValue !== undefined) {
          setSelectedItems(newValue || []);
      }
    }, { deep: true });

    // Lifecycle hooks
    onMounted(() => {
      if (!isEditing.value) {
        document.addEventListener('click', handleClickOutside);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      dropdownRef, // Expose the ref to the template
      isOpen,
      searchQuery,
      selectedItems,
      filteredItems,
      displayField,
      valueField,
      allSelected,
      isEditing,
      toggleDropdown,
      closeDropdown,
      isItemSelected,
      toggleItem,
      toggleSelectAll,
      setSelectedItems,
      getItemDisplayValue,
      getItemId,
      // Expose actions
      selectItem,
      deselectItem,
      selectAll,
      deselectAll,
      openDropdown
    };
  },
  methods: {
    // Action methods
    selectItem(item) {
      this.selectItem(item);
    },
    deselectItem(item) {
      this.deselectItem(item);
    },
    selectAll() {
      this.selectAll();
    },
    deselectAll() {
      this.deselectAll();
    },
    openDropdown() {
      this.openDropdown();
    },
    closeDropdown() {
      this.closeDropdown();
    }
  }
};
</script>

<style lang="scss" scoped>
.selectable-dropdown {
  position: relative;
  width: v-bind('content.dropdownWidth || "100%"');
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  color: #333;

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid v-bind('content.borderColor || "#ddd"');
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    min-height: 38px;

    &:hover {
      border-color: #b3b3b3;
    }
  }

  &.is-open .dropdown-header {
    border-color: v-bind('content.accentColor || "#007bff"');
    box-shadow: 0 0 0 1px v-bind('content.accentColor || "#007bff"');
  }

  .dropdown-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-icon {
    margin-left: 8px;

    .icon-rotated {
      transform: rotate(180deg);
    }
  }

  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background-color: #fff;
    border: 1px solid v-bind('content.borderColor || "#ddd"');
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .dropdown-search {
    padding: 8px;
    border-bottom: 1px solid #eee;

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid v-bind('content.borderColor || "#ddd"');
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: v-bind('content.accentColor || "#007bff"');
      }
    }
  }

  .dropdown-select-all {
    border-bottom: 1px solid #eee;
  }

  .dropdown-items {
    overflow-y: auto;
    max-height: 250px;
  }

  .dropdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }

    .item-content {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-check {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;

      .check-icon {
        color: v-bind('content.accentColor || "#007bff"');
      }
    }
  }
}
</style>