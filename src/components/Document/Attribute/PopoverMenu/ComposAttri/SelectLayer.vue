<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { Context } from '@/context';
import CompoSelectList from './CompoSelectList.vue';
import { useI18n } from 'vue-i18n';
import { VariableType } from '@kcdesign/data';
const { t } = useI18n();

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
const top_wrapper = ref<HTMLDivElement>();
const scroll_container = ref<Element | null>(null);
const unfold = new Set();
const close = (e: MouseEvent) => {
    e.stopPropagation();
    emits('close');
}

function register_container() {
    if (!top_wrapper.value) return;
    scroll_container.value = top_wrapper.value.querySelector('.el-scrollbar > .el-scrollbar__wrap');
}

function handleClickOutside(event: MouseEvent) {
    event.stopPropagation();
    event.target instanceof Element && !event.target.closest('.select_layerbox') && !event.target.closest('.input_lay') && close(event);
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
        emits('close');
    }
}

onMounted(() => {
    if (popover.value) {
        popover.value.focus();
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
                top.value = -s + 40
            }
        }
    }
    document.addEventListener('mouseup', handleClickOutside);
    register_container();
})
onUnmounted(() => {
    document.removeEventListener('mouseup', handleClickOutside);
})
</script>

<template>
    <div class="select_layerbox" ref="popover" tabindex="-1" @keydown.stop="keyboard_watcher" :style="{ top: top + 'px' }">
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
            <div style="height: 100%;" ref="top_wrapper">
                <el-scrollbar>
                    <!-- 可变组件折叠 -->
                    <template v-for="(item, i) in selectList" :key="i">
                        <div class="collapse-title" @click="toggle(i)" v-if="selectList.length > 1" :reflush="reflush">
                            <div class="shrink">
                                <svg-icon icon-class="triangle-icon"
                                    :style="{ transform: `rotate(${!unfold.has(i) ? '-90deg' : '0deg'})` }"></svg-icon>
                            </div>
                            <span>{{ item.state }}</span>
                            <!-- <div class="shrink">
                                <svg-icon icon-class="down"
                                    :style="{ transform: !unfold.has(i) ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
                            </div> -->
                        </div>
                        <div class="demo-collapse"
                            :style="{ marginLeft: selectList.length > 1 ? '26px' : '12px', marginTop: selectList.length > 1 ? '0' : '4px' }"
                            v-if="unfold.has(i)" :reflush="reflush">
                            <component v-if="scroll_container" :is="CompoSelectList" :context="context"
                                :contents="item.data" @handleCheck="handleCheck" :layerId="props.layerId"
                                :container="scroll_container">
                            </component>
                        </div>
                    </template>
                </el-scrollbar>
                <div class="button">
                    <button type="button" @click.stop="confirmSelect" :disabled="checkList.length ? false : true">{{
                        t('compos.confirm') }}</button>
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
    width: 236px;
    height: 450px;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #F0F0F0;
    box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.08);
    z-index: 99;
    outline: none;

    .heard {
        width: 100%;
        height: 40px;
        border-bottom: 1px solid #F5F5F5;
        display: flex;
        font-size: var(--font-default-fontsize);
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;
        padding-right: 5px;

        .title {
            color: #3D3D3D;
            line-height: 40px;
            font-weight: var(--font-default-bold);
            margin-left: 10px;
        }

        .toggle_list {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;

            &:hover {
                background-color: #F5F5F5;
            }

            &:active {
                background-color: #EBEBEB;
            }

            svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .container {
        // padding-left: 10px;
        flex: 1;
        height: calc(100% - 40px);

        .el-scrollbar {
            height: calc(100% - 40px);

            .el-collapse {
                --el-collapse-border-color: none;
            }
        }

        .button {
            display: flex;
            align-items: center;
            justify-content: center;

            button {
                outline: none;
                border: none;
                width: 140px;
                height: 32px;
                border-radius: 6px;
                margin: auto;
                background-color: #1878F5;
                color: white;

                &:hover {
                    background-color: #429AFF;
                }

                &:active {
                    background-color: #0A59CF;
                }

                &:disabled {
                    background-color: #BDE2FF;
                }
            }
        }

        :deep(.el-collapse-item__header) {
            height: 35px;
            font-size: 12px;
            border-bottom-color: transparent;
            border-radius: 4px;

            &:hover {
                background-color: var(--grey-light);
            }

            padding-left: 4px;
        }
    }

    .null {
        font-size: 12px;
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
    height: 32px;
    transition: 0.1s;
    // border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    box-sizing: border-box;
    position: sticky;
    top: 0;
    background-color: var(--theme-color-anti);
    gap: 4px;
    z-index: 9;

    //&:hover {
    //    background-color: var(--grey-light);
    //}

    >span {
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .shrink {
        height: 14px;
        width: 14px;

        >svg {
            width: 14px;
            height: 14px;
            transition: all 0.3s;
        }
    }
}

.demo-collapse {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

:deep(.el-scrollbar__bar.is-vertical) {
    z-index: 9;
}
</style>