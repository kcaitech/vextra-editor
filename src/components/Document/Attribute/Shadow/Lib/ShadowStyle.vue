<template>
    <div id="shadow-lib-panel" class="shadow-container">
        <div class="header">
            <div class="title">{{t('stylelib.shadows')}}</div>
            <div class="tool">
                <div class="add" @click="showCreatePanel($event)">
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
            <div class="filter" @click="showLibList">
                <SvgIcon :icon="arrow_icon"/>
            </div>
            <input v-focus ref="search" type="text" :placeholder="t('stylelib.search')" v-model="searchval"/>
            <div v-if="libListStatus.visible" id="shadow-lib-list" class="shadow-lib-list">
                <div class="list-item" v-for="item in listfilter" :key="item[0]" @click.stop="filter(item[1])">
                    <div class="choose" :style="{ visibility: filterval === item[1] ? 'visible' : 'hidden' }">
                        <SvgIcon :icon="choose_icon"/>
                    </div>
                    <span> {{ item[1] }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="sheet in showdata" :key="sheet.id">
                    <div class="type" @click="showtype(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <SvgIcon
                            :icon="showtypes.has(sheet.name === '新文件' ? '此文件样式' : sheet.name) ? down_icon : right_icon"/>
                        <span>{{ sheet.name === '新文件' ? '此文件样式' : sheet.name }}</span>
                    </div>
                    <template v-if="showtypes.has(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <div class="styles"
                             :class="{ 'active': modifyPanelStatus.visible && Mask_ID === shadow.id, 'target': shadow.id === props.id }"
                            v-for="shadow in (sheet.variables as ShadowMask[])" :key="shadow.id"
                            @click.stop="addshadowmask(shadow.id)">
                            <div class="left">
                                <div class="effect" :style="{
                                    boxShadow: `
                                    ${shadow.shadows![0].position.includes('in') ? 'inset' : ''} 
                                    ${shadow.shadows![0].offsetX > 0 ? '1px' : shadow.shadows![0].offsetX < 0 ? '-1px' : '0'} 
                                    ${shadow.shadows![0].offsetY > 0 ? '1px' : shadow.shadows![0].offsetY < 0 ? '-1px' : '0'} 
                                    ${shadow.shadows![0].blurRadius > 0 ? '1px' : '0'}
                                    ${shadow.shadows![0].spread > 0 ? '1px' : '0'}
                                    #0000004d
                                    `}">
                                </div>
                                <div class="name">{{ shadow.name }}</div>
                            </div>
                            <div class="editor" style="visibility: hidden;"
                                 @click.stop="showModifyPanel($event, shadow.id)">
                                <SvgIcon :icon="editor_icon"></SvgIcon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!showdata.length && searchval" class="null">{{t('stylelib.null_search')}}</div>
                <div v-if="!showdata.length && !searchval" class="null">{{t('stylelib.null_data')}}</div>
            </div>
        </el-scrollbar>
        <CreateShadowPanel v-if="createPanelStatus.visible" :context="props.context" :shapes="props.shapes"
                           @close="closeCreatePanel"/>
        <ModifyShadowPanel v-if="modifyPanelStatus.visible" :context="props.context" :shapes="props.shapes"
                           :maskid="Mask_ID" :reder="fillRenderer" @close="closeModifyPanel"/>
    </div>
</template>
<script setup lang="ts">
import add_icon from '@/assets/icons/svg/add.svg';
import editor_icon from '@/assets/icons/svg/export-menu.svg';
import down_icon from '@/assets/icons/svg/triangle-down.svg';
import right_icon from '@/assets/icons/svg/triangle-right.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import arrow_icon from '@/assets/icons/svg/arrow-right.svg';
import choose_icon from '@/assets/icons/svg/choose.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

import { ShadowMask, ShapeView } from "@kcdesign/data";
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import ModifyShadowPanel from './ModifyShadowPanel.vue';
import CreateShadowPanel from './CreateShadowPanel.vue';
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { FillRenderer, Mask } from "../../StyleLib/fillRenderer";
import { getShapesForStyle } from "@/utils/style";
import { get_actions_add_mask } from "@/utils/shape_style";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    context: Context;
    shapes: ShapeView[];
    id?: string;
}>()
const emits = defineEmits<{
    (e: 'close'): void
}>()
const {t}=useI18n()
const filterpanel = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('全部样式')
const showtypes = ref(new Set<string>())

const Mask_ID = ref<string>('')
const search = ref<HTMLInputElement>()
const listfilter = new Map()
const showdata = reactive<StyleSheet[]>([])
const sheets = reactive<StyleSheet[]>([])
const masklist = reactive<Mask[]>([]);
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], masklist as Mask[]);

const createPanelStatus = reactive<ElementStatus>({id: '#create-shadow-panel', visible: false});
const createPanelStatusMgr = new ElementManager(
    props.context,
    createPanelStatus,
    {
        offsetLeft: -442,
        whiteList: ['.new-style', '.add']
    }
);
const showCreatePanel = (e: MouseEvent) => {
    createPanelStatusMgr.showBy(e);
}

const closeCreatePanel = () => {
    createPanelStatusMgr.close();
}
const modifyPanelStatus = reactive<ElementStatus>({id: '#modify-shadow-panel', visible: false});
const modifyPanelStatusMgr = new ElementManager(
    props.context,
    modifyPanelStatus,
    {
        offsetLeft: -462,
        whiteList: ['.editor-style', '.editor']
    }
);

const closeModifyPanel = () => {
    modifyPanelStatusMgr.close();
}

const showModifyPanel = (event: MouseEvent, maskid: string) => {
    modifyPanelStatusMgr.showBy(event);
    Mask_ID.value = maskid;
}

const libListStatus = reactive<ElementStatus>({id: '#shadow-lib-list', visible: false});
const libListStatusMgr = new ElementManager(
    props.context,
    libListStatus,
    {
        offsetTop: 32,
        whiteList: ['.shadow-lib-list', '.filter']
    }
);

const showLibList = (event: MouseEvent) => {
    libListStatusMgr.showBy(event)
}

const showtype = (t: string) => {
    showtypes.value.has(t) ? showtypes.value.delete(t) : showtypes.value.add(t)
}

watchEffect(() => {
    listfilter.set('all', '全部样式')
    sheets.forEach(s => {
        if (s.id === props.context.data.id) {
            listfilter.set(s.name, '此文件样式')
        } else {
            listfilter.set(s.name, s.name)
        }
    })
    listfilter.forEach((v) => showtypes.value.add(v))
})

watchEffect(() => {
    showdata.length = 0;
    const arr = sheets.filter(s => s.name.includes(filterval.value === '全部样式' ? "" : filterval.value === '此文件样式' ? "新文件" : filterval.value))
    const new_arr = arr.map(s => {
        let newSheet: StyleSheet = { ...s }
        newSheet.variables = s.variables.filter(v => (v as ShadowMask).name.includes(searchval.value))
        return newSheet
    })
    showdata.push(...new_arr.filter(s => s.variables.length !== 0))
})

const addshadowmask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_add_mask(shapes, id);
    const editor = props.context.editor4Page(page);
    editor.shapesSetShadowMask(actions);
    emits('close')
}

const filter = (v: string) => {
    filterval.value = v;
    showtypes.value.add(v)
    libListStatusMgr.close();
}

function update() {
    const lib = props.context.data.stylelib
    if (!lib) return
    fillRenderer.updateUnderRootContainerMap('shadow')
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
.shadow-container {
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

        >img {
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

    .shadow-lib-list {
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

        &:hover {
            background-color: #f5f5f5;
        }
    }

    .style-item .type img {
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
