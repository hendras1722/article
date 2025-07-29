<template>
  <div>
    <div class="bg-slate-300 px-3 py-2 flex gap-1 items-center overflow-auto">
      <template v-if="editor">
        <dropdown v-model="textLevelSelected" :items="textLevel" @update:model-value="handleChooseHead" />

        <dropdown v-model="textAlign" :items="textAlignment" orientation="horizontal"
          @update:model-value="handleChooseAlignment">
          <template #selected="{ value }">
            <component :is="iconAlignment[value]" class="w-4 h-4" />
          </template>
          <template #item="{ item }">
            <component :is="iconAlignment[item.value]" class="w-4 h-4" />
          </template>
        </dropdown>

        <button class="text-black  border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">
          <Bold class="w-4 h-4" />
        </button>
        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()">
          <Italic class="w-4 h-4" />
        </button>
        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('subscript') }"
          @click="editor.chain().focus().toggleSubscript().run()">
          <SubscriptIcon class="w-4 h-4" />
        </button>
        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('superscript') }"
          @click="editor.chain().focus().toggleSuperscript().run()">
          <SuperscriptIcon class="w-4 h-4" />
        </button>

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()">
          <StrikethroughIcon class="w-4 h-4" />
        </button>

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()">
          <UnderlineIcon class="w-4 h-4" />
        </button>
        <button class="text-black border border-white p-3 align-middle font-semibold rounded" :class="{
          'font-bold bg-white': editor.isActive('highlight'),
        }" @click="editor.chain().focus().toggleHighlight().run()">
          <HighlighterIcon class="w-4 h-4" />
        </button>

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="1em" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M8 4h13v2H8V4Zm-5-.5h3v3H3v-3Zm0 7h3v3H3v-3Zm0 7h3v3H3v-3ZM8 11h13v2H8v-2Zm0 7h13v2H8v-2Z"></path>
          </svg>
        </button>

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()">
          <List class="w-4 h-4" />
        </button>

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()">
          <Blocks class="w-4 h-4" />
        </button>
        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          :class="{ 'font-bold bg-white': editor.isActive('blockquote') }" @click="handleUploadImage">
          <ImageIcon class="w-4 h-4" />
        </button>
        <input ref="inputImage" type="file" accept=".jpg,.jpeg,.png" class="hidden" @change="handleChangeImage" />

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          @click="editor.chain().focus().undo().run()">
          <UndoIcon class="w-4 h-4" />
        </button>

        <button class="text-black border border-white p-3 align-middle font-semibold rounded"
          @click="editor.chain().focus().redo().run()">
          <RedoIcon class="w-4 h-4" />
        </button>
      </template>
    </div>

    <div class="border-4 border-slate-300 rounded-b-lg p-2">
      <editor-content :editor="editor" class="h-[100px] overflow-auto" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Heading, { Level } from "@tiptap/extension-heading";
import TextAlignment from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Blocks, Bold, HighlighterIcon, ImageIcon, Italic, List, RedoIcon, StrikethroughIcon, SubscriptIcon, SuperscriptIcon, UnderlineIcon, UndoIcon } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined,
  },
  uploadImageFn: {
    type: Function,
    default: undefined,
  },
});
const emits = defineEmits(["update:modelValue"]);

const textAlign = ref("left");
const textLevelSelected = ref<number | "paragraph">("paragraph");
const inputImage = ref<HTMLInputElement>();

const vModel = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emits("update:modelValue", value);
  },
});
const textAlignment = [
  {
    text: "Left",
    value: "left",
  },
  {
    text: "Center",
    value: "center",
  },
  {
    text: "Right",
    value: "right",
  },
  {
    text: "Justify",
    value: "justify",
  },
];
const iconAlignment: Record<any, any> = {
  left: AlignLeft,
  right: AlignRight,
  center: AlignCenter,
  justify: AlignJustify,
};
const textLevel = [
  {
    text: "Paragraph",
    value: "paragraph",
  },
  ...Array.from({ length: 6 }, (_, i) => ({
    text: `Heading ${i + 1}`,
    value: i + 1,
  })),
];
const defaultHeadingClass = "font-bold";
const headingClass: Record<Level, string> = {
  1: "text-7xl",
  2: "text-6xl",
  3: "text-5xl",
  4: "text-4xl",
  5: "text-2xl",
  6: "text-xl",
};

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: false,
      bulletList: {
        HTMLAttributes: {
          class: "list-disc",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "list-decimal",
        },
      },
    }),
    Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }).extend({
      renderHTML({ node, HTMLAttributes }) {
        return [
          `h${node.attrs.level}`,
          {
            ...HTMLAttributes,
            class: `${defaultHeadingClass} ${headingClass[node.attrs.level as Level]
              }`,
          },
          0,
        ];
      },
    }),
    TextAlignment.configure({
      types: ["heading", "paragraph"],
    }),
    Underline,
    Subscript,
    Superscript,
    Highlight,
    Image.configure({
      inline: true,
    }),
  ],
  onUpdate: (value) => {
    // HTML
    vModel.value = value.editor.getHTML();
  },
  onSelectionUpdate(event) {
    if (event.editor?.isActive("heading")) {
      [1, 2, 3, 4, 5, 6].forEach((level) => {
        if (event.editor.isActive("heading", { level })) {
          textLevelSelected.value = level;
        }
      });
    } else {
      textLevelSelected.value = "paragraph";
    }

    textAlignment.forEach((align) => {
      if (event.editor.isActive({ textAlign: align.value })) {
        textAlign.value = align.value;
      }
    });
  },
  editorProps: {
    attributes: {
      class:
        "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none",
      style: "min-height: 50px",
    },
  },
});

function handleChooseHead(newValue: any) {
  if (newValue === "paragraph") {
    return editor.value?.chain().focus().setParagraph().run();
  }
  editor.value
    ?.chain()
    .focus()
    .toggleHeading({ level: Number(newValue) as Level })
    .run();
}

function handleChooseAlignment(newValue: string) {
  editor.value?.chain().focus().setTextAlign(newValue).run();
}
function handleUploadImage() {
  if (inputImage.value) {
    inputImage.value?.click();
  }
}
async function handleChangeImage(event: Event) {
  const allowFiles = ["jpg", "jpeg", "png"];
  const file = (event.target as HTMLInputElement).files?.[0];

  if (confirm("Are you sure to upload this image?")) {
    if (file) {
      if (allowFiles.findIndex((type) => file.type.includes(type)) === -1) {
        return alert(`File type ${file.type} not allowed, only ${allowFiles}`);
      }

      const urlImage = props.uploadImageFn
        ? await props.uploadImageFn(file)
        : URL.createObjectURL(file);

      if (urlImage) {
        editor.value?.chain().setImage({ src: urlImage }).run();
      }
    }
  }
}

watch(vModel, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue;

  if (isSame) {
    return;
  }

  editor.value?.commands.setContent(newValue || "", {});
});
</script>

<style lang="postcss" scoped>
.editor {
  &__content {
    @apply border-4 border-gray-800 rounded-b-lg p-2;
  }

  &__header {
    @apply bg-gray-800 rounded-t-lg px-3 py-2 flex gap-1 items-center;

    &.is-hidden {
      visibility: hidden;
      opacity: 0;
    }

    &.is-focused {
      visibility: visible;
      opacity: 1;
      transition: visibility 0.2s, opacity 0.2s;
    }

    &-btn {
      @apply text-white;
      vertical-align: middle;

      font-weight: bold;
      display: inline-flex;
      background: transparent;
      border: 0;

      padding: 6px;

      border-radius: 3px;
      cursor: pointer;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        @apply bg-gray-700;
      }

    }
  }
}
</style>