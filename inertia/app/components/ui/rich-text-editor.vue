<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="editor-toolbar">
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="toolbar-button"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="toolbar-button"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        class="toolbar-button"
        title="Underline"
      >
        <u>U</u>
      </button>
      <div class="toolbar-divider"></div>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        class="toolbar-button"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        class="toolbar-button"
        title="Heading 3"
      >
        H3
      </button>
      <div class="toolbar-divider"></div>
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="toolbar-button"
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="toolbar-button"
        title="Numbered List"
      >
        1.
      </button>
      <div class="toolbar-divider"></div>
      <button
        type="button"
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
        class="toolbar-button"
        title="Add Link"
      >
        Link
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        class="toolbar-button"
        title="Align Left"
      >
        ⬅
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        class="toolbar-button"
        title="Align Center"
      >
        ↔
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        class="toolbar-button"
        title="Align Right"
      >
        ➡
      </button>
    </div>
    <editor-content :editor="editor" class="editor-content" />
    <div v-if="error" class="editor-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  content: props.modelValue || '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

const setLink = () => {
  if (!editor.value) return

  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('Enter URL:', previousUrl)

  if (url === null) return

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue || '')
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #d1d5db;
  flex-wrap: wrap;
}

.toolbar-button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.toolbar-button:hover {
  background-color: #e5e7eb;
}

.toolbar-button.is-active {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background-color: #d1d5db;
  margin: 0 0.25rem;
}

.editor-content {
  background-color: white;
}

.editor-error {
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border-top: 1px solid #fecaca;
}

:deep(.ProseMirror) {
  min-height: 200px;
}

:deep(.ProseMirror:focus) {
  outline: none;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #9ca3af;
  float: left;
  pointer-events: none;
  height: 0;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.ProseMirror ul) {
  list-style-type: disc;
}

:deep(.ProseMirror ol) {
  list-style-type: decimal;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror a) {
  color: #2563eb;
  text-decoration: underline;
}

:deep(.ProseMirror strong) {
  font-weight: bold;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}
</style>
