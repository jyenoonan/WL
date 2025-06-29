<template>
  <div class="rich-text-mentions" :class="{ 'is-focused': isFocused }">
    <div
      ref="editorRef"
      class="editor-content"
      :style="{
        minHeight: content.minHeight || '100px',
        maxHeight: content.maxHeight,
        backgroundColor: content.backgroundColor,
        color: content.textColor,
        borderRadius: content.borderRadius,
        border: content.border || '1px solid #ddd',
        padding: content.padding || '10px',
        fontSize: content.fontSize,
        fontFamily: content.fontFamily
      }"
    ></div>

    <!-- Mentions dropdown positioned above the input -->
    <div
      v-if="showMentionsDropdown"
      class="mentions-dropdown"
      :style="{
        bottom: `${dropdownPosition.bottom}px`,
        left: `${dropdownPosition.left}px`,
        maxHeight: content.dropdownMaxHeight || '200px',
        width: content.dropdownWidth || '250px',
        backgroundColor: content.dropdownBackgroundColor || '#fff',
        border: content.dropdownBorder || '1px solid #ddd',
        borderRadius: content.dropdownBorderRadius || '4px',
        boxShadow: content.dropdownBoxShadow || '0 2px 10px rgba(0,0,0,0.1)'
      }"
    >
      <div
        v-for="(item, index) in filteredMentionItems"
        :key="index"
        class="mention-item"
        :class="{ 'is-selected': selectedMentionIndex === index }"
        @click="selectMention(item)"
        :style="{
          padding: content.dropdownItemPadding || '8px 12px',
          borderBottom: index < filteredMentionItems.length - 1 ? content.dropdownItemBorder || '1px solid #eee' : 'none'
        }"
      >
        <div class="mention-item-content">
          <div class="mention-item-image" v-if="item.image">
            <img :src="item.image" alt="" :style="{
              width: content.mentionImageSize || '24px',
              height: content.mentionImageSize || '24px',
              borderRadius: content.mentionImageBorderRadius || '50%',
              objectFit: 'cover'
            }">
          </div>
          <div class="mention-item-text" :style="{
            color: content.dropdownItemTextColor || '#333',
            fontSize: content.dropdownItemFontSize || '14px'
          }">
            {{ getMentionLabel(item) }}
          </div>
        </div>
      </div>
      <div v-if="filteredMentionItems.length === 0" class="no-results" :style="{
        padding: content.dropdownItemPadding || '8px 12px',
        color: content.dropdownItemTextColor || '#999',
        fontSize: content.dropdownItemFontSize || '14px',
        textAlign: 'center'
      }">
        No results found
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // Editor state
    const editorRef = ref(null);
    const editor = ref(null);
    const isFocused = ref(false);
    const currentMentionQuery = ref('');
    const showMentionsDropdown = ref(false);
    const selectedMentionIndex = ref(0);
    const dropdownPosition = ref({ bottom: 0, left: 0 });

    // Internal value handling
    const { value: internalValue, setValue: setInternalValue } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'value',
      type: 'string',
      defaultValue: computed(() => props.content?.initialValue || ''),
    });

    // Editor is in editing mode
    const isEditing = computed(() => {
      // eslint-disable-next-line no-unreachable
      return false;
    });

    // Get mention items with proper fallbacks
    const mentionItems = computed(() => {
      return props.content?.mentionItems || [];
    });

    // Filter mention items based on current query
    const filteredMentionItems = computed(() => {
      if (!currentMentionQuery.value) return mentionItems.value;

      const query = currentMentionQuery.value.toLowerCase();
      return mentionItems.value.filter(item => {
        const label = getMentionLabel(item);
        return label.toLowerCase().includes(query);
      });
    });

    // Get the label to display for a mention item
    const getMentionLabel = (item) => {
      if (!item) return '';

      // Use the labelPath if provided, otherwise fall back to name or id
      if (props.content?.mentionLabelPath) {
        return wwLib.wwUtils.resolveObjectPropertyPath(item, props.content.mentionLabelPath) || item.name || item.id || '';
      }

      return item.name || item.id || '';
    };

    // Initialize editor
    const initEditor = () => {
      if (!editorRef.value) return;

      // Destroy existing editor if it exists
      if (editor.value) {
        editor.value.destroy();
      }

      // Create new editor
      editor.value = new Editor({
        element: editorRef.value,
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: props.content?.placeholder || 'Type @ to mention...',
          }),
        ],
        content: internalValue.value || '',
        editable: !isEditing.value,
        onUpdate: ({ editor }) => {
          // Update internal value when content changes
          const newValue = editor.getHTML();
          if (internalValue.value !== newValue) {
            setInternalValue(newValue);
            emit('trigger-event', { name: 'change', event: { value: newValue } });
          }
        },
        onFocus: () => {
          isFocused.value = true;
          emit('trigger-event', { name: 'focus', event: {} });
        },
        onBlur: () => {
          // Small delay to allow for click events on the dropdown
          setTimeout(() => {
            isFocused.value = false;
            showMentionsDropdown.value = false;
            emit('trigger-event', { name: 'blur', event: {} });
          }, 200);
        },
        onTransaction: ({ transaction }) => {
          // Check for @ symbol to trigger mentions dropdown
          if (transaction.docChanged) {
            checkForMentionTrigger();
          }
        }
      });
    };

    // Check if we should show the mentions dropdown
    const checkForMentionTrigger = () => {
      if (!editor.value || isEditing.value) return;

      const { state } = editor.value;
      const { selection } = state;
      const { from } = selection;

      // Get text before cursor
      const textBefore = state.doc.textBetween(Math.max(0, from - 100), from, '\n');
      
      // Find the last @ symbol
      const lastAtPos = textBefore.lastIndexOf('@');
      
      if (lastAtPos !== -1) {
        // Check if there's a space between @ and cursor
        const textAfterAt = textBefore.substring(lastAtPos + 1);
        
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          currentMentionQuery.value = textAfterAt.trim();
          showMentionsDropdown.value = true;
          selectedMentionIndex.value = 0;
          
          // Position the dropdown above the cursor
          nextTick(() => {
            const { state } = editor.value;
            const { selection } = state;
            const { from } = selection;
            
            const domSelection = window.getSelection();
            if (domSelection.rangeCount === 0) return;
            
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const editorRect = editorRef.value.getBoundingClientRect();
            
            dropdownPosition.value = {
              bottom: editorRect.height - (rect.top - editorRect.top),
              left: rect.left - editorRect.left
            };
          });
          
          return;
        }
      }
      
      // Hide dropdown if no @ is found
      showMentionsDropdown.value = false;
    };

    // Select a mention from the dropdown
    const selectMention = (item) => {
      if (!editor.value || isEditing.value) return;

      const { state } = editor.value;
      const { selection } = state;
      const { from } = selection;
      
      // Get text before cursor
      const textBefore = state.doc.textBetween(Math.max(0, from - 100), from, '\n');
      
      // Find the last @ symbol
      const lastAtPos = textBefore.lastIndexOf('@');
      
      if (lastAtPos === -1) return;
      
      // Calculate the position in the document where @ starts
      const startPos = from - textBefore.length + lastAtPos;
      
      // Create a transaction to replace the text
      const tr = state.tr;
      
      // Delete from @ to cursor position
      tr.delete(startPos, from);
      
      // Create mention HTML
      const mentionLabel = getMentionLabel(item);
      const mentionHTML = `<span class="mention" data-mention-id="${item.id || ''}" style="color: ${props.content?.mentionColor || '#1e88e5'}; background-color: ${props.content?.mentionBackgroundColor || 'rgba(30, 136, 229, 0.1)'}; padding: 2px 4px; border-radius: 4px;">@${mentionLabel}</span> `;
      
      // Insert the mention HTML
      tr.insertText(mentionHTML, startPos);
      
      // Apply the transaction
      editor.value.view.dispatch(tr);
      
      // Hide the dropdown
      showMentionsDropdown.value = false;
      
      // Emit the mention event
      emit('trigger-event', { 
        name: 'mention', 
        event: { 
          item,
          value: editor.value.getHTML()
        } 
      });
      
      // Update internal value
      setInternalValue(editor.value.getHTML());
    };

    // Handle keyboard navigation in the dropdown
    const handleKeyDown = (event) => {
      if (!showMentionsDropdown.value || isEditing.value) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (filteredMentionItems.value.length > 0) {
            selectedMentionIndex.value = (selectedMentionIndex.value + 1) % filteredMentionItems.value.length;
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (filteredMentionItems.value.length > 0) {
            selectedMentionIndex.value = (selectedMentionIndex.value - 1 + filteredMentionItems.value.length) % filteredMentionItems.value.length;
          }
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredMentionItems.value[selectedMentionIndex.value]) {
            selectMention(filteredMentionItems.value[selectedMentionIndex.value]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          showMentionsDropdown.value = false;
          break;
      }
    };

    // Set value from external changes
    const setValue = (value) => {
      if (editor.value && value !== internalValue.value) {
        editor.value.commands.setContent(value || '');
        setInternalValue(value || '');
        emit('trigger-event', { name: 'change', event: { value: value || '' } });
      }
    };

    // Clear the editor content
    const clear = () => {
      if (editor.value) {
        editor.value.commands.clearContent();
        setInternalValue('');
        emit('trigger-event', { name: 'change', event: { value: '' } });
      }
    };

    // Focus the editor
    const focus = () => {
      if (editor.value && !isEditing.value) {
        editor.value.commands.focus();
      }
    };

    // Watch for changes to initialValue
    watch(() => props.content?.initialValue, (newValue) => {
      if (newValue !== internalValue.value) {
        setValue(newValue);
        emit('trigger-event', { name: 'initValueChange', event: { value: newValue || '' } });
      }
    });

    // Watch for changes to isEditing
    watch(isEditing, (newValue) => {
      if (editor.value) {
        editor.value.setOptions({ editable: !newValue });
      }
    });

    // Initialize editor on mount
    onMounted(() => {
      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown);
      
      // Initialize editor after a short delay to ensure DOM is ready
      setTimeout(() => {
        initEditor();
      }, 0);
    });

    // Clean up on unmount
    onBeforeUnmount(() => {
      if (editor.value) {
        editor.value.destroy();
      }

      // Remove keyboard event listener
      document.removeEventListener('keydown', handleKeyDown);
    });

    return {
      editorRef,
      isFocused,
      showMentionsDropdown,
      filteredMentionItems,
      selectedMentionIndex,
      dropdownPosition,
      internalValue,
      getMentionLabel,
      selectMention,
      setValue,
      clear,
      focus
    };
  }
};
</script>

<style lang="scss" scoped>
.rich-text-mentions {
  position: relative;
  width: 100%;

  .editor-content {
    width: 100%;
    outline: none;
    overflow-y: auto;
    word-break: break-word;

    &:focus {
      outline: none;
    }
  }

  .mentions-dropdown {
    position: absolute;
    z-index: 1000;
    overflow-y: auto;

    .mention-item {
      cursor: pointer;

      &:hover, &.is-selected {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .mention-item-content {
        display: flex;
        align-items: center;
        gap: 8px;

        .mention-item-image {
          flex-shrink: 0;

          img {
            display: block;
          }
        }

        .mention-item-text {
          flex-grow: 1;
        }
      }
    }
  }
}

:deep(.ProseMirror) {
  outline: none;
  min-height: inherit;
  height: 100%;

  p {
    margin: 0;
  }
}

:deep(.mention) {
  border-radius: 4px;
  padding: 2px 4px;
  font-weight: 500;
  white-space: nowrap;
  display: inline;
}

:deep(.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #aaa;
  pointer-events: none;
  height: 0;
}
</style>