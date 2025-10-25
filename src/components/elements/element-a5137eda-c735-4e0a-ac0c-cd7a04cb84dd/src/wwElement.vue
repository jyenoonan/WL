<template>
  <div class="flex flex-col w-full" style="
    backgroundColor: #1e1e1e; 
    fontFamily: 'Google Sans', sans-serif; 
    height: 500px; /* FORCED HEIGHT FOR VISIBILITY */
    border: 5px dashed red; /* DEBUG BORDER - If this appears, the code is running! */
    box-sizing: border-box; 
  ">
    <div class="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden">
      <div 
        ref="messagesContainerRef" 
        class="flex-1 overflow-y-auto px-4 py-6"
        :style="{ scrollBehavior: content.autoScrollBehavior }"
      >
        <div v-if="displayMessages.length === 0" class="text-center py-16" style="color: #9aa0a6">
          Start a conversation or bind your messages array to see them here. (Success Checkpoint)
        </div>
        
        <div v-for="(message, index) in displayMessages" :key="message.id" class="mb-6">
          <div v-if="message.role === 'user'" class="flex justify-end">
            <div class="max-w-3xl">
              <div v-if="message.attachments && message.attachments.length > 0" class="mb-2 flex flex-wrap gap-2 justify-end">
                <div
                  v-for="(att, attIdx) in message.attachments"
                  :key="attIdx"
                  @click="handleAttachmentClick(att)"
                  class="rounded-2xl p-3 cursor-pointer transition-all"
                  style="backgroundColor: #292a2d; border: 1px solid #3c4043"
                  @mouseenter="e => e.currentTarget.style.borderColor = '#8ab4f8'"
                  @mouseleave="e => e.currentTarget.style.borderColor = '#3c4043'"
                >
                  <img
                    v-if="att.type.startsWith('image/')"
                    :src="att.url"
                    :alt="att.name"
                    class="max-w-xs rounded-lg"
                  />
                  <div v-else class="flex items-center gap-2">
                    <component :is="icons.Paperclip" class="w-4 h-4" style="color: #9aa0a6" />
                    <span class="text-sm" style="color: #e8eaed">{{ att.name }}</span>
                  </div>
                </div>
              </div>

              <div 
                class="rounded-3xl px-6 py-4" 
                style="backgroundColor: #2d2e30; color: #e8eaed; fontSize: 15px; lineHeight: 1.6"
                @contextmenu.prevent="(e) => handleMessageRightClick(e, message)"
              >
                <div v-html="renderMessageContent(message.content)"></div>
              </div>
            </div>
          </div>

          <div v-else class="flex justify-start">
            <div class="max-w-3xl">
              <div class="flex items-start gap-3">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style="background: linear-gradient(135deg, #8ab4f8 0%, #669df6 100%)"
                >
                  <span style="fontSize: 18px">✨</span>
                </div>
                <div class="flex-1">
                  <div 
                    class="mb-2"
                    style="color: #e8eaed; fontSize: 15px; lineHeight: 1.6"
                    @contextmenu.prevent="(e) => handleMessageRightClick(e, message)"
                  >
                    <div v-html="renderMessageContent(message.content)"></div>
                    <div v-if="message.streaming" class="inline-block w-1 h-4 ml-1 animate-pulse" style="backgroundColor: #8ab4f8"></div>
                  </div>
                  
                  <div 
                    v-if="hoveredMessageId === message.id && !message.streaming"
                    class="flex items-center gap-1"
                  >
                    <button 
                      class="p-2 rounded-full transition-colors"
                      style="backgroundColor: transparent"
                      @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
                      @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
                    >
                      <component :is="icons.ThumbsUp" class="w-4 h-4" style="color: #9aa0a6" />
                    </button>
                    <button 
                      class="p-2 rounded-full transition-colors"
                      style="backgroundColor: transparent"
                      @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
                      @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
                    >
                      <component :is="icons.ThumbsDown" class="w-4 h-4" style="color: #9aa0a6" />
                    </button>
                    <button 
                      class="p-2 rounded-full transition-colors"
                      style="backgroundColor: transparent"
                      @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
                      @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
                    >
                      <component :is="icons.RotateCw" class="w-4 h-4" style="color: #9aa0a6" />
                    </button>
                    <button 
                      class="p-2 rounded-full transition-colors"
                      style="backgroundColor: transparent"
                      @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
                      @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
                    >
                      <component :is="icons.Copy" class="w-4 h-4" style="color: #9aa0a6" />
                    </button>
                    <button 
                      class="p-2 rounded-full transition-colors"
                      style="backgroundColor: transparent"
                      @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
                      @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
                    >
                      <component :is="icons.Share" class="w-4 h-4" style="color: #9aa0a6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            @mouseenter="hoveredMessageId = message.id"
            @mouseleave="hoveredMessageId = null"
            style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; pointerEvents: none"
          ></div>
        </div>
      </div>

      <div class="px-4 pb-6 flex-shrink-0">
        <div v-if="pendingAttachments.length > 0" class="mb-4 flex flex-wrap gap-2">
          <div
            v-for="(att, index) in pendingAttachments"
            :key="index"
            @click="handlePendingAttachmentClick(att)"
            class="relative rounded-2xl p-3 cursor-pointer transition-all"
            style="backgroundColor: #292a2d; border: 1px solid #3c4043"
            @mouseenter="e => e.currentTarget.style.borderColor = '#8ab4f8'"
            @mouseleave="e => e.currentTarget.style.borderColor = '#3c4043'"
          >
            <button
              @click.stop="removePendingAttachment(index)"
              class="absolute -top-2 -right-2 rounded-full p-1 transition-colors"
              style="backgroundColor: #292a2d; border: 1px solid #3c4043"
              @mouseenter="e => { e.currentTarget.style.backgroundColor = '#3c4043'; e.currentTarget.style.borderColor = '#8ab4f8'; }"
              @mouseleave="e => { e.currentTarget.style.backgroundColor = '#292a2d'; e.currentTarget.style.borderColor = '#3c4043'; }"
            >
              <component :is="icons.X" class="w-3 h-3" style="color: #9aa0a6" />
            </button>
            <img
              v-if="att.type.startsWith('image/')"
              :src="att.url"
              :alt="att.name"
              class="max-w-xs rounded-lg"
            />
            <div v-else class="flex items-center gap-2">
              <component :is="icons.Paperclip" class="w-4 h-4" style="color: #9aa0a6" />
              <span class="text-sm" style="color: #e8eaed">{{ att.name }}</span>
            </div>
          </div>
        </div>

        <div class="relative">
          <div 
            class="rounded-3xl flex items-center gap-2 px-2 py-1 transition-all"
            :style="{
              backgroundColor: '#2d2e30',
              border: '2px solid ' + (isFocused ? '#8ab4f8' : '#3c4043')
            }"
          >
            <div 
              v-if="showMentions"
              class="absolute rounded-2xl shadow-2xl"
              style="backgroundColor: #292a2d; border: 1px solid #3c4043; bottom: 100%; left: 0; right: 0; marginBottom: 12px; zIndex: 1000; maxHeight: 400px; overflowY: auto"
            >
              <div
                v-for="(tool, index) in filteredToolsEnabled"
                :key="tool.id"
                @click="selectMention(tool)"
                @mousedown.prevent
                @mouseenter="selectedMentionIndex = index"
                class="px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors"
                :style="{
                  backgroundColor: index === selectedMentionIndex ? '#3c4043' : 'transparent'
                }"
              >
                <div class="text-base">{{ tool.icon }}</div>
                <div class="flex-1">
                  <div class="text-sm font-medium" style="color: #e8eaed">{{ tool.name }}</div>
                  <div v-if="tool.description" class="text-xs mt-0.5" style="color: #9aa0a6">{{ tool.description }}</div>
                </div>
              </div>
              <div v-if="filteredToolsDisabled.length > 0" style="borderTop: 1px solid #3c4043; paddingTop: 8px; marginTop: 8px">
                <div
                  v-for="tool in filteredToolsDisabled"
                  :key="tool.id"
                  class="px-4 py-3 flex items-center gap-3 opacity-50"
                >
                  <div class="text-base">{{ tool.icon }}</div>
                  <div class="flex-1">
                    <div class="text-sm font-medium" style="color: #e8eaed">{{ tool.name }}</div>
                    <div v-if="tool.description" class="text-xs mt-0.5" style="color: #9aa0a6">{{ tool.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              v-if="showTools"
              class="absolute rounded-2xl shadow-2xl"
              style="backgroundColor: #292a2d; border: 1px solid #3c4043; bottom: 100%; left: 0; marginBottom: 12px; minWidth: 280px; zIndex: 1000"
            >
              <div class="p-2">
                <div
                  v-for="tool in availableTools"
                  :key="tool.id"
                  @click="() => { showTools = false; console.log('Tool selected:', tool); }"
                  class="px-4 py-3 cursor-pointer rounded-xl transition-colors"
                  :style="{ opacity: tool.disabled ? 0.5 : 1 }"
                  @mouseenter="e => !tool.disabled && (e.currentTarget.style.backgroundColor = '#3c4043')"
                  @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
                >
                  <div class="flex items-center gap-3">
                    <div class="text-base">{{ tool.icon }}</div>
                    <div class="text-sm font-medium" style="color: #e8eaed">{{ tool.name }}</div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              v-if="content.allowAttachments"
              @click="fileInputRef && fileInputRef.click()" 
              class="p-2 rounded-full transition-colors flex-shrink-0"
              style="backgroundColor: transparent"
              @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
              @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
            >
              <component :is="icons.Plus" class="w-5 h-5" style="color: #9aa0a6" />
            </button>
            
            <button 
              v-if="content.showToolsButton"
              @click="showTools = !showTools" 
              class="p-2 rounded-full transition-colors flex-shrink-0"
              style="backgroundColor: transparent"
              @mouseenter="e => e.currentTarget.style.backgroundColor = '#3c4043'"
              @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
            >
              <component :is="icons.Settings" class="w-5 h-5" style="color: #9aa0a6" />
            </button>

            <div class="flex-1 relative flex items-center" style="minHeight: 56px">
              <div 
                v-if="!inputText"
                class="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none"
                style="fontSize: 15px; color: #5f6368"
              >
                {{ content.placeholderText }}
              </div>
              <div 
                v-if="inputText"
                class="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none"
                style="fontSize: 15px; whiteSpace: pre-wrap; wordBreak: break-word"
                v-html="renderInputWithColors(inputText)"
              ></div>
              <input
                ref="messageInputRef"
                v-model="inputText"
                @input="handleInput"
                @keydown="handleKeyDown"
                @focus="isFocused = true"
                @blur="handleBlur"
                placeholder=""
                :disabled="content.disabled"
                class="w-full outline-none"
                style="backgroundColor: transparent; border: none; fontSize: 15px; caretColor: #8ab4f8; color: transparent; position: relative; zIndex: 1"
              />
            </div>

            <button
              @click="sendMessage"
              :disabled="!canSend"
              class="rounded-full transition-all flex-shrink-0 p-3"
              :style="{
                backgroundColor: canSend ? '#8ab4f8' : 'transparent',
                cursor: canSend ? 'pointer' : 'not-allowed'
              }"
              @mouseenter="e => canSend && (e.currentTarget.style.backgroundColor = '#a8c7fa')"
              @mouseleave="e => canSend && (e.currentTarget.style.backgroundColor = '#8ab4f8')"
            >
              <component :is="icons.Send" class="w-5 h-5" :style="{ color: canSend ? '#1e1e1e' : '#5f6368' }" />
            </button>

            <input
              ref="fileInputRef"
              type="file"
              multiple
              :accept="content.allowedFileTypes && content.allowedFileTypes.join(',')"
              @change="handleFileSelect"
              style="display: none"
            />
          </div>
        </div>

        <div class="text-center mt-4 text-xs" style="color: #9aa0a6">
          Gemini can make mistakes, including about people, so double-check it. <a href="#" class="underline" style="color: #8ab4f8">Your privacy & Gemini</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// *** CRITICAL CHANGE: Now using Composition API imports (like your working component) ***
import { ref, computed, watch, nextTick } from 'vue';

// --- Icon Components (Manually Defined to avoid Npm dependency issues) ---
const createIconComponent = (name, paths) => ({
  name,
  props: ['class', 'style'],
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="class" :style="style">${paths}</svg>`
});

const icons = {
  Send: createIconComponent('Send', '<path d="m22 2-7 20-4-9-7-4Z"/><path d="M22 2 11 13"/>'),
  Plus: createIconComponent('Plus', '<path d="M5 12h14"/><path d="M12 5v14"/>'),
  Settings: createIconComponent('Settings', '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.46a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.52a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.46a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.46a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.52a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.46a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  ThumbsUp: createIconComponent('ThumbsUp', '<path d="M7 10v12"/><path d="M15 5h3a2 2 0 0 1 2 2v7.92c0 .94-.48 1.84-1.25 2.37L17 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h12V5a2 2 0 0 0-2-2h-2C9.4 3 8.35 4.3 8.4 6.6c.05 1.5 1 2.5 1 2.5"/>'),
  ThumbsDown: createIconComponent('ThumbsDown', '<path d="M17 14V2"/><path d="M9 19H6a2 2 0 0 1-2-2V9.08a2 2 0 0 1 1.25-1.87L7 6h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4c-1.5 0-2.6 1.1-2.7 3.4-.05 1.5-1 2.5-1 2.5"/>'),
  RotateCw: createIconComponent('RotateCw', '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.76 2.76L3 7"/><path d="M3 3v4h4"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.76-2.76L21 17"/><path d="M21 21v-4h-4"/>'),
  Copy: createIconComponent('Copy', '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  X: createIconComponent('X', '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  Share: createIconComponent('Share', '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>'),
  Paperclip: createIconComponent('Paperclip', '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.5-8.5a4 4 0 1 1 5.66 5.66l-9.2 9.2"/>')
};

// --- Vue 3 Composition API Structure ---
export default {
  name: 'GeminiChatUI',
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  emits: ['trigger-event'], // Explicitly declare events
  setup(props, { emit }) {
    // --- State Management (Replaces 'data') ---
    const internalMessages = ref([]);
    const inputText = ref('');
    const pendingAttachments = ref([]);
    const showMentions = ref(false);
    const showTools = ref(false);
    const mentionSearch = ref('');
    const selectedMentionIndex = ref(0);
    const isFocused = ref(false);
    const hoveredMessageId = ref(null);

    // --- Template Refs (must be returned) ---
    const messagesContainerRef = ref(null);
    const messageInputRef = ref(null);
    const fileInputRef = ref(null);

    // --- Computed Properties (Replaces 'computed') ---
    const displayMessages = computed(() => {
      return props.content.messages && props.content.messages.length > 0
        ? props.content.messages
        : internalMessages.value;
    });

    const availableTools = computed(() => {
      return props.content.availableTools || [];
    });

    const filteredTools = computed(() => {
      if (!mentionSearch.value) {
        return availableTools.value;
      }
      return availableTools.value.filter(tool =>
        tool.name.toLowerCase().includes(mentionSearch.value.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(mentionSearch.value.toLowerCase()))
      );
    });

    const filteredToolsEnabled = computed(() => filteredTools.value.filter(t => !t.disabled));
    const filteredToolsDisabled = computed(() => filteredTools.value.filter(t => t.disabled));

    const canSend = computed(() => {
      return !props.content.disabled && 
             (inputText.value.trim() || pendingAttachments.value.length > 0) && 
             !props.content.isStreaming;
    });

    // --- Methods (Replaces 'methods') ---
    const scrollToBottom = (smooth = false) => {
      if (messagesContainerRef.value) {
        messagesContainerRef.value.scrollTo({
          top: messagesContainerRef.value.scrollHeight,
          behavior: smooth ? props.content.autoScrollBehavior : 'instant'
        });
      }
    };

    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const renderMessageContent = (content) => {
      const parts = [];
      let currentIndex = 0;
      const toolNames = availableTools.value.map(t => t.name);
      
      for (let i = 0; i < content.length; i++) {
        if (content[i] === '@') {
          if (i > currentIndex) {
            parts.push(`<span>${escapeHtml(content.substring(currentIndex, i))}</span>`);
          }
          
          let matched = false;
          for (const toolName of toolNames) {
            if (content.substring(i + 1).startsWith(toolName)) {
              const mention = '@' + toolName;
              parts.push(`<span style="color: #8ab4f8">${escapeHtml(mention)}</span>`);
              currentIndex = i + mention.length;
              i = currentIndex - 1;
              matched = true;
              break;
            }
          }
          
          if (!matched) {
            parts.push(`<span>@</span>`);
            currentIndex = i + 1;
          }
        }
      }
      
      if (currentIndex < content.length) {
        parts.push(`<span>${escapeHtml(content.substring(currentIndex))}</span>`);
      }
      
      return parts.length > 0 ? parts.join('') : escapeHtml(content);
    };

    const renderInputWithColors = (text) => {
      const parts = [];
      let currentIndex = 0;
      const toolNames = availableTools.value.map(t => t.name);
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '@') {
          if (i > currentIndex) {
            parts.push(`<span style="color: #e8eaed">${escapeHtml(text.substring(currentIndex, i))}</span>`);
          }
          
          let matched = false;
          for (const toolName of toolNames) {
            if (text.substring(i + 1).startsWith(toolName + ' ') || text.substring(i + 1) === toolName) {
              const mention = '@' + toolName;
              parts.push(`<span style="color: #8ab4f8">${escapeHtml(mention)}</span>`);
              currentIndex = i + mention.length;
              i = currentIndex - 1;
              matched = true;
              break;
            }
          }
          
          if (!matched) {
            let end = i + 1;
            while (end < text.length && text[end] !== ' ') {
              end++;
            }
            const partial = text.substring(i, end);
            parts.push(`<span style="color: #8ab4f8">${escapeHtml(partial)}</span>`);
            currentIndex = end;
            i = end - 1;
          }
        }
      }
      
      if (currentIndex < text.length) {
        parts.push(`<span style="color: #e8eaed">${escapeHtml(text.substring(currentIndex))}</span>`);
      }
      
      return parts.join('');
    };

    const handleInput = (e) => {
      inputText.value = e.target.value; // Update ref value
      const value = inputText.value;
      const cursorPos = e.target.selectionStart;
      
      let atPos = -1;
      for (let i = cursorPos - 1; i >= 0; i--) {
        if (value[i] === '@') {
          atPos = i;
          break;
        }
        if (value[i] === ' ') {
          break;
        }
      }
      
      if (atPos !== -1 && props.content.enableMentions) {
        showMentions.value = true;
        mentionSearch.value = value.substring(atPos + 1, cursorPos);
        selectedMentionIndex.value = 0;
      } else {
        showMentions.value = false;
        mentionSearch.value = '';
      }
    };

    const handleBlur = () => {
      isFocused.value = false;
      // Use nextTick to allow selectMention click event to register before hiding
      nextTick(() => { 
        if (!isFocused.value) showMentions.value = false; 
      });
    }

    const handleKeyDown = (e) => {
      if (showMentions.value) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedMentionIndex.value = Math.min(selectedMentionIndex.value + 1, filteredToolsEnabled.value.length - 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          if (filteredToolsEnabled.value[selectedMentionIndex.value]) {
            selectMention(filteredToolsEnabled.value[selectedMentionIndex.value]);
          }
        } else if (e.key === 'Escape') {
          showMentions.value = false;
        }
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    const selectMention = (tool) => {
      const input = messageInputRef.value;
      if (!input) return;
      
      const cursorPos = input.selectionStart;
      const value = inputText.value;
      
      let atPos = -1;
      for (let i = cursorPos - 1; i >= 0; i--) {
        if (value[i] === '@') {
          atPos = i;
          break;
        }
      }
      
      if (atPos !== -1) {
        const before = value.substring(0, atPos);
        const after = value.substring(cursorPos);
        inputText.value = before + '@' + tool.name + ' ' + after;
        
        nextTick(() => {
          const newPos = (before + '@' + tool.name + ' ').length;
          input.setSelectionRange(newPos, newPos);
          input.focus();
        });
      }
      
      showMentions.value = false;
      mentionSearch.value = '';
    };

    const sendMessage = () => {
      if (!canSend.value) return;
      
      const newMessage = {
        id: `msg-${Date.now()}`,
        content: inputText.value,
        role: 'user',
        timestamp: new Date().toISOString(),
        attachments: [...pendingAttachments.value]
      };
      
      if (!props.content.messages || props.content.messages.length === 0) {
        internalMessages.value.push(newMessage);
      }
      
      emit('trigger-event', {
        name: 'message-sent',
        event: {
          message: newMessage,
          text: inputText.value,
          attachments: pendingAttachments.value
        }
      });
      
      inputText.value = '';
      pendingAttachments.value = [];
      
      nextTick(() => {
        messageInputRef.value && messageInputRef.value.focus();
      });
    };

    const handleFileSelect = (e) => {
      const files = Array.from(e.target.files);
      const maxSizeBytes = props.content.maxAttachmentSize;
      
      files.forEach(file => {
        if (file.size > maxSizeBytes) {
          alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          pendingAttachments.value.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: event.target.result,
            file: file
          });
        };
        
        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
      
      e.target.value = '';
    };

    const removePendingAttachment = (index) => {
      pendingAttachments.value.splice(index, 1);
    };

    const handleAttachmentClick = (attachment) => {
      emit('trigger-event', { name: 'attachment-clicked', event: { attachment } });
    };

    const handlePendingAttachmentClick = (attachment) => {
      emit('trigger-event', { name: 'pending-attachment-clicked', event: { attachment } });
    };

    const handleMessageRightClick = (e, message) => {
      emit('trigger-event', { name: 'message-right-click', event: { message, x: e.clientX, y: e.clientY } });
    };
    
    // --- Watchers (Replaces 'watch') ---
    watch(() => props.content.messages, (newMessages) => {
      if (newMessages && newMessages.length > 0) {
        internalMessages.value = newMessages;
      }
    }, { deep: true, immediate: true });

    watch(() => props.content.isStreaming, (isStreaming) => {
      if (isStreaming && props.content.streamingText) {
        const lastMsg = displayMessages.value[displayMessages.value.length - 1];
        
        if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.streaming) {
          if (!props.content.messages || props.content.messages.length === 0) {
            const streamingMsg = {
              id: `streaming-${Date.now()}`,
              content: props.content.streamingText,
              role: 'assistant',
              timestamp: new Date().toISOString(),
              streaming: true,
              attachments: []
            };
            internalMessages.value.push(streamingMsg);
          }
        } else {
          if (!props.content.messages || props.content.messages.length === 0) {
            const msgs = [...internalMessages.value];
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: props.content.streamingText };
            internalMessages.value = msgs;
          }
        }
      }
    });

    watch(displayMessages, () => {
      nextTick(() => {
        scrollToBottom(props.content.autoScrollBehavior === 'smooth');
      });
    }, { deep: true });


    // --- Return everything needed by the template ---
    return {
      icons,
      messagesContainerRef,
      messageInputRef,
      fileInputRef,
      inputText,
      pendingAttachments,
      showMentions,
      showTools,
      mentionSearch,
      selectedMentionIndex,
      isFocused,
      hoveredMessageId,
      displayMessages,
      availableTools,
      filteredToolsEnabled,
      filteredToolsDisabled,
      canSend,
      renderMessageContent,
      renderInputWithColors,
      handleInput,
      handleBlur,
      handleKeyDown,
      selectMention,
      sendMessage,
      handleFileSelect,
      removePendingAttachment,
      handleAttachmentClick,
      handlePendingAttachmentClick,
      handleMessageRightClick,
    };
  }
};
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>

---

### 3. Restart and Hard Refresh

You must do this last step every time to ensure the editor is loading the latest code.

1.  **Stop** your WeWeb development server (`Ctrl + C` or `Cmd + C`).
2.  **Restart** the server: `weweb serve`.
3.  **Hard Refresh** the WeWeb Editor: **`Ctrl + Shift + R`** (or **`Cmd + Shift + R`** on Mac).

If this refactored component still fails to load, the issue is beyond the component code and is a **bug in your specific WeWeb CLI version's build process** when handling large Vue components. At that point, you must follow the steps below:

* Open your browser's Developer Console (F12) and take a screenshot of the **red error message**.
* Submit that screenshot and the full `wwElement.vue` code to **WeWeb Support**.