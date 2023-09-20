<script lang="ts" setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { CaretBottom } from '@element-plus/icons-vue'
import { Context } from '@/context';
import ComponentPageCard from '../../Navigation/Component/ComponentPageCard.vue';
import ComponentPageList from '../../Navigation/Component/ComponentPageList.vue';
interface Tree {
    id: number
    label: string
    pid: number | undefined
    children?: Tree[]
}
const props = defineProps<{
    type: 'Text' | 'Show' | 'toggle' | ''
    context: Context
}>()

const emit = defineEmits<{
    (e: 'close'): void;
}>()
const activeNames = ref(['1'])
const isList = ref('list');
const close = (e: MouseEvent) => {
    e.stopPropagation();
    emit('close');
}
function handleClickOutside(event: MouseEvent) {
    event.target instanceof Element && !event.target.closest('.select_layerbox') && close(event);
}
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
})
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
})
</script>

<template>
    <div class="select_layerbox">
        <div class="heard">
            <span class="title">{{ props.type === 'toggle' ? '组件实例' : '选择图层' }}</span>
            <div class="close">
                <div class="toggle_list">
                    <svg-icon v-if="isList === 'card'" icon-class="resource" @click.stop="isList = 'list'"></svg-icon>
                    <svg-icon v-if="isList === 'list'" icon-class="text-bulleted-list"
                        @click.stop="isList = 'card'"></svg-icon>
                </div>
            </div>
        </div>
        <div class="container">
            <!-- 组件实例 -->
            <div style="height: 100%;" v-if="props.type === 'toggle'">
                <el-scrollbar>
                    <div class="demo-collapse">
                        <el-collapse v-model="activeNames">
                            <ComponentPageList v-if="isList === 'list'" :context="context" samll="samll"></ComponentPageList>
                            <ComponentPageCard v-if="isList === 'card'" :context="context"></ComponentPageCard>
                        </el-collapse>
                    </div>
                </el-scrollbar>
            </div>
            <!-- 是否显示 -->
            <div style="height: 100%;" v-else>
            </div>
            <!-- <div class="null" v-if="dataSource.length === 0 && props.type === 'Text' || props.type === ''">文本图层为空</div>
            <div class="null" v-if="dataSource.length === 0 && props.type === 'toggle'">组件实例为空</div> -->
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select_layerbox {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    top: 33px;
    width: 230px;
    height: 450px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 99;

    .heard {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        font-size: var(--font-default-fontsize);
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;
        padding-right: 5px;

        margin-bottom: 10px;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
            margin-left: 10px;
        }

        .toggle_list {
            width: 28px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .container {
        padding-left: 10px;
        flex: 1;
        height: calc(100% - 42px);

        .null {
            font-size: 10px;
            color: rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .el-scrollbar {
            padding-right: 10px;

            .el-collapse {
                --el-collapse-border-color: none;
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
}
</style>