<template>
  <div class="mention-input-container" ref="containerRef">
    <div
      class="mention-input"
      ref="inputRef"
      contenteditable="true"
      @input="onInput"
      @keydown="onKeyDown"
      @click="onClick"
      @blur="onBlur"
      :placeholder="content.placeholder"
      :style="inputStyle"
    ></div>

    <div
      v-if="showSuggestions && filteredUsers.length > 0"
      class="mention-suggestions"
      :style="suggestionPosition"
      ref="suggestionsRef"
    >
      <div class="mention-suggestions-scroll">
        <div
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          class="mention-suggestion-item"
          :class="{ active: index === activeIndex }"
          @mousedown.prevent="selectUser(user)"
          @mouseover="activeIndex = index"
        >
          <div class="mention-suggestion-avatar">
            <img :src="user.avatar || defaultAvatar" alt="User avatar" />
          </div>
          <div class="mention-suggestion-info">
            <div class="mention-suggestion-name">{{ user.name }}</div>
            <div class="mention-suggestion-description">{{ user.description || '' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // Editor state
    const isEditing = computed(() => {
      // eslint-disable-next-line no-unreachable
      return false;
    });

    // Internal value
    const { value: inputValue, setValue: setInputValue } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'value',
      type: 'string',
      defaultValue: computed(() => props.content.initialValue || ''),
    });

    // DOM refs
    const inputRef = ref(null);
    const containerRef = ref(null);
    const suggestionsRef = ref(null);

    // Mention state
    const mentionQuery = ref('');
    const showSuggestions = ref(false);
    const activeIndex = ref(0);
    const cursorPosition = ref({ top: 0, left: 0 });
    const defaultAvatar = 'https://cdn.weweb.app/public/images/placeholder.jpg';

    // Track if we're currently in a mention
    const inMention = ref(false);
    const mentionStartPosition = ref(null);

    // Computed properties
    const users = computed(() => props.content.users || []);

    const inputStyle = computed(() => {
      // Use fontSize from props, or default to 14
      const size = props.content.fontSize || 14;
      return {
        fontSize: `${size}px`,
      };
    });

    const filteredUsers = computed(() => {
      if (!mentionQuery.value) return users.value;

      const query = mentionQuery.value.toLowerCase();

      // First, filter users that contain the query
      const matchingUsers = users.value.filter(user =>
        user.name.toLowerCase().includes(query)
      );

      // Then sort them by relevance:
      // 1. Names that start with the query
      // 2. Names where query appears elsewhere
      return matchingUsers.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(query);
        const bStartsWith = b.name.toLowerCase().startsWith(query);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // If both start with query or both don't, sort alphabetically
        return a.name.localeCompare(b.name);
      });
    });

    const suggestionPosition = computed(() => {
      // Position the popup 10px above the cursor
      return {
        top: `${cursorPosition.value.top - 10}px`,
        left: `${cursorPosition.value.left}px`,
        transform: 'translateY(-100%)', // Move it up by its full height
      };
    });

    // Utility to get plain text value from contenteditable
    const getPlainTextValue = () => {
      if (!inputRef.value) return '';
      // innerText automatically strips HTML. Replace non-breaking spaces with regular spaces.
      return inputRef.value.innerText.replace(/\u00A0/g, ' ');
    };


    // Methods
    const updateCursorPosition = () => {
      if (!inputRef.value) return;

      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.value.getBoundingClientRect();

      cursorPosition.value = {
        top: rect.bottom - containerRect.top,
        left: rect.left - containerRect.left,
      };
    };

    const onInput = (event) => {
      if (isEditing.value) return;

      // Update the component's value with the plain text version
      const plainText = getPlainTextValue();
      setInputValue(plainText);
      emit('trigger-event', { name: 'change', event: { value: plainText } });

      // Check for @ mentions
      const selection = window.getSelection();
      if (!selection.rangeCount) {
          return;
      }

      const range = selection.getRangeAt(0);
      let currentNode = range.startContainer;
      let currentOffset = range.startOffset;

      if (currentNode.nodeType !== Node.TEXT_NODE) {
        // If we're not in a text node (e.g., inside a mention span)
        // Try to find the nearest text node sibling if typing after a mention
        if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.classList.contains('mention-tag')) {
          // If cursor is directly inside a mention tag, move it outside
          if (range.collapsed) {
            currentNode = currentNode.nextSibling; // Try sibling after mention
            currentOffset = 0; // Start at beginning of that sibling
          }
        }

        if (!currentNode || currentNode.nodeType !== Node.TEXT_NODE) {
          inMention.value = false;
          showSuggestions.value = false;
          return;
        }
      }

      const textBeforeCursor = currentNode.textContent.substring(0, currentOffset);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');

      // Check if the last '@' is preceded by a space or is at the beginning of the content
      const isAtStartOrAfterSpace = lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ' || textBeforeCursor[lastAtIndex - 1] === '\u00A0';

      if (lastAtIndex === -1 || !isAtStartOrAfterSpace) {
        inMention.value = false;
        showSuggestions.value = false;
        return;
      }

      // Extract the query (text after @)
      // Ensure we only consider text until the next space
      const potentialQuery = textBeforeCursor.substring(lastAtIndex + 1);
      const spaceAfterQueryIndex = potentialQuery.indexOf(' ');

      mentionQuery.value = spaceAfterQueryIndex === -1 ? potentialQuery : potentialQuery.substring(0, spaceAfterQueryIndex);

      // Only show suggestions if there's an actual query or if just '@'
      inMention.value = true;
      mentionStartPosition.value = {
        node: currentNode,
        offset: lastAtIndex,
      };

      showSuggestions.value = mentionQuery.value.length >= 0; // Show even for just '@'
      activeIndex.value = 0;

      // Update position for the suggestions dropdown
      updateCursorPosition();
    };

    const onKeyDown = (event) => {
      if (isEditing.value) return;

      if (event.key === 'Enter') {
        event.preventDefault(); // Always prevent default new line behavior for Enter
        if (showSuggestions.value && filteredUsers.value.length > 0) {
          // If suggestions are active and there are users, select the active one
          selectUser(filteredUsers.value[activeIndex.value]);
          return; // Stop further processing as mention is selected
        } else {
          // If no suggestions, or no user found in suggestions, trigger main workflow
          emit('trigger-event', { name: 'enterPressed', event: { value: getPlainTextValue() } });

          // Reset the input after sending the message
          if (inputRef.value) {
            inputRef.value.innerHTML = '';
          }
          setInputValue('');
          
          return; // Stop further processing
        }
      }

      // Handle ArrowUp/ArrowDown/Escape only when suggestions are active
      if (showSuggestions.value) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            activeIndex.value = (activeIndex.value + 1) % filteredUsers.value.length;
            break;
          case 'ArrowUp':
            event.preventDefault();
            activeIndex.value = (activeIndex.value - 1 + filteredUsers.value.length) % filteredUsers.value.length;
            break;
          case 'Escape':
            event.preventDefault();
            showSuggestions.value = false;
            break;
        }
      }
    };

    const selectUser = (user) => {
      if (!inMention.value || !mentionStartPosition.value) return;

      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const currentNode = mentionStartPosition.value.node;
      const startOffset = mentionStartPosition.value.offset; // Start of '@'
      const endOffset = range.startOffset; // Current cursor position/end of query

      // 1. Create the mention span
      const mentionSpan = document.createElement('span');
      mentionSpan.className = 'mention-tag';
      mentionSpan.setAttribute('data-user-id', user.id);
      mentionSpan.textContent = `@${user.name}`;

      // 2. Create a plain text node for the space after the mention
      // Using a non-breaking space for more consistent cursor behavior
      const spaceNode = document.createTextNode('\u00A0');

      // 3. Create a document fragment to hold our changes
      const fragment = document.createDocumentFragment();

      // Get text content of the current node
      const fullTextOfNode = currentNode.textContent;

      // Add text before mention (e.g., "Hello ")
      const textBeforeMention = fullTextOfNode.substring(0, startOffset);
      if (textBeforeMention) {
        fragment.appendChild(document.createTextNode(textBeforeMention));
      }

      // Add the mention span (@User Name)
      fragment.appendChild(mentionSpan);

      // Add the plain text space after the mention
      fragment.appendChild(spaceNode);

      // Add text that was after the mention query, but before the cursor
      // This handles cases like "@user|text after" where | is the cursor
      const textAfterMentionQueryAndCursor = fullTextOfNode.substring(endOffset);
      if (textAfterMentionQueryAndCursor) {
        fragment.appendChild(document.createTextNode(textAfterMentionQueryAndCursor));
      }

      // Replace the current node with our fragment
      const parentNode = currentNode.parentNode;
      parentNode.replaceChild(fragment, currentNode);

      // Reset mention state
      inMention.value = false;
      showSuggestions.value = false;
      mentionQuery.value = '';

      // 4. Place cursor immediately after the *plain text space*
      const newRange = document.createRange();
      newRange.setStart(spaceNode, 1); // Set after the single character in spaceNode
      newRange.setEnd(spaceNode, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Ensure the input field receives focus after DOM manipulation
      inputRef.value.focus();

      // Update the component's value with the plain text version
      const plainText = getPlainTextValue();
      setInputValue(plainText);
      emit('trigger-event', { name: 'mention', event: { user } });
      emit('trigger-event', { name: 'change', event: { value: plainText } }); // Emit plain text
    };

    const onClick = () => {
      if (isEditing.value) return;

      // Check if we're still in a mention (e.g., clicked inside an active mention span)
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const currentNode = range.startContainer;

      // If clicked inside a mention-tag, keep it as is, but hide suggestions
      if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.classList.contains('mention-tag')) {
        showSuggestions.value = false;
        inMention.value = false; // Reset mention state for new typing
        return;
      }

      updateCursorPosition();

      // Reset mention state if we clicked elsewhere (outside a mention-tag)
      inMention.value = false;
      showSuggestions.value = false;
    };

    const onBlur = () => {
      if (isEditing.value) return;

      // Delay hiding suggestions to allow for clicks on the suggestions
      setTimeout(() => {
        showSuggestions.value = false;
      }, 200);
    };

    // Handle clicks outside the component
    const handleClickOutside = (event) => {
      if (containerRef.value && !containerRef.value.contains(event.target)) {
        showSuggestions.value = false;
      }
    };

    // Initialize the component
    onMounted(() => {
      // When initializing, set innerHTML from inputValue, but assume inputValue is plain text initially
      if (inputValue.value && inputRef.value) {
        // Here, if initialValue might contain HTML, you'd need a parser.
        // For now, assume initialValue is plain text and just set it as innerText
        // or reconstruct mentions if they are encoded in a specific way in initialValue
        inputRef.value.innerText = inputValue.value; // Set initial plain text
      }

      document.addEventListener('mousedown', handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });

    // Watch for changes to initialValue
    watch(() => props.content.initialValue, (newValue) => {
      if (newValue !== undefined && newValue !== getPlainTextValue()) { // Compare with current plain text
        // If the new initialValue is plain text, just set innerText
        if (inputRef.value) {
          inputRef.value.innerText = newValue;
          setInputValue(newValue); // Update the component's internal value too

          // After setting innerHTML, ensure cursor is at the end if it's a fresh load
          if (document.activeElement !== inputRef.value) { // Only if not actively typing
            const range = document.createRange();
            const selection = window.getSelection();
            if (inputRef.value.lastChild) {
              range.setStartAfter(inputRef.value.lastChild);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }
    }, { immediate: true }); // Run immediately on mount

    return {
      inputRef,
      containerRef,
      suggestionsRef,
      inputValue,
      showSuggestions,
      filteredUsers,
      activeIndex,
      suggestionPosition,
      defaultAvatar,
      inputStyle,
      onInput,
      onKeyDown,
      onClick,
      onBlur,
      selectUser
    };
  }
};
</script>

<style lang="scss" scoped>
.mention-input-container {
  position: relative;
  width: 100%;
}

.mention-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: none;
  outline: none;
  /* font-size is now handled by a dynamic inline style */
  line-height: 1.5;
  overflow-y: auto;
  background-color: transparent;

  &:focus {
    border: none;
    outline: none;
    box-shadow: none;
  }

  &[placeholder]:empty:before {
    content: attr(placeholder);
    color: #999;
    pointer-events: none;
  }
}

.mention-suggestions {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 280px;
  max-height: 300px;
  z-index: 1000;
}

.mention-suggestions-scroll {
  max-height: 300px;
  overflow-y: auto;
}

.mention-suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;

  &:hover, &.active {
    background-color: #f5f8ff;
  }
}

.mention-suggestion-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.mention-suggestion-info {
  flex: 1;
}

.mention-suggestion-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.mention-suggestion-description {
  font-size: 12px;
  color: #666;
}
</style>

<style>
/* Non-scoped styles to target generated elements */
.mention-tag {
  background-color: #e8f2ff;
  color: #0366d6 !important;
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 500;
  white-space: nowrap;
}

/* Ensure all text nodes are black by default */
.mention-input {
  color: #000000;
}

/* Ensure all spans inside have black text by default */
.mention-input span:not(.mention-tag) {
  color: #000000 !important;
}

/* Only mention tags should be blue */
.mention-input .mention-tag {
  color: #0366d6 !important;
  background-color: #e8f2ff;
}
</style>