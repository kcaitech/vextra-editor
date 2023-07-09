<script setup lang="ts">
import { onBeforeMount, onBeforeUpdate, ref, nextTick, InputHTMLAttributes, watch, onUnmounted, onMounted } from "vue";
import { Shape, GroupShape, TextShape } from '@kcdesign/data';
import { Context } from "@/context";
import { Navi } from "@/context/navigate";
export interface TItemData {
  id: string
  shape: Shape
  selected: boolean
  context: Context
  keywords: string
}
interface Props {
  data: TItemData
}
interface Slice {
  content: string
  isKeywords: boolean
}
const isLock = ref<boolean>()
const isRead = ref<boolean>()
const isVisible = ref<boolean>()
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const props = defineProps<Props>();
const esc = ref<boolean>(false);
const tips = ref<Slice[]>([]);
const title = ref<string>('');
const emit = defineEmits<{
  (e: "toggleexpand", shape: Shape): void;
  (e: "selectshape", shape: Shape, ctrl: boolean, meta: boolean, shift: boolean): void;
  (e: "hovershape", shape: Shape): void;
  (e: "unhovershape"): void;
  (e: "isLock", isLock: boolean, shape: Shape): void;
  (e: "isRead", isRead: boolean, shape: Shape): void;
  (e: "rename", name: string, shape: Shape, event?: KeyboardEvent): void;
  (e: "scrolltoview", shape: Shape): void;
  (e: "item-mousedown", event: MouseEvent, shape: Shape): void;
}>();
let showTriangle = ref<boolean>(false);
function updater() {
  let shape = props.data.shape;
  showTriangle.value = shape instanceof GroupShape && shape.childs.length > 0;
  isLock.value = props.data.shape.isLocked;
  isRead.value = props.data.shape.isVisible;
}

const toggleContainer = (e: MouseEvent) => {
  e.stopPropagation()
  emit('scrolltoview', props.data.shape);
}

function selectShape(e: MouseEvent) {
  e.stopPropagation();
  const { ctrlKey, metaKey, shiftKey } = e;
  emit("selectshape", props.data.shape, ctrlKey, metaKey, shiftKey);
}

function hoverShape(e: MouseEvent) {
  const working = !props.data.context.workspace.isTranslating;
  if (working) {
    emit("hovershape", props.data.shape);
    isVisible.value = true;
  }
}
function unHoverShape(e: MouseEvent) {
  e.stopPropagation();
  emit("unhovershape");
  isVisible.value = false
}
const onLock = (e: MouseEvent) => {
  e.stopPropagation();
  isLock.value = !isLock.value
  emit('isLock', isLock.value, props.data.shape)
}
const onRead = (e: MouseEvent) => {
  e.stopPropagation();
  isRead.value = !isRead.value
  emit('isRead', isRead.value, props.data.shape)
}
const onRename = () => {
  isInput.value = true
  nextTick(() => {
    if (nameInput.value) {
      (nameInput.value as HTMLInputElement).value = props.data.shape.name.trim();
      nameInput.value.focus();
      nameInput.value.select();
      nameInput.value?.addEventListener('blur', stopInput);
      nameInput.value?.addEventListener('keydown', keySaveInput);
    }
  })
  document.addEventListener('click', onInputBlur)
}
const onChangeName = (e: Event) => {
  const value = (e.target as InputHTMLAttributes).value
  if (esc.value) return
  if (value.length === 0 || value.length > 40 || value.trim().length === 0) return
  emit('rename', value, props.data.shape);
}

const stopInput = () => {
  esc.value = false
  isInput.value = false
}
const keySaveInput = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    esc.value = false
    isInput.value = false
  } else if (e.code === 'Escape') {
    esc.value = true
    isInput.value = false
  }
}
const onInputBlur = (e: MouseEvent) => {
  if (e.target instanceof Element && !e.target.closest('.rename')) {
    var timer = setTimeout(() => {
      if (nameInput.value) {
        (nameInput.value).blur()
      }
      clearTimeout(timer)
      document.removeEventListener('click', onInputBlur);
    }, 10)
  }
}
const selectedChild = () => {
  let parent = props.data.shape.parent
  let child
  while (parent) {
    if (parent.type === 'page') break
    child = props.data.context.selection.isSelectedShape(parent)
    parent = parent.parent
    if (child) {
      return child
    }
  }
  return child
}
const mousedown = (e: MouseEvent) => {
  e.stopPropagation();
  emit('item-mousedown', e, props.data.shape)
  selectedChild();
}
function update_slice() {
  tips.value = [];
  const len = (props.data.shape as TextShape).text.length;
  const src = (props.data.shape as TextShape).text.getText(0, len);
  const word = props.data.keywords;
  const index = src.indexOf(word);
  if (index < 8) {
    tips.value.push({
      isKeywords: false,
      content: src.slice(0, index)
    }, {
      isKeywords: true,
      content: word,
    }, {
      isKeywords: false,
      content: src.slice(index + word.length + 1),
    }
    )
  } else {
    console.log('index', index);
    tips.value.push({
      isKeywords: false,
      content: '...' + src.slice(index - 7, index)
    }, {
      isKeywords: true,
      content: word,
    }, {
      isKeywords: false,
      content: src.slice(index + word.length + 1),
    }
    )
  }
  title.value = src;
}
function navi_watcher(t: number) {
  if (t === Navi.SEARCHING) {
    update_slice();
  }
}
onBeforeMount(() => {
  updater();
})
onBeforeUpdate(() => {
  updater();
})
onMounted(() => {
  update_slice();
  props.data.context.navi.watch(navi_watcher);
})
onUnmounted(() => {
  props.data.context.navi.unwatch(navi_watcher);
})
</script>

<template>
  <div class="contain" :class="{ selected: props.data.selected, selectedChild: selectedChild() }" @click="selectShape"
    @mousemove="hoverShape" @mouseleave="unHoverShape" @mousedown="mousedown">
    <div class="item-warp">
      <div class="container-svg" @dblclick="toggleContainer">
        <svg-icon class="svg" :icon-class="`pattern-${props.data.shape.type}`"></svg-icon>
      </div>
      <div class="text" :class="{ container: true, selected: props.data.selected }"
        :style="{ opacity: isRead ? '' : .3, display: isInput ? 'none' : '' }">
        <div class="txt" @dblclick="onRename">
          {{ props.data.shape.name }}
        </div>
        <div class="tool_icon"
          :style="{ visibility: `${isVisible ? 'visible' : 'hidden'}`, width: `${isVisible ? 66 + 'px' : isLock || !isRead ? 66 + 'px' : 0}` }">
          <div class="tool_lock tool" :class="{ 'visible': isLock }" @click="(e: MouseEvent) => onLock(e)">
            <svg-icon v-if="!isLock" class="svg-open" icon-class="lock-open"></svg-icon>
            <svg-icon v-else class="svg" icon-class="lock-lock"></svg-icon>
          </div>
          <div class="tool_lock tool" @click="toggleContainer">
            <svg-icon class="svg-open" icon-class="locate"></svg-icon>
          </div>
          <div class="tool_eye tool" :class="{ 'visible': !isRead }" @click="(e: MouseEvent) => onRead(e)">
            <svg-icon v-if="isRead" class="svg" icon-class="eye-open"></svg-icon>
            <svg-icon v-else class="svg" icon-class="eye-closed"></svg-icon>
          </div>
        </div>
      </div>
      <input v-if="isInput" @change="onChangeName" @click.stop class="rename" type="text" ref="nameInput">
    </div>
    <div class="tips-wrap" :title="title">
      <span v-for="(item, index) in tips" :key="index" :class="{ active: item.isKeywords }">{{ item.content }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.contain {
  width: 100%;
}

.contain:hover {
  cursor: default;
  background-color: var(--left-navi-button-hover-color);

  >.tips-wrap {
    background-color: transparent;
  }
}

.container {
  display: flex;
  flex-flow: row;
  align-items: center;
  width: 100%;
  height: 30px;
  color: var(--left-navi-font-color);
  background-color: var(--left-navi-bg-color);
}

.selectedChild {
  z-index: 2;
  background-color: var(--left-navi-button-hover-color);
}

.selected {
  z-index: 1;
  background-color: var(--left-navi-button-select-color);
}

.item-warp {
  display: flex;
  flex-flow: row;
  align-items: center;
  width: 100%;
  height: 30px;
  color: var(--left-navi-font-color);
  background-color: var(--left-navi-bg-color);

  >.container-svg {
    display: flex;
    width: 10px;
    justify-content: center;
    align-items: center;
    margin-left: 16px;

    .svg {
      width: 10px;
      height: 10px;
    }
  }

  >.text {
    flex: 1;
    line-height: 30px;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 2px;
    background-color: transparent;

    .txt {
      width: 100%;
      height: 30px;
      line-height: 30px;
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding-left: 2px;
    }

    >.tool_icon {
      display: flex;
      align-items: center;
      width: 66px;
      height: 100%;

      .tool_lock {
        .svg {
          width: 8px;
          height: 10px;
        }

        .svg-open {
          width: 14px;
          height: 14px;
        }
      }

      .tool {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-right: 2px;
      }

      .tool_eye {
        margin-right: 10px;

        .svg {
          width: 14px;
          height: 14px;
        }
      }

      .visible {
        visibility: visible;
      }
    }
  }

  .rename {
    flex: 1;
    height: 20px;
    width: 100%;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 6px;
    margin-right: 6px;
    outline-style: none;
    border: 1px solid var(--left-navi-bg-color);
  }

}

.tips-wrap {
  height: 20px;
  width: calc(100% - 32px);
  font-size: var(--font-default-fontsize);
  padding: 0 16px;
  line-height: 20px;
  white-space: nowrap;
  margin-left: 16px;
  border-radius: 4px;
  background-color: rgba($color: #0d99ff, $alpha: 0.1);
  box-sizing: border-box;
  overflow: hidden;

  .active {
    color: var(--active-color);
  }
}
</style>