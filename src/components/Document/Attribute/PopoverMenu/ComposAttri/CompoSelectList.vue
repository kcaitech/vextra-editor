<script setup lang="ts">
import {Context} from '@/context';
import {ref, watch} from 'vue';
import CardWrap from "./CardWrap.vue";
import {Shape, ShapeView} from "@kcdesign/data";

interface Props {
    context: Context
    contents: any[]
    container: Element | null
    layerId?: string[]
}

interface Emits {
    (e: 'handleCheck', list: any[]): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const checkList = ref(props.layerId || []);
const detail = ref<boolean>(false);

function hover_item(shape: ShapeView) {
    props.context.selection.hoverShape(shape);
}

function unhover() {
    props.context.selection.unHoverShape();
}

watch(checkList, (v) => {
    emits('handleCheck', v)
}, {immediate: true})
</script>
<template>
    <div class="container" v-for="(item, index) in contents" :key="index">
        <el-checkbox-group v-model="checkList" @mouseleave="unhover">
            <el-checkbox :label="item.id" @mouseenter.stop="() => hover_item(item)">
                <CardWrap :data="item" :container="props.container"></CardWrap>
            </el-checkbox>
        </el-checkbox-group>
    </div>
</template>

<style lang="scss" scoped>
.container {
    padding-right: 5px;
    box-sizing: border-box;

    .el-checkbox {
        width: 100%;
        display: flex;
        margin: 5px 0;

        :deep(.el-checkbox__label) {
            height: 100%;
            flex: 1;
        }

        :deep(.el-checkbox__input) {
            height: 100%;
            display: flex;
            align-items: center;
            margin-left: 3px;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
            border-color: var(--active-color);
            background-color: var(--active-color);
        }

        :deep(.el-checkbox__input.is-checked+.el-checkbox__label) {
            color: var(--active-color);
        }
    }
}

.component {
    display: flex;
    align-items: center;
    padding: 2px 3px 2px 2px;
    width: 100%;
    height: 30px;
    border-radius: 4px;

    &:hover {
        background-color: #e5dbff;

        .thumbnail {
            opacity: .5;
        }
    }

    .svg {
        width: 10px;
        height: 10px;
        margin-right: 5px;
    }

    .thumbnail {
        border-radius: 4px;
        height: 100%;
        width: 30px;
        margin-right: 8px;
        box-sizing: border-box;
        border: 2px solid var(--grey-light);
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==");
        background-size: auto 25%;
    }

    .name {
        max-width: calc(100% - 42px);
        overflow: hidden;
    }
}

.active {
    border: 2px solid var(--active-color);
}
</style>