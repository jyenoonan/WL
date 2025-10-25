<template>
    <div class="ww-chat-input-area">
        <!-- Input Container with Gemini styling -->
        <div class="ww-chat-input-area__container" :style="containerStyle">
            <!-- Mention Popup - Gemini Style -->
            <div
                v-if="showMentions && displayTools.length > 0"
                class="ww-mention-popup"
                :style="popupStyle"
            >
                <div v-if="enabledTools.length > 0" class="ww-mention-popup__section">
                    <div class="ww-mention-popup__label">Enabled</div>
                    <div
                        v-for="(tool, index) in enabledTools"
                        :key="tool.id"
                        class="ww-mention-popup__item"
                        :class="{ 'ww-mention-popup__item--selected': index === selectedMentionIndex }"
                        @mousedown.prevent="selectMention(tool)"
                        @mouseenter="selectedMentionIndex = index"
                    >
                        <div class="ww-mention-popup__icon" v-html="tool.icon"></div>
                        <div class="ww-mention-popup__content">
                            <div class="ww-mention-popup__name">{{ tool.name }}</div>
                            <div v-if="tool.description" class="ww-mention-popup__description">
                                {{ tool.description }}
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="disabledTools.length > 0" class="ww-mention-popup__section ww-mention-popup__section--disabled">
                    <div class="ww-mention-popup__label">Disabled</div>
                    <div
                        v-for="tool in disabledTools"
                        :key="tool.id"
                        class="ww-mention-popup__item ww-mention-popup__item--disabled"
                    >
                        <div class="ww-mention-popup__icon" v-html="tool.icon"></div>
                        <div class="ww-mention-popup__content">
                            <div class="ww-mention-popup__name">{{ tool.name }}</div>
                            <div v-if="tool.description" class="ww-mention-popup__description">
                                {{ tool.description }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tools Popup Menu -->
            <transition name="fade-scale">
                <div
                    v-if="showToolsPopup"
                    class="ww-tools-popup"
                    @click.stop
                >
                    <div class="ww-tools-popup__section">
                        <div
                            v-for="tool in displayTools"
                            :key="tool.id"
                            class="ww-tools-popup__item"
                            :class="{ 'ww-tools-popup__item--disabled': tool.disabled }"
                            @click="handleToolClick(tool)"
                        >
                            <div class="ww-tools-popup__icon" v-html="tool.icon"></div>
                            <div class="ww-tools-popup__content">
                                <div class="ww-tools-popup__name">{{ tool.name }}</div>
                                <div v-if="tool.description" class="ww-tools-popup__description">
                                    {{ tool.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- Attachment Menu Popup -->
            <transition name="fade-scale">
                <div
                    v-if="showAttachmentMenu"
                    class="ww-attachment-popup"
                    @click.stop
                >
                    <div
                        v-for="option in attachmentOptions"
                        :key="option.id"
                        class="ww-attachment-popup__item"
                        @click="handleAttachmentOption(option)"
                    >
                        <div class="ww-attachment-popup__icon" v-html="option.icon"></div>
                        <div class="ww-attachment-popup__label">{{ option.label }}</div>
                    </div>
                </div>
            </transition>

            <!-- Main Input Wrapper -->
            <div class="ww-chat-input-area__input-wrapper" :style="wrapperStyle">
                <!-- Text Input with Overlay -->
                <div class="ww-chat-input-area__input-content">
                    <!-- Colored text overlay for mentions -->
                    <div v-if="internalValue" class="ww-chat-input-area__overlay" :style="overlayStyle">
                        <span v-for="(part, index) in renderedParts" :key="index" :style="part.style">{{ part.text }}</span>
                    </div>
                    
                    <!-- Actual textarea (transparent text) -->
                    <textarea
                        ref="textarea"
                        v-model="internalValue"
                        class="ww-chat-input-area__textarea"
                        :style="textareaStyle"
                        :placeholder="placeholder"
                        :disabled="isDisabled"
                        rows="1"
                        @input="handleInput"
                        @keydown="handleKeyDown"
                        @focus="handleFocus"
                        @blur="handleBlur"
                    />
                </div>

                <!-- Action Buttons - Right side -->
                <div class="ww-chat-input-area__actions">
                    <button
                        v-if="allowAttachments"
                        class="ww-chat-input-area__btn ww-chat-input-area__btn--icon"
                        :style="iconButtonStyle"
                        type="button"
                        @click="toggleAttachmentMenu"
                        title="Add attachment"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                        </svg>
                    </button>

                    <!-- Microphone button -->
                    <button
                        class="ww-chat-input-area__btn ww-chat-input-area__btn--icon"
                        :style="iconButtonStyle"
                        type="button"
                        @click="handleMicrophoneClick"
                        title="Voice input"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM17.91 11C17.91 14.39 15.2 17.11 12 17.11C8.8 17.11 6.09 14.39 6.09 11H4C4 14.87 7.05 18.03 10.91 18.45V22H13.09V18.45C16.95 18.03 20 14.87 20 11H17.91Z" fill="currentColor"/>
                        </svg>
                    </button>

                    <button
                        class="ww-chat-input-area__btn ww-chat-input-area__btn--send"
                        :class="{ 'ww-chat-input-area__btn--send-active': canSend }"
                        :style="sendButtonStyle"
                        :disabled="!canSend"
                        type="button"
                        @click="handleSend"
                        title="Send message"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 20V4L22 12L3 20ZM5 17L16.85 12L5 7V10.5L11 12L5 13.5V17Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Bottom Row - Tools button -->
            <div class="ww-chat-input-area__bottom">
                <button
                    v-if="showToolsButton"
                    class="ww-chat-input-area__tools-btn"
                    :style="toolsButtonStyle"
                    type="button"
                    @click="toggleTools"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z" fill="currentColor"/>
                    </svg>
                    <span>Tools</span>
                </button>
            </div>
        </div>

        <!-- Hidden file input -->
        <input
            ref="fileInput"
            type="file"
            multiple
            style="display: none"
            @change="handleFileChange"
        />

        <!-- Hidden audio input -->
        <input
            ref="audioInput"
            type="file"
            accept="audio/*"
            style="display: none"
            @change="handleAudioChange"
        />
    </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

// Default tools that appear until user binds their own
const DEFAULT_TOOLS = [
    {
        id: 'calendar',
        name: 'Google Calendar',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2z"/></svg>',
        description: 'Access your calendar events',
        disabled: false,
    },
    {
        id: 'keep',
        name: 'Google Keep',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#FBBC04"><path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/></svg>',
        description: 'Access your notes',
        disabled: false,
    },
    {
        id: 'tasks',
        name: 'Google Tasks',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 10.5l-3.5 3.5-1.5-1.5L6.6 16l2.9 2.9 4.9-4.9-1.4-1.5z"/></svg>',
        description: 'Manage your tasks',
        disabled: false,
    },
    {
        id: 'gmail',
        name: 'Gmail',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#EA4335"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        description: 'Access your emails',
        disabled: false,
    },
    {
        id: 'docs',
        name: 'Google Docs',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 18h8v-2H8v2zm0-4h8v-2H8v2zm0-4h4V8H8v2z"/></svg>',
        description: 'Access your documents',
        disabled: false,
    },
    {
        id: 'drive',
        name: 'Google Drive',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M7.71 3.5L1.15 15l2.87 5h5.72l6.56-11.5h-5.72z" fill="#0066DA"/><path d="M14.43 3.5l6.56 11.5-2.87 5H12.4L5.84 8.5h5.72z" fill="#00AC47"/><path d="M8.14 20l-2.87-5 6.56-11.5L14.7 8.5z" fill="#EA4335"/></svg>',
        description: 'Access your files',
        disabled: false,
    },
    {
        id: 'workspace',
        name: 'Workspace',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="7" cy="7" r="3" fill="#4285F4"/><circle cx="17" cy="7" r="3" fill="#EA4335"/><circle cx="7" cy="17" r="3" fill="#FBBC04"/><circle cx="17" cy="17" r="3" fill="#34A853"/></svg>',
        description: 'Access workspace tools',
        disabled: false,
    },
    {
        id: 'youtube',
        name: 'YouTube Music',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000"><path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-2 11.5v-7l6 3.5-6 3.5z"/></svg>',
        description: 'Play music',
        disabled: true,
    },
];

export default {
    name: 'InputArea',
    props: {
        modelValue: { type: String, default: '' },
        isDisabled: { type: Boolean, default: false },
        allowAttachments: { type: Boolean, default: false },
        pendingAttachments: { type: Array, default: () => [] },
        mentionTools: { type: Array, default: () => [] },
        
        // Styling
        inputBgColor: { type: String, default: '#1e1e1e' },
        inputTextColor: { type: String, default: '#e3e3e3' },
        inputFontSize: { type: String, default: '16px' },
        inputFontWeight: { type: String, default: '400' },
        inputFontFamily: { type: String, default: 'system-ui, -apple-system, sans-serif' },
        inputPlaceholderColor: { type: String, default: '#9aa0a6' },
        inputBorderRadius: { type: String, default: '26px' },
        placeholder: { type: String, default: 'Can you @' },
        
        // Mention colors
        mentionColor: { type: String, default: '#8ab4f8' },
        popupBgColor: { type: String, default: '#292a2d' },
        popupBorderColor: { type: String, default: '#5f6368' },
        popupTextColor: { type: String, default: '#e3e3e3' },
        popupHoverBgColor: { type: String, default: '#3c4043' },
        popupDescriptionColor: { type: String, default: '#9aa0a6' },
        
        // Button colors
        sendButtonBgColor: { type: String, default: '#8ab4f8' },
        sendButtonBgColorActive: { type: String, default: '#8ab4f8' },
        iconButtonColor: { type: String, default: '#9aa0a6' },
        
        // Features
        showToolsButton: { type: Boolean, default: true },
        
        // Not used props for compatibility
        inputAreaBorder: { type: String, default: '' },
        textareaBorder: { type: String, default: '' },
        textareaBorderHover: { type: String, default: '' },
        textareaBorderFocus: { type: String, default: '' },
        inputHeight: { type: String, default: '' },
        actionAlign: { type: String, default: '' },
        sendIcon: { type: Object, default: null },
        sendIconColor: { type: String, default: '' },
        sendIconSize: { type: String, default: '' },
        attachmentIcon: { type: Object, default: null },
        attachmentIconColor: { type: String, default: '' },
        attachmentIconSize: { type: String, default: '' },
        removeIcon: { type: Object, default: null },
        removeIconColor: { type: String, default: '' },
        removeIconSize: { type: String, default: '' },
        sendButtonHoverBgColor: { type: String, default: '' },
        sendButtonBorder: { type: String, default: '' },
        sendButtonBorderRadius: { type: String, default: '' },
        sendButtonSize: { type: String, default: '' },
        sendButtonBoxShadow: { type: String, default: '' },
        attachmentButtonBgColor: { type: String, default: '' },
        attachmentButtonHoverBgColor: { type: String, default: '' },
        attachmentButtonBorder: { type: String, default: '' },
        attachmentButtonBorderRadius: { type: String, default: '' },
        attachmentButtonSize: { type: String, default: '' },
        attachmentButtonBoxShadow: { type: String, default: '' },
    },
    emits: ['update:modelValue', 'send', 'attachment', 'remove-attachment', 'pending-attachment-click', 'audio-selected', 'microphone-click', 'tool-selected', 'attachment-option-selected'],
    setup(props, { emit }) {
        const textarea = ref(null);
        const fileInput = ref(null);
        const audioInput = ref(null);
        const internalValue = ref(props.modelValue || '');
        const isFocused = ref(false);
        const showMentions = ref(false);
        const mentionSearch = ref('');
        const selectedMentionIndex = ref(0);
        const mentionStartPos = ref(-1);
        const showToolsPopup = ref(false);
        const showAttachmentMenu = ref(false);

        // Attachment options matching the screenshot
        const attachmentOptions = ref([
            {
                id: 'files',
                label: 'Add photos & files',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>',
            },
            {
                id: 'image',
                label: 'Create image',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
            },
            {
                id: 'thinking',
                label: 'Thinking',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
            },
            {
                id: 'research',
                label: 'Deep research',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
            },
            {
                id: 'study',
                label: 'Study and learn',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>',
            },
            {
                id: 'audio',
                label: 'Attach audio',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>',
            },
            {
                id: 'more',
                label: 'More',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
            },
        ]);

        // Use provided tools or default tools
        const displayTools = computed(() => {
            return props.mentionTools && props.mentionTools.length > 0 
                ? props.mentionTools 
                : DEFAULT_TOOLS;
        });

        watch(() => props.modelValue, newValue => {
            if (newValue !== internalValue.value) {
                internalValue.value = newValue || '';
            }
        });

        const canSend = computed(() => {
            return !props.isDisabled && internalValue.value.trim().length > 0;
        });

        const filteredTools = computed(() => {
            if (!mentionSearch.value) return displayTools.value;
            const search = mentionSearch.value.toLowerCase();
            return displayTools.value.filter(tool =>
                tool.name.toLowerCase().includes(search) ||
                (tool.description && tool.description.toLowerCase().includes(search))
            );
        });

        const enabledTools = computed(() => filteredTools.value.filter(t => !t.disabled));
        const disabledTools = computed(() => filteredTools.value.filter(t => t.disabled));

        const containerStyle = computed(() => ({
            backgroundColor: props.inputBgColor,
            borderRadius: props.inputBorderRadius,
        }));

        const wrapperStyle = computed(() => ({
            borderColor: isFocused.value ? props.mentionColor : 'transparent',
        }));

        const overlayStyle = computed(() => ({
            fontSize: props.inputFontSize,
            fontWeight: props.inputFontWeight,
            fontFamily: props.inputFontFamily,
            color: props.inputTextColor,
        }));

        const textareaStyle = computed(() => ({
            fontSize: props.inputFontSize,
            fontWeight: props.inputFontWeight,
            fontFamily: props.inputFontFamily,
            color: 'transparent',
            caretColor: props.inputTextColor,
        }));

        const popupStyle = computed(() => ({
            '--popup-bg': props.popupBgColor,
            '--popup-border': props.popupBorderColor,
            '--popup-text': props.popupTextColor,
            '--popup-hover': props.popupHoverBgColor,
            '--popup-desc': props.popupDescriptionColor,
        }));

        const iconButtonStyle = computed(() => ({
            color: props.iconButtonColor,
        }));

        const sendButtonStyle = computed(() => ({
            backgroundColor: canSend.value ? props.sendButtonBgColorActive : 'transparent',
            color: canSend.value ? '#1e1e1e' : props.iconButtonColor,
        }));

        const toolsButtonStyle = computed(() => ({
            color: props.iconButtonColor,
        }));

        const renderedParts = computed(() => {
            const text = internalValue.value;
            if (!text) return [];

            const parts = [];
            const toolNames = displayTools.value.map(t => t.name);
            let currentIndex = 0;

            for (let i = 0; i < text.length; i++) {
                if (text[i] === '@') {
                    if (i > currentIndex) {
                        parts.push({
                            text: text.substring(currentIndex, i),
                            style: { color: props.inputTextColor },
                        });
                    }

                    let matched = false;
                    for (const toolName of toolNames) {
                        if (text.substring(i + 1).startsWith(toolName + ' ') || text.substring(i + 1) === toolName) {
                            const mention = '@' + toolName;
                            parts.push({
                                text: mention,
                                style: { color: props.mentionColor },
                            });
                            currentIndex = i + mention.length;
                            i = currentIndex - 1;
                            matched = true;
                            break;
                        }
                    }

                    if (!matched) {
                        let end = i + 1;
                        while (end < text.length && text[end] !== ' ' && text[end] !== '\n') {
                            end++;
                        }
                        parts.push({
                            text: text.substring(i, end),
                            style: { color: props.inputTextColor },
                        });
                        currentIndex = end;
                        i = end - 1;
                    }
                }
            }

            if (currentIndex < text.length) {
                parts.push({
                    text: text.substring(currentIndex),
                    style: { color: props.inputTextColor },
                });
            }

            return parts;
        });

        const handleInput = () => {
            emit('update:modelValue', internalValue.value);
            adjustHeight();
            checkForMention();
        };

        const adjustHeight = () => {
            nextTick(() => {
                if (textarea.value) {
                    textarea.value.style.height = 'auto';
                    textarea.value.style.height = Math.min(textarea.value.scrollHeight, 200) + 'px';
                }
            });
        };

        const checkForMention = () => {
            const value = internalValue.value;
            const cursorPos = textarea.value?.selectionStart || 0;

            let atPos = -1;
            for (let i = cursorPos - 1; i >= 0; i--) {
                if (value[i] === '@') {
                    atPos = i;
                    break;
                }
                if (value[i] === ' ' || value[i] === '\n') break;
            }

            if (atPos !== -1) {
                const searchText = value.substring(atPos + 1, cursorPos);
                if (!/\s/.test(searchText)) {
                    mentionStartPos.value = atPos;
                    mentionSearch.value = searchText;
                    showMentions.value = true;
                    selectedMentionIndex.value = 0;
                    return;
                }
            }

            showMentions.value = false;
            mentionSearch.value = '';
            mentionStartPos.value = -1;
        };

        const selectMention = tool => {
            if (mentionStartPos.value === -1) return;

            const cursorPos = textarea.value?.selectionStart || 0;
            const before = internalValue.value.substring(0, mentionStartPos.value);
            const after = internalValue.value.substring(cursorPos);
            const newValue = before + '@' + tool.name + ' ' + after;

            internalValue.value = newValue;
            emit('update:modelValue', newValue);

            showMentions.value = false;
            mentionSearch.value = '';
            mentionStartPos.value = -1;

            nextTick(() => {
                if (textarea.value) {
                    const newCursorPos = before.length + tool.name.length + 2;
                    textarea.value.focus();
                    textarea.value.setSelectionRange(newCursorPos, newCursorPos);
                    adjustHeight();
                }
            });
        };

        const handleKeyDown = event => {
            if (showMentions.value) {
                const tools = enabledTools.value;
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    selectedMentionIndex.value = Math.min(selectedMentionIndex.value + 1, tools.length - 1);
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0);
                } else if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (tools[selectedMentionIndex.value]) {
                        selectMention(tools[selectedMentionIndex.value]);
                    }
                    return;
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    showMentions.value = false;
                    return;
                }
            } else if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
            }
        };

        const handleFocus = () => {
            isFocused.value = true;
        };

        const handleBlur = () => {
            isFocused.value = false;
            setTimeout(() => {
                showMentions.value = false;
                mentionSearch.value = '';
                mentionStartPos.value = -1;
            }, 200);
        };

        const handleSend = () => {
            if (!canSend.value) return;
            emit('send', internalValue.value);
            internalValue.value = '';
            emit('update:modelValue', '');
            nextTick(() => {
                if (textarea.value) {
                    textarea.value.style.height = 'auto';
                    textarea.value.focus();
                }
            });
        };

        const handleAttachmentClick = () => {
            fileInput.value?.click();
        };

        const handleFileChange = event => {
            const files = Array.from(event.target.files || []);
            emit('attachment', files);
            if (fileInput.value) fileInput.value.value = '';
        };

        const toggleTools = () => {
            showToolsPopup.value = !showToolsPopup.value;
            showAttachmentMenu.value = false;
        };

        const toggleAttachmentMenu = () => {
            showAttachmentMenu.value = !showAttachmentMenu.value;
            showToolsPopup.value = false;
        };

        const handleToolClick = (tool) => {
            if (!tool.disabled) {
                emit('tool-selected', tool);
                showToolsPopup.value = false;
            }
        };

        const handleAttachmentOption = (option) => {
            showAttachmentMenu.value = false;
            
            if (option.id === 'files') {
                fileInput.value?.click();
            } else if (option.id === 'audio') {
                audioInput.value?.click();
            } else {
                emit('attachment-option-selected', option);
            }
        };

        const handleAudioChange = (event) => {
            const files = Array.from(event.target.files || []);
            if (files.length > 0) {
                emit('audio-selected', files);
            }
            if (audioInput.value) audioInput.value.value = '';
        };

        const handleMicrophoneClick = () => {
            emit('microphone-click');
        };

        // Handle click outside to close popups
        const handleClickOutside = (event) => {
            const target = event.target;
            const toolsPopup = document.querySelector('.ww-tools-popup');
            const attachmentPopup = document.querySelector('.ww-attachment-popup');
            const toolsButton = document.querySelector('.ww-chat-input-area__tools-btn');
            const plusButton = document.querySelector('.ww-chat-input-area__btn--icon');

            if (showToolsPopup.value && toolsPopup && !toolsPopup.contains(target) && !toolsButton?.contains(target)) {
                showToolsPopup.value = false;
            }

            if (showAttachmentMenu.value && attachmentPopup && !attachmentPopup.contains(target) && !plusButton?.contains(target)) {
                showAttachmentMenu.value = false;
            }
        };

        // Lifecycle hooks
        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside);
        });

        return {
            textarea,
            fileInput,
            audioInput,
            internalValue,
            isFocused,
            showMentions,
            selectedMentionIndex,
            showToolsPopup,
            showAttachmentMenu,
            attachmentOptions,
            canSend,
            displayTools,
            filteredTools,
            enabledTools,
            disabledTools,
            containerStyle,
            wrapperStyle,
            overlayStyle,
            textareaStyle,
            popupStyle,
            iconButtonStyle,
            sendButtonStyle,
            toolsButtonStyle,
            renderedParts,
            handleInput,
            handleKeyDown,
            handleFocus,
            handleBlur,
            handleSend,
            handleAttachmentClick,
            handleFileChange,
            handleAudioChange,
            handleMicrophoneClick,
            selectMention,
            toggleTools,
            toggleAttachmentMenu,
            handleToolClick,
            handleAttachmentOption,
        };
    },
};
</script>

<style lang="scss" scoped>
.ww-chat-input-area {
    width: 100%;
    padding: 16px 0;

    &__container {
        max-width: 720px;
        margin: 0 auto;
        padding: 12px 16px;
        position: relative;
    }

    &__input-wrapper {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 12px 16px;
        border: 2px solid transparent;
        border-radius: 26px;
        background: rgba(255, 255, 255, 0.05);
        transition: border-color 0.2s;
        min-height: 56px;
    }

    &__input-content {
        flex: 1;
        position: relative;
        min-height: 24px;
    }

    &__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        pointer-events: none;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.5;
        padding: 0;
    }

    &__textarea {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        line-height: 1.5;
        min-height: 24px;
        max-height: 200px;
        overflow-y: auto;
        position: relative;
        z-index: 1;

        &::placeholder {
            color: #9aa0a6;
        }

        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }

    &__btn {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        background: transparent;

        &--icon {
            &:hover {
                background: rgba(255, 255, 255, 0.08);
            }
        }

        &--send {
            &:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            &:not(:disabled):hover {
                opacity: 0.9;
                transform: scale(1.05);
            }

            &-active {
                background: #8ab4f8;
            }
        }

        svg {
            width: 24px;
            height: 24px;
        }
    }

    &__bottom {
        display: flex;
        align-items: center;
        padding: 8px 0 0;
    }

    &__tools-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 16px;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background 0.2s;

        &:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        svg {
            width: 20px;
            height: 20px;
        }
    }
}

.ww-mention-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 16px;
    right: 16px;
    background: var(--popup-bg);
    border: 1px solid var(--popup-border);
    border-radius: 20px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;

    &__section {
        padding: 8px 0;

        &:not(:last-child) {
            border-bottom: 1px solid var(--popup-border);
        }

        &--disabled {
            opacity: 0.5;
        }
    }

    &__label {
        padding: 8px 20px 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: var(--popup-desc);
    }

    &__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        cursor: pointer;
        transition: background 0.15s;

        &:hover:not(&--disabled) {
            background: var(--popup-hover);
        }

        &--selected {
            background: var(--popup-hover);
        }

        &--disabled {
            cursor: not-allowed;
        }
    }

    &__icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
            width: 100%;
            height: 100%;
        }
    }

    &__content {
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-size: 14px;
        font-weight: 500;
        color: var(--popup-text);
        line-height: 1.4;
    }

    &__description {
        font-size: 13px;
        color: var(--popup-desc);
        margin-top: 2px;
        line-height: 1.3;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
}

.ww-tools-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 16px;
    background: #292a2d;
    border: 1px solid #5f6368;
    border-radius: 16px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
    min-width: 320px;
    max-width: 400px;
    z-index: 1001;
    overflow: hidden;

    &__section {
        padding: 8px 0;
    }

    &__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        cursor: pointer;
        transition: background 0.15s;

        &:hover:not(&--disabled) {
            background: #3c4043;
        }

        &--disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    &__icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
            width: 100%;
            height: 100%;
        }
    }

    &__content {
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-size: 14px;
        font-weight: 500;
        color: #e3e3e3;
        line-height: 1.4;
    }

    &__description {
        font-size: 13px;
        color: #9aa0a6;
        margin-top: 2px;
        line-height: 1.3;
    }
}

.ww-attachment-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 16px;
    background: #292a2d;
    border: 1px solid #5f6368;
    border-radius: 16px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
    min-width: 240px;
    z-index: 1001;
    overflow: hidden;
    padding: 8px 0;

    &__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        cursor: pointer;
        transition: background 0.15s;

        &:hover {
            background: #3c4043;
        }
    }

    &__icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9aa0a6;

        svg {
            width: 100%;
            height: 100%;
        }
    }

    &__label {
        font-size: 14px;
        font-weight: 400;
        color: #e3e3e3;
        line-height: 1.4;
    }
}

// Transitions
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.2s ease;
}

.fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}

.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}
</style>