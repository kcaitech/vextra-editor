<template>
    <div ref="panelEl" id="blur-container" class="shadow-container">
        <div class="header">
            <div class="title">模糊样式</div>
            <div class="tool">
                <div class="add" @click="createPanel($event)">
                    <SvgIcon :icon="add_icon"/>
                </div>
                <div class="close" @click="emits('close')">
                    <SvgIcon :icon="close_icon"/>
                </div>
            </div>
        </div>
        <div class="search">
            <div class="icon">
                <SvgIcon :icon="search_icon"/>
            </div>
            <div class="filter" @click="preFilter">
                <SvgIcon :icon="arrow_icon"/>
            </div>
            <input v-focus ref="search" type="text" placeholder="搜索样式" v-model="keyword"
                @keydown.esc="props.context.escstack.execute()">
            <div v-if="filterPanel" class="filter-list">
                <div class="list-item" v-for="item in listFilter" :key="item[0]" @click.stop="filter(item[1])">
                    <div class="choose" :style="{ visibility: filterWord === item[1] ? 'visible' : 'hidden' }">
                        <SvgIcon :icon="choose_icon"/>
                    </div>
                    <span> {{ item[1] }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="sheet in data" :key="sheet.id">
                    <div class="type" @click="currentType(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <SvgIcon
                            :icon="types.has(sheet.name === '新文件' ? '此文件样式' : sheet.name) ? down_icon : right_icon"/>
                        <span>{{ sheet.name === '新文件' ? '此文件样式' : sheet.name }}</span>
                    </div>
                    <template v-if="types.has(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <div v-for="mask in (sheet.variables as BlurMask[])" class="styles"
                             :class="{ 'active': editorPanel && maskID === mask.id, 'target': mask.id === props.id }"
                             :key="mask.id">
                            <div class="left" @click="addShadowMask(mask.id)">
                                <div class="effect">
                                    <div class="item" v-for="(_, index) in 25" :key="index"></div>
                                </div>
                                <div class="name">{{ mask.name }}</div>
                            </div>
                            <div class="editor" style="visibility: hidden;" @click="editPanel($event, mask.id)">
                                <SvgIcon :icon="editor_icon"/>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!data.length && keyword" class="null">没有搜索到相关样式</div>
                <div v-if="!data.length && !keyword" class="null">没有可用的样式</div>
            </div>
        </el-scrollbar>
        <NewBlurStyle v-if="addPanel" :context="props.context" :shapes="props.shapes" :top="top" :left="left"
                      @close="closeCreatePanel"/>
        <EditorBlurStyle v-if="editorPanel" :top="top" :left="left" :shapes="props.shapes" :context="props.context"
                         :maskid="maskID" :reder="fillRenderer" @close="closePanel"/>
    </div>
</template>
<script setup lang="ts">
import { BlurMask, ShapeView } from "@kcdesign/data";
import { v4 } from 'uuid';
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import EditorBlurStyle from './EditorBlurStyle.vue';
import NewBlurStyle from './NewBlurStyle.vue';
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { FillRenderer, Mask } from "../../StyleLib/fillRenderer";
import { getShapesForStyle } from "@/utils/style";
import { get_actions_add_mask } from "@/utils/shape_style";
import add_icon from '@/assets/icons/svg/add.svg';
import editor_icon from '@/assets/icons/svg/export-menu.svg';
import down_icon from '@/assets/icons/svg/triangle-down.svg';
import right_icon from '@/assets/icons/svg/triangle-right.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import arrow_icon from '@/assets/icons/svg/arrow-right.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import choose_icon from '@/assets/icons/svg/choose.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { ElementLocateModifier } from "@/components/common/elementlocate";

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    id?: string;
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()

const { t } = useI18n();

const filterPanel = ref<boolean>(false)
const keyword = ref<string>('')
const filterWord = ref<string>('全部样式')
const types = ref(new Set<string>())
const editorPanel = ref<boolean>(false)
const addPanel = ref<boolean>(false)
const top = ref<number>(0)
const left = ref<number>(0)
const maskID = ref<string>('')
const search = ref<HTMLInputElement>()
const listFilter = new Map()
const sheets = reactive<StyleSheet[]>([])
const data = reactive<StyleSheet[]>([])
const list = reactive<Mask[]>([]);
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], list as Mask[]);

const panelEl = ref<HTMLDivElement>();

const currentType = (t: string) => {
    types.value.has(t) ? types.value.delete(t) : types.value.add(t)
}

watchEffect(() => {
    listFilter.set('all', '全部样式')
    sheets.forEach(s => {
        if (s.id === props.context.data.id) {
            listFilter.set(s.name, '此文件样式')
        } else {
            listFilter.set(s.name, s.name)
        }
    })
    listFilter.forEach((v) => types.value.add(v))
})

watchEffect(() => {
    data.length = 0;
    const arr = sheets.filter(s => s.name.includes(filterWord.value === '全部样式' ? "" : filterWord.value === '此文件样式' ? "新文件" : filterWord.value))
    const new_arr = arr.map(s => {
        let newSheet: StyleSheet = { ...s }
        newSheet.variables = s.variables.filter(v => (v as BlurMask).name.includes(keyword.value))
        return newSheet
    })
    data.push(...new_arr.filter(s => s.variables.length !== 0))
})

const addShadowMask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_add_mask(shapes, id);
    const editor = props.context.editor4Page(page);
    editor.shapesSetBlurMask(actions);
    emits('close')
}

const closePanel = () => {
    props.context.escstack.execute()
    editorPanel.value = false
}

const editPanel = (e: MouseEvent, _maskID: string) => {
    let el = e.target as HTMLElement;
    while (el.parentElement?.className !== 'shadow-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const rect = el.getBoundingClientRect(); // 获取编辑面板的left值
    top.value = rect.top;
    left.value = rect.left - 250;
    maskID.value === _maskID ? editorPanel.value = !editorPanel.value : editorPanel.value = true;
    maskID.value = _maskID;

    document.addEventListener('click', checkEditorPanel)
    props.context.escstack.save(v4(), closeEditorPanel)
}

const closeEditPanel = () => {
    editorPanel.value = false;
    document.removeEventListener('click', checkEditorPanel);
}

function checkEditorPanel(e: MouseEvent) {
    e.target instanceof Element &&
        !e.target.closest('.editor-style') &&
        !e.target.closest('.editor') &&
        closeEditPanel();
}

const closeEditorPanel = () => {
    const exe_result: boolean = editorPanel.value;
    editorPanel.value = false
    document.removeEventListener('click', checkEditorPanel)
    return exe_result
}

const createPanel = (e: MouseEvent) => {
    let el = e.target as HTMLElement;
    while (el.className !== 'shadow-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const rect = el.getBoundingClientRect();
    top.value = rect.top;
    left.value = rect.left - 250;
    addPanel.value = !addPanel.value;
    document.addEventListener('click', checkPanel)
    props.context.escstack.save(v4(), closeCreatePanel)
}

function checkPanel(e: MouseEvent) {
    e.target instanceof Element &&
        !e.target.closest('.new-style') &&
    !e.target.closest('.add') &&
    closeCreatePanel();
}

const closeCreatePanel = () => {
    const exe_result: boolean = addPanel.value;
    addPanel.value = false
    document.removeEventListener('click', checkPanel)
    return exe_result
}

const closeFilterPanel = () => {
    filterPanel.value = false
    document.removeEventListener('click', checkFilterPanel)
}

const preFilter = () => {
    if (filterPanel.value) return;
    filterPanel.value = !filterPanel.value
    document.addEventListener('click', checkFilterPanel)
}

const checkFilterPanel = (e: MouseEvent) => {
    e.target instanceof Element &&
        !e.target.closest('.filter-list') &&
        !e.target.closest('.filter') &&
        closeFilterPanel();
}

const filter = (v: string) => {
    filterWord.value = v;
    filterPanel.value = false
    types.value.add(v)
    document.removeEventListener('click', checkFilterPanel)
}

function update() {
    const lib = props.context.data.stylelib
    if (!lib) return
    fillRenderer.updateUnderRootContainerMap('blur')
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') update();
}


onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher);
})

onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher)
})
</script>
<style lang="scss" scoped>
.shadow-container {
    background-color: #fff;
    z-index: 9;
    width: 250px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    border-radius: 8px;
    margin-bottom: 8px;
    box-sizing: border-box;
}

.header {
    display: flex;
    height: 40px;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 12px;
    border-bottom: 1px solid #F5F5F5;

    .tool {
        display: flex;
        align-items: center;
        gap: 4px;

        > .add {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            box-sizing: border-box;

            &:hover {
                background-color: #f5f5f5;
            }

            >img {
                outline: none;
                width: 16px;
                height: 16px;
            }
        }

        >.close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            box-sizing: border-box;

            &:hover {
                background-color: #f5f5f5;
            }

            >img {
                outline: none;
                width: 16px;
                height: 16px;
                padding: 2px;
                margin-top: 1px;
                box-sizing: border-box;
            }
        }
    }
}

.search {
    position: relative;
    display: flex;
    align-items: center;
    height: 32px;
    background-color: #F5F5F5;
    border-radius: 6px;
    border: 1px solid transparent;
    gap: 4px;
    padding: 0 8px;
    margin: 8px 12px;
    box-sizing: border-box;

    .icon,
    .filter {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 32px;

        img {
            height: 100%;
            width: 14px;
            transition: all 0.2s ease-in;
        }
    }

    .filter img{
        rotate: -90deg;
        padding: 1px;
        box-sizing: border-box;
    }

    .filter:hover {
        cursor: pointer;

        svg {
            transform: translateY(2px);
        }
    }

    input {
        flex: 1;
        height: 100%;
        width: 100%;
        outline: none;
        border: none;
        padding: 0;
        background-color: transparent;
        box-sizing: border-box;
    }

    &:has(input:focus) {
        border: 1px solid #1878F5;
    }

    .filter-list {
        position: absolute;
        top: 36px;
        width: 50%;
        left: 0;
        background-color: #fff;
        border: 1px solid #e5e5e5e5;
        border-radius: 4px;
        padding: 4px 0;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        z-index: 9;

        .list-item {
            display: flex;
            align-items: center;
            height: 32px;
            box-sizing: border-box;

            .choose {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                img {
                    width: 12px;
                    height: 12px;
                }
            }

            &:hover {
                background-color: #F5F5F5;
            }
        }
    }
}

.content {
    display: flex;
    flex-direction: column;
    margin: 0 12px;
    max-height: 380px;
    min-height: 350px;

    .style-item .type {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 6px;
        border-radius: 6px;
        box-sizing: border-box;

        &:hover {
            background-color: #f5f5f5;
        }
    }

    .style-item .type svg {
        width: 14px;
        height: 14px;
    }

    .style-item .type span {
        font-weight: var(--font-weight-medium);
    }

    .style-item .styles {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        height: 32px;
        border-radius: 6px;
        box-sizing: border-box;
        overflow: hidden;

        &:hover {
            background-color: #f5f5f5;

            .editor {
                visibility: visible !important;
            }
        }
    }

    .style-item .styles .left {
        flex: 1;
        display: flex;
        align-items: center;
        height: 100%;
        padding-left: 8px;
        gap: 8px;

        .effect {
            width: 16px;
            height: 16px;
            background-color: #fff;
            border: 1px solid #000000e5;
            border-radius: 3px;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
            grid-gap: 1px;

            .item {
                background-color: #1878F5;
            }

            .main {
                width: 16px;
                height: 16px;
                background-color: #000;
                position: relative;

                .mask {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 50%;
                    height: 100%;
                    background: url("data:image/svg+xml;utf8,%3Csvg%20width%3D%226%22%20height%3D%226%22%20viewBox%3D%220%200%206%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%200H3V3H0V0Z%22%20fill%3D%22%23E1E1E1%22/%3E%3Cpath%20d%3D%22M3%200H6V3H3V0Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M3%203H6V6H3V3Z%22%20fill%3D%22%23E1E1E1%22/%3E%3Cpath%20d%3D%22M0%203H3V6H0V3Z%22%20fill%3D%22white%22/%3E%3C/svg%3E%0A");
                }
            }
        }
    }

    .style-item .styles .editor {
        display: flex;
        width: 32px;
        height: 100%;

        &:hover {
            background-color: #e5e5e5;
        }

        img {
            outline: none;
            margin: auto;
            width: 16px;
            height: 16px;
        }
    }

    .null {
        margin: auto;
    }
}

.active {
    background-color: #f5f5f5;
}

.target {
    background-color: rgba(24, 120, 245, 0.2) !important;

    .editor:hover {
        background-color: rgba(24, 120, 245, 0.3) !important;
    }
}
</style>
