<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
import { ArrowDown } from '@element-plus/icons-vue';
import ComponentList from "../../Navigation/Component/ComponentList.vue";
import ComponentCollapse from '../../Navigation/Component/ComponentCollapse.vue';
const props = defineProps<{
    top?: string,
    right?: string,
    context: Context;
}>();

const emit = defineEmits<{
    (e: 'closeDialog'): void;
    (e: 'saveLayerShow', data: any, type: 'Text' | 'Show' | 'toggle' | ''): void;
}>()
const list = [{
    name: ['页面1'],
    contents: [
        { name: '矩形1' },
        { name: '矩形2' },
        { name: '矩形3' },
        { name: '矩形4' }
    ],
    children: []
}, {
    name: ['页面2'],
    contents: [],
    children: [
        {
            name: ['容器'],
            contents: [
                { name: '矩形1' },
                { name: '矩形2' },
                { name: '矩形3' },
                { name: '矩形4' }
            ],
            children: []
        },
    ]
}]
function popoverClose() {
    emit('closeDialog');
}

function esc(e: KeyboardEvent) {
    if (e.code === 'Escape') popoverClose();
    else e.stopPropagation();
}
const comps = ref<HTMLDivElement>()
const cur_top = ref(0)
onMounted(() => {
    if (comps.value) {
        const body_h = document.body.clientHeight;
        const comps_y = comps.value.getBoundingClientRect().y;
        const comps_h = comps.value.clientHeight + 10;
        const surplus = body_h - comps_y;
        cur_top.value = surplus - comps_h;
    }
    document.addEventListener('keyup', esc);
})
onUnmounted(() => {
    document.removeEventListener('keyup', esc);
})
</script>

<template>
    <div class="dialog_box" ref="comps" :style="{
        right: props.right,
        top: cur_top > 0 ? props.top : cur_top + 'px'
    }">
        <ComponentList :heard="true" @close="popoverClose" :context="context">
            <!-- <el-scrollbar>
                <div class="demo-collapse">
                    <div class="demo-collapse" v-for="(item, index) in list" :key="index">
                        <ComponentCollapse :context="context" :type="type.type" :item="item" :index="index">
                        </ComponentCollapse>
                    </div>
                </div>
            </el-scrollbar> -->
        </ComponentList>
    </div>
    <div class="overlay" @click.stop="popoverClose" @mousedown.stop @wheel.stop></div>
</template>

<style scoped lang="scss">
.dialog_box {
    display: flex;
    flex-direction: column;
    position: absolute;
    outline: none;
    width: 250px;
    height: 450px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #ffffff;
    border-radius: 4px;
    box-sizing: border-box;
    z-index: 10004;

    .el-scrollbar {
        padding-right: 10px;

        .demo-collapse {
            box-sizing: border-box;
        }

        .el-collapse {
            --el-collapse-border-color: none;

            :deep(.el-collapse-item__content) {
                padding-bottom: 10px;
            }
        }

    }

    :deep(.el-collapse-item__header) {
        height: 35px;
        font-size: 10px;
        border-bottom-color: transparent;
        border-radius: 4px;

        &:hover {
            background-color: var(--grey-light);
        }

        padding-left: 4px;
    }
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