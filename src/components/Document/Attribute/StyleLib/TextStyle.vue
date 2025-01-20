<template>
    <div id="text-lib-panel" class="text-lib-panel">
        <PopoverHeader :title="t('stylelib.format')" @create="showCreatePanel" @close="emits('close')" />
        <div class="search">
            <div class="icon">
                <SvgIcon :icon="search_icon" />
            </div>
            <div class="filter" @click="showLibList($event)">
                <SvgIcon :icon="arrow_icon" />
            </div>
            <input v-focus ref="search" type="text" :placeholder="t('stylelib.search')" v-model="keyword"
                @keydown.esc="emits('close')">
            <div v-if="libListStatus.visible" id="text-lib-list" class="text-lib-list" @click.stop>
                <div class="list-item" v-for="item in libList" :key="item[0]" @click.stop="filter(item[1])">
                    <div class="choose" :style="{ visibility: filterWord === item[1] ? 'visible' : 'hidden' }">
                        <SvgIcon :icon="choose_icon" />
                    </div>
                    <span>{{ item[1] }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="sheet in data" :key="sheet.id">
                    <div class="type" @click.stop="currentType(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <SvgIcon
                            :icon="types.has(sheet.name === '新文件' ? '此文件样式' : sheet.name) ? down_icon : right_icon" />
                        <span>{{ sheet.name === '新文件' ? '此文件样式' : sheet.name }}</span>
                    </div>
                    <template v-if="types.has(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <div class="styles" v-for="mask in (sheet.variables as RadiusMask[])" :key="mask.id"
                            :class="{ 'active': modifyPanelStatus.visible && maskID === mask.id, 'target': mask.id === props.id }">
                            <div class="left" @click="createRadiusMask(mask.id)">
                                <div class="name">{{ mask.name }}</div>
                            </div>
                            <div class="editor clickeditor" style="visibility: hidden;"
                                @click="(e) => showModifyPanel(e, mask.id)">
                                <SvgIcon :icon="editor_icon" />
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!data.length && searchval" class="null">{{ t('stylelib.null_search') }}</div>
                <div v-if="!data.length && !searchval" class="null">{{ t('stylelib.null_data') }}</div>
            </div>
        </el-scrollbar>
        <NewTextStyle v-if="createPanelStatus.visible" :context="props.context" :textShape="props.textShape"
            :textShapes="props.textShapes" @close="closeCreatePanel">
        </NewTextStyle>
        <EditorTextStyle v-if="modifyPanelStatus.visible" :textShape="props.textShape" :textShapes="props.textShapes"
            :context="props.context" :maskid="maskID" :reder="fillRenderer" @close="closeModifyPanel">
        </EditorTextStyle>
    </div>

</template>
<script setup lang="ts">
import add_icon from '@/assets/icons/svg/add.svg';
import editor_icon from '@/assets/icons/svg/export-menu.svg';
import down_icon from '@/assets/icons/svg/triangle-down.svg';
import right_icon from '@/assets/icons/svg/triangle-right.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import arrow_icon from '@/assets/icons/svg/arrow-right.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import choose_icon from '@/assets/icons/svg/choose.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import PopoverHeader from "@/components/common/PopoverHeader.vue";

import {
    BasicArray,
    Color,
    Fill,
    FillType,
    GradientType,
    ImageScaleMode,
    ShapeType,
    ShapeView,
    Stop, SymbolView,
    TableView,
    Shadow,
    ShadowPosition,
    TextShapeView,
    RadiusMask,
} from "@kcdesign/data";
import { v4 } from 'uuid';
import { Context } from '@/context';
import { computed, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import NewTextStyle from './NewTextStyle.vue';
import EditorTextStyle from "./EditorTextStyle.vue";
import { SelectItem } from "@/components/common/Select.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillRenderer, Mask } from "../StyleLib/fillRenderer";
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { getShapesForStyle } from '@/utils/style';
import { get_actions_add_mask } from '@/utils/shape_style';


const props = defineProps<{
    context: Context;
    textShape: TextShapeView
    textShapes: TextShapeView[]
    id?: string;
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()


const { t } = useI18n();
const searchval = ref<string>('')
const keyword = ref<string>('')
const filterWord = ref<string>('全部样式')
const types = ref(new Set<string>())
const libList = new Map()
const sheets = reactive<StyleSheet[]>([])
const data = reactive<StyleSheet[]>([])
const list = reactive<Mask[]>([]);
const maskID = ref<string>('')
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], list as Mask[]);

const createPanelStatus = reactive<ElementStatus>({ id: '#create-text-panel', visible: false });
const createPanelStatusMgr = new ElementManager(
    props.context,
    createPanelStatus,
    {
        offsetLeft: -442,
        whiteList: ['.new-style']
    }
);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-text-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    props.context,
    modifyPanelStatus,
    {
        offsetLeft: -462,
        whiteList: ['.editor-style', '.editor']
    }
);

const libListStatus = reactive<ElementStatus>({ id: '#text-lib-list', visible: false });
const libListStatusMgr = new ElementManager(
    props.context,
    libListStatus,
    {
        offsetTop: 32,
        whiteList: ['.text-lib-list', '.filter']
    }
);

const showCreatePanel = (e: MouseEvent) => {
    createPanelStatusMgr.showBy(e);
}
const closeCreatePanel = () => {
    createPanelStatusMgr.close();
}
const showModifyPanel = (event: MouseEvent, _maskID: string) => {
    modifyPanelStatusMgr.showBy(event);
    maskID.value = _maskID;
}
const closeModifyPanel = () => {
    modifyPanelStatusMgr.close();
}

const showLibList = (event: MouseEvent) => {
    libListStatusMgr.showBy(event)
}

const currentType = (t: string) => {
    types.value.has(t) ? types.value.delete(t) : types.value.add(t)
}

watchEffect(() => {
    libList.set('all', '全部样式')
    sheets.forEach(s => {
        if (s.id === props.context.data.id) {
            libList.set(s.name, '此文件样式')
        } else {
            libList.set(s.name, s.name)
        }
    })
    libList.forEach((v) => types.value.add(v))
})

watchEffect(() => {
    data.length = 0;
    const arr = sheets.filter(s => s.name.includes(filterWord.value === '全部样式' ? "" : filterWord.value === '此文件样式' ? "新文件" : filterWord.value))
    const new_arr = arr.map(s => {
        let newSheet: StyleSheet = { ...s }
        newSheet.variables = s.variables.filter(v => (v as RadiusMask).name.includes(keyword.value))
        return newSheet
    })
    data.push(...new_arr.filter(s => s.variables.length !== 0))
})

const createRadiusMask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_add_mask(shapes, id);
    const editor = props.context.editor4Page(page);
    editor.shapesSetRadiusMask(actions);
    emits('close')
}


const filter = (v: string) => {
    filterWord.value = v;
    types.value.add(v)
    libListStatusMgr.close();
}

function update() {
    const lib = props.context.data.stylelib
    if (!lib) return
    fillRenderer.updateUnderRootContainerMap('radius')
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') update();
}

onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher);
})

onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher);
    createPanelStatusMgr.unmounted();
    modifyPanelStatusMgr.unmounted();
    libListStatusMgr.unmounted();
})


</script>
<style lang="scss" scoped>
.text-lib-panel {
    position: fixed;
    background-color: #fff;
    z-index: 9;
    width: 250px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    border-radius: 8px;
    margin-bottom: 8px;
    box-sizing: border-box;
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

    .filter img {
        rotate: -90deg;
        padding: 1px;
        box-sizing: border-box;
    }

    .filter:hover {
        cursor: pointer;

        img {
            transform: translateX(-2px);
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

    .text-lib-list {
        width: 186px;
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

        img {
            width: 14px;
            height: 14px;
        }

        &:hover {
            background-color: #f5f5f5;
        }
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


    .style-item .styles .name {
        // color: #c8c8c8;
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

    .editor {
        visibility: visible !important;
        background-color: #e5e5e5;
    }
}
</style>
