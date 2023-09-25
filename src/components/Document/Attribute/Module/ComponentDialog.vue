<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
import { ArrowDown } from '@element-plus/icons-vue';
import ComponentList from "@/components/common/ComponentList.vue";
import ComponentPageCard from '../../Navigation/Component/ComponentPageCard.vue';
import ComponentPageList from '../../Navigation/Component/ComponentPageList.vue';
const props = defineProps<{
    top?: string,
    right?: string,
    context: Context;
}>();
const emit = defineEmits<{
    (e: 'closeDialog'): void;
    (e: 'saveLayerShow', data: any, type: 'Text' | 'Show' | 'toggle' | ''): void;
}>()
const activeNames = ref(['1'])
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
        right: props.right,
        top: props.top
    }">
        <ComponentList v-slot="type" :heard="true" @close="popoverClose">
            <el-scrollbar>
                <div class="demo-collapse">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item title="页面1" name="1">
                            <ComponentPageList v-if="type.type === 'list'" :context="context"></ComponentPageList>
                            <ComponentPageCard v-if="type.type === 'card'" :context="context"></ComponentPageCard>
                        </el-collapse-item>
                        <el-collapse-item title="页面2" name="2">
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </el-scrollbar>
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
}</style>