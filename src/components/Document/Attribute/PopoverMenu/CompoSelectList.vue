<script setup lang="ts">
import { Context } from '@/context';
import { ref, watch } from 'vue';
import StaticAbbrCard from "./StaticAbbrCard.vue";
interface Props {
    context: Context
    samll: string
    contents: any[]
}
interface Emits {
    (e: 'handleCheck', list: any[]): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const checkList = ref([])

watch(checkList, (v) => {
    emits('handleCheck', v)
})
</script>
<template>
    <div class="container" v-for="(item, index) in contents" :key="index">
        <el-checkbox-group v-model="checkList">
            <el-checkbox :label="item.id">
                <div class="component" :style="{ height: samll === 'samll' ? '30px' : '50px' }">
                    <div class="thumbnail">
                        <StaticAbbrCard :data="item"></StaticAbbrCard>
                    </div>
                    <span class="name">{{ item.name }}</span>
                </div>
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
    padding: 2px 0 2px 2px;
    width: 100%;
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
        width: 125px;
        font-size: var(--font-default-fontsize);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.active {
    border: 2px solid var(--active-color);
}
</style>