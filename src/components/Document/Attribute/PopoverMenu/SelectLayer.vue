<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watchEffect} from 'vue';
import {Context} from '@/context';
import CompoSelectList from './CompoSelectList.vue';
import {useI18n} from 'vue-i18n';
import {VariableType} from '@kcdesign/data';

const {t} = useI18n();

interface Tree {
    id: number
    label: string
    pid: number | undefined
    children?: Tree[]
}

interface Props {
    type: VariableType
    context: Context
    selectList: any[]
    layerId?: string[]
}
interface Emits {
    (e: 'close'): void;
    (e: 'change', data: string[]): void;
}
const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const checkList = ref<string[]>([])
const unfold = new Set();
const close = (e: MouseEvent) => {
    e.stopPropagation();
    emits('close');
}

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation()
    event.target instanceof Element && !event.target.closest('.select_layerbox') && close(event);
}

const top = ref(32);
const reflush = ref(0);
const popover = ref<HTMLDivElement>();

const confirmSelect = () => {
    if (checkList.value.length === 0) return;
    emits('close');
}

function toggle(i: number) {
    if (unfold.has(i)) {
        unfold.delete(i);
    } else {
        unfold.add(i);
    }
    reflush.value = reflush.value++;
}

const handleCheck = (v: string[]) => {
    // 选中对象的id
    checkList.value = v;
    emits("change", v);
}
watchEffect(() => {
    props.selectList.length;
    if (props.selectList.length === 1) {
        unfold.add(0);
    }
})

const keyboard_watcher = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if(checkList.value.length > 0) {
            emits('close');
        }
    }
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
    document.addEventListener('mouseup', handleClickOutside);
})
onUnmounted(() => {
    document.removeEventListener('mouseup', handleClickOutside);
})
</script>

<template>
    <div class="select_layerbox" ref="popover" :style="{ top: top + 'px' }" @keydown="keyboard_watcher">
        <div class="heard">
            <span class="title">{{
                    props.type === VariableType.SymbolRef ? `${t('compos.compos_instance')}` :
                        `${t('compos.select_layer')}`
                }}</span>
            <div class="close">
                <div class="toggle_list">
                    <svg-icon icon-class="close" @click.stop="emits('close');"></svg-icon>
                </div>
            </div>
        </div>
        <div class="container" v-if="selectList.length">
            <!-- 组件实例 -->
            <div style="height: 100%;">
                <el-scrollbar>
                    <!-- 可变组件折叠 -->
                    <template v-for="(item, i) in selectList" :key="i">
                        <div class="collapse-title" @click="toggle(i)" v-if="selectList.length > 1" :reflush="reflush">
                            <span>{{ item.state }}</span>
                            <div class="shrink">
                                <svg-icon icon-class="down"
                                          :style="{ transform: !unfold.has(i) ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
                            </div>
                        </div>
                        <div class="demo-collapse" v-show="unfold.has(i)" :reflush="reflush">
                            <component :is="CompoSelectList" :context="context" :contents="item.data" samll="samll"
                                       @handleCheck="handleCheck" :layerId="props.layerId">
                            </component>
                        </div>
                    </template>
                </el-scrollbar>
                <div class="button" :style="{ opacity: checkList.length > 0 ? 1 : 0.5 }">
                    <el-button @click.stop="confirmSelect">确认
                    </el-button>
                </div>
            </div>
        </div>
        <div class="null"
             v-if="selectList.length === 0 && props.type === VariableType.Text || props.type === VariableType.Status">
            {{ t('compos.text_layer_null') }}
        </div>
        <div class="null" v-if="selectList.length === 0 && props.type === VariableType.SymbolRef">{{
                t('compos.instance_null')
            }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select_layerbox {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    bottom: 0;
    width: 320px;
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
}

.collapse-title {
    width: 100%;
    height: 28px;
    transition: 0.1s;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 4px;
    box-sizing: border-box;
    position: sticky;
    top: 0;
    background-color: var(--theme-color-anti);
    z-index: 9;

    //&:hover {
    //    background-color: var(--grey-light);
    //}

    > span {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .shrink {
        position: absolute;
        right: 5px;
        height: 12px;
        width: 12px;

        > svg {
            width: 80%;
            height: 80%;
        }
    }
}
</style>