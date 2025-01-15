<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import editor_icon from "@/assets/icons/svg/export-menu.svg";

defineProps<{
    selected: boolean;
    extend: boolean;
}>()
const emits = defineEmits<{
    (e: 'modify', event: MouseEvent): void;
}>();
</script>
<template>
    <div :class="{'fill-mask-catch-wrapper': true, extend, selected }">
        <slot name="preview"/>
        <div class="modify" @click="event => emits('modify', event)">
            <SvgIcon :icon="editor_icon"/>
        </div>
        <slot name="modal"/>
    </div>
</template>
<style scoped lang="scss">
.fill-mask-catch-wrapper {
    width: 100%;
    height: 32px;
    border-radius: var(--default-radius);
    display: flex;
    align-items: center;
    overflow: hidden;


    .modify {
        flex: 0 0 32px;
        display: flex;
        width: 32px;
        height: 100%;
        visibility: hidden;

        &:hover {
            background-color: rgba(0, 0, 0, 0.06);
        }

        img {
            outline: none;
            margin: auto;
            width: 16px;
            height: 16px;
        }
    }

    &:hover {
        background-color: var(--input-background);

        .modify {
            visibility: visible;
        }
    }
}

.extend {
    background-color: var(--input-background) !important;

    .modify {
        visibility: visible;
        background-color: rgba(0, 0, 0, 0.06) !important;
    }
}

.selected {
    background-color: rgba(24, 120, 245, 0.2) !important;
}
</style>