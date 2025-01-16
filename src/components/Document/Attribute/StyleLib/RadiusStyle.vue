<template>
    <div id="radius-lib-panel" class="radius-lib-panel">
        <div class="header">
            <div class="title">{{t('stylelib.radius')}}</div>
            <div class="tool">
                <div class="add" @click="showCreatePanel($event)">
                    <SvgIcon :icon="add_icon" />
                </div>
                <div class="close" @click="emits('close')">
                    <SvgIcon :icon="close_icon" />
                </div>
            </div>
        </div>
        <div class="search">
            <div class="icon">
                <SvgIcon :icon="search_icon" />
            </div>
            <div class="filter" @click="showLibList($event)">
                <SvgIcon :icon="arrow_icon" />
            </div>
            <input v-focus type="text" :placeholder="t('stylelib.search')" v-model="keyword" @keydown.esc="emits('close')">
            <div v-if="libListStatus.visible" id="radius-lib-list" class="filter-list">
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
                        <div class="styles"
                            :class="{ 'active': modifyPanelStatus.visible && maskID === mask.id, 'target': mask.id === props.id }"
                            v-for="mask in (sheet.variables as RadiusMask[])" :key="mask.id">
                            <div class="left"  @click="createBlurMask(mask.id)">
                                <div class="border" :style="{borderRadius:mask}">
                                </div>
                                <div class="name">{{ mask.name }}</div>
                            </div>
                            <div class="editor clickeditor" style="visibility: hidden;"
                                @click="(e) => showModifyPanel(e, mask.id)">
                                <SvgIcon :icon="editor_icon" />
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!data.length && keyword" class="null">{{t('stylelib.null_search')}}</div>
                <div v-if="!data.length && !keyword" class="null">{{t('stylelib.null_data')}}</div>
            </div>
        </el-scrollbar>
        <NewRadiusStyle v-if="createPanelStatus.visible" :context="props.context" :shapes="props.shapes"
            @close="closeCreatePanel"></NewRadiusStyle>
        <EditorRadiusStyle v-if="modifyPanelStatus.visible" :context="props.context" :shapes="props.shapes"
            :maskid="maskID" :reder="fillRenderer" @close="closeModifyPanel">
        </EditorRadiusStyle>
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

import {
    BasicArray,
    Border,
    BorderPosition,
    BorderSideSetting,
    BorderStyle,
    Color,
    CornerType,
    Fill,
    FillType,
    GradientType,
    ImageScaleMode,
    ShapeType,
    ShapeView,
    SideType,
    Stop, StrokePaint, SymbolView,
    TableView
} from "@kcdesign/data";
import { Context } from '@/context';
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import EditorRadiusStyle from './EditorRadiusStyle.vue';
import NewRadiusStyle from "./NewRadiusStyle.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { FillRenderer, Mask } from "../StyleLib/fillRenderer";
import { v4 } from "uuid";
import { get_actions_add_mask } from '@/utils/shape_style';
import { getShapesForStyle } from '@/utils/style';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    id?: string;
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()


const { t } = useI18n();
const keyword = ref<string>('')
const filterWord = ref<string>('全部样式')
const types = ref(new Set<string>())

const maskID = ref<string>('')
const search = ref<HTMLInputElement>()
const libList = new Map()
const sheets = reactive<StyleSheet[]>([])
const data = reactive<StyleSheet[]>([])
const list = reactive<Mask[]>([]);
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], list as Mask[]);

const createPanelStatus = reactive<ElementStatus>({ id: '#create-radius-panel', visible: false });
const createPanelStatusMgr = new ElementManager(
    props.context,
    createPanelStatus,
    {
        offsetLeft: -442,
        whiteList: ['.new-style', '.add']
    }
);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-radius-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    props.context,
    modifyPanelStatus,
    {
        offsetLeft: -462,
        whiteList: ['.editor-style', '.editor']
    }
);

const libListStatus = reactive<ElementStatus>({ id: '#radius-lib-list', visible: false });
const libListStatusMgr = new ElementManager(
    props.context,
    libListStatus,
    {
        offsetTop: 32,
        whiteList: ['.blur-lib-list', '.filter']
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
        newSheet.variables = s.variables.filter(v => (v as BlurMask).name.includes(keyword.value))
        return newSheet
    })
    data.push(...new_arr.filter(s => s.variables.length !== 0))
})

const createBlurMask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_add_mask(shapes, id);
    const editor = props.context.editor4Page(page);
    editor.shapesSetBlurMask(actions);
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
    props.context.data.unwatch(stylelib_watcher);
    createPanelStatusMgr.unmounted();
    modifyPanelStatusMgr.unmounted();
    libListStatusMgr.unmounted();
})

</script>
<style lang="scss" scoped>
.radius-lib-panel {
    position: fixed;
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

    .title {}

    .tool {
        display: flex;
        align-items: center;
        gap: 4px;

        >.add {
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

            >svg {
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

            >svg {
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

    .filter-list {
        position: absolute;
        top: 36px;
        width: 60%;
        left: 0;
        background-color: #fff;
        border: 1px solid #e5e5e5e5;
        border-radius: 4px;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        z-index: 9;

        .list-item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            border-radius: 6px;
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
        padding: 0 8px;
        border-radius: 6px;
        box-sizing: border-box;

        &:hover {
            background-color: #f5f5f5;

            .editor {
                visibility: visible !important;
            }
        }
    }

    .style-item .styles .left {
        display: flex;
        align-items: center;
        gap: 8px;

        .border {
            width: 16px;
            height: 16px;
            background-color: #e5e5e5;
            overflow: hidden;
            box-sizing: border-box;
        }
    }


    .style-item .styles .name {
        // color: #c8c8c8;
    }

    .style-item .styles .editor {
        display: flex;
        width: 24px;
        height: 24px;
        border-radius: 4px;

        &:hover {
            background-color: #e5e5e5;
        }

        svg {
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
