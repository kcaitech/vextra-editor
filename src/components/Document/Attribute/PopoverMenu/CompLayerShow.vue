<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
const props = defineProps<{
    title?: string,
    top?: string,
    right?: string,
    width?: number,
    height?: string | number,
    context: Context;
}>();
const emit = defineEmits<{
    (e:'closeDialog'): void;
}>()

function popoverClose() {
    emit('closeDialog');
}
function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') popoverClose();
    else e.stopPropagation();
}

onMounted(() => {
    document.addEventListener('keyup', esc);
})
onUnmounted(() => {
    document.removeEventListener('keyup', esc);
})
</script>

<template>
    <div class="dialog_box" :style="{
        width: `${props.width ? props.width : 360}px`,
        right: props.right,
        top: props.top
    }">
        <div class="header">
            <span class="title">{{ props.title }}</span>
            <div @click="popoverClose" class="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="body">
            <div>
                <span></span>
                <div></div>
            </div>
            <div>
                <span></span>
                <div></div>
            </div>
            <div>
                <span></span>
                <div></div>
            </div>
        </div>
        <div class="footer">
            <el-button style="background-color: #9775fa;">确认</el-button>
        </div>
    </div>
    <div class="overlay" @click.stop @mousedown.stop @wheel.stop></div>
</template>

<style scoped lang="scss">
.dialog_box {
    position: absolute;
    outline: none;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #ffffff;
    border-radius: 4px;
    z-index: 10004;

    .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        font-size: var(--font-default-fontsize);
        padding: 0 var(--default-padding);
        box-sizing: border-box;
        align-items: center;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: var(--default-padding);
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 65%;
                height: 65%;
            }
        }
    }
    .body {
      width: 100%;
      height: calc(100% - 32px);
      font-size: 10px;
      >div {
        height: 30px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .footer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0;
    }
}
:deep(.el-button:focus, .el-button:hover) {
    background-color: #9775fa;
    border-color: #9775fa;
    color: #fff;
    outline: none;
}
:deep(.el-button) {
    color: #fff;
}
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10003;
    background-color: transparent;
}
</style>