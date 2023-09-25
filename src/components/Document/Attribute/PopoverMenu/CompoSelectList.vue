<script setup lang="ts">
import { Context } from '@/context';
import { ShapeType } from '@kcdesign/data';
import { ref, watch } from 'vue';

const props = defineProps<{
    context: Context
    samll?: string
    contents: any[]
}>();
const emit = defineEmits<{
    (e: 'handleCheck', list: any[]): void;
}>();
const checkList = ref([])
const thumbnail_bgc = ref<any>('rgba(1, 239, 239, 239)');
function getThumbnailBgc() {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const f = page.style.fills[0];
    if (!f) {
        thumbnail_bgc.value = 'rgba(1, 239, 239, 239)'
    } else {
        const r = f.color.red;
        const g = f.color.green;
        const b = f.color.blue;
        const a = f.color.alpha;
        thumbnail_bgc.value = `rgba(${r}, ${g}, ${b}, ${a})`
    }
}
watch(checkList, (v) => {
    emit('handleCheck', v)
})
getThumbnailBgc()
function icon_class(type: ShapeType) {
    if (type === ShapeType.Symbol) {
        return 'pattern-component';
    } else {
        return `pattern-${type}`;
    }
}
</script>
<template>
    <div class="container" v-for="(item, index) in contents" :key="index">
        <el-checkbox-group v-model="checkList">
            <el-checkbox :label="item.id">
                <div class="component" :style="{ height: samll === 'samll' ? '30px' : '50px' }">
                    <div class="thumbnail"
                        :style="{ 'background-color': thumbnail_bgc ? thumbnail_bgc : 'rgba(1, 239, 239, 239)', width: samll === 'samll' ? '30px' : '50px' }">
                    </div>
                    <svg-icon class="svg" :icon-class="icon_class(item.type)"></svg-icon>
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
        margin-right: 10px;
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