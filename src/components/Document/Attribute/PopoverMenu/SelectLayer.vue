<script lang="ts" setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { CaretBottom } from '@element-plus/icons-vue'
import { Context } from '@/context';
import ComponentPageList from '../../Navigation/Component/ComponentPageList.vue';
import CompoSelectList from './CompoSelectList.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Tree {
    id: number
    label: string
    pid: number | undefined
    children?: Tree[]
}
const props = defineProps<{
    type: 'Text' | 'Show' | 'toggle' | ''
    context: Context
    selectList: any[]
}>()

const checkList = ref<string[]>([])
const emit = defineEmits<{
    (e: 'close'): void;
}>()
const close = (e: MouseEvent) => {
    e.stopPropagation();
    emit('close');
}
function handleClickOutside(event: MouseEvent) {
    event.target instanceof Element && !event.target.closest('.select_layerbox') && close(event);
}
const top = ref(33);
const popover = ref<HTMLDivElement>();

const confirmSelect = () => {
    if (checkList.value.length === 0) return;
    emit('close');
}
const handleCheck = (v: string[]) => {
    // 选中对象的id
    checkList.value = v
}
onMounted(() => {
    if (popover.value) {
        const body_h = document.body.clientHeight;
        const popover_y = popover.value.getBoundingClientRect().y;
        const popover_h = popover.value.clientHeight + 5;
        const surplus = body_h - popover_y;
        const height = surplus - popover_h;
        if (height > 0) {
            top.value = 33;
        } else {
            if (popover_y > popover_h) {
                top.value = -popover_h
            } else {
                const s = popover_h - popover_y;
                top.value = -(popover_y - s) - 20
            }
        }
    }
    document.addEventListener('click', handleClickOutside);
})
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
})
</script>

<template>
    <div class="select_layerbox" ref="popover" :style="{ top: top + 'px' }">
        <div class="heard">
            <span class="title">{{ props.type === 'toggle' ? `${t('compos.compos_instance')}` :
                `${t('compos.select_layer')}` }}</span>
            <div class="close">
                <div class="toggle_list">
                    <svg-icon icon-class="close" @click.stop="emit('close');"></svg-icon>
                </div>
            </div>
        </div>
        <div class="container" v-if="selectList.length">
            <!-- 组件实例 -->
            <div style="height: 100%;" v-if="props.type === 'toggle'">
                <el-scrollbar>
                    <div class="demo-collapse">
                        <CompoSelectList :context="context" :contents="selectList" samll="samll" @handleCheck="handleCheck">
                        </CompoSelectList>
                    </div>
                </el-scrollbar>
                <div class="button"><el-button>确认</el-button></div>
            </div>
            <div style="height: 100%;" v-else>
                <el-scrollbar>
                    <div class="demo-collapse">
                        <CompoSelectList :context="context" :contents="selectList" samll="samll" @handleCheck="handleCheck">
                        </CompoSelectList>
                    </div>
                </el-scrollbar>
                <div class="button" :style="{ opacity: checkList.length > 0 ? 1 : 0.5 }"><el-button
                        @click.stop="confirmSelect">确认</el-button></div>
            </div>
        </div>
        <div class="null" v-if="selectList.length === 0 && props.type === 'Text' || props.type === ''">
            {{ t('compos.text_layer_null') }}</div>
        <div class="null" v-if="selectList.length === 0 && props.type === 'toggle'">{{ t('compos.instance_null') }}</div>
    </div>
</template>

<style lang="scss" scoped>
.select_layerbox {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    bottom: 0;
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

        .el-scrollbar {
            padding-right: 10px;
            height: calc(100% - 40px);

            .el-collapse {
                --el-collapse-border-color: none;
            }
        }

        .button {
            height: 40px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            .el-button {
                height: 30px;
                box-sizing: border-box;
                background-color: var(--active-color);
                border-color: var(--active-color);
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

    .null {
        font-size: 10px;
        color: rgba(0, 0, 0, 0.5);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
    }
}</style>