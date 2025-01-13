<template>
    <div id="border-container" class="border-container">
        <div class="header">
            <div class="title">边框样式</div>
            <div class="tool">
                <div class="newstyle" @click="NewPanel($event)">
                    <SvgIcon :icon="add_icon"></SvgIcon>
                </div>
                <div class="close" @click="emits('close')">
                    <SvgIcon :icon="close_icon"></SvgIcon>
                </div>
            </div>
        </div>
        <div class="search">
            <div class="icon">
                <SvgIcon :icon="search_icon"></SvgIcon>
            </div>
            <div class="filter" @click="FilterPanel">
                <SvgIcon :icon="arrow_icon"></SvgIcon>
            </div>
            <input v-focus type="text" placeholder="搜索样式" v-model="searchval"
                @keydown.esc="props.context.escstack.execute()">
            <div v-if="filterpanel" class="filter-list">
                <div class="list-item" v-for="item in listfilter" :key="item[0]" @click.stop="Changefilter(item[1])">
                    <div class="choose" :style="{ visibility: filterval === item[1] ? 'visible' : 'hidden' }">
                        <SvgIcon :icon="choose_icon"></SvgIcon>
                    </div>
                    <span> {{ item[1] }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="sheet in showdata" :key="sheet.id">
                    <div class="type" @click.stop="showtype(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <SvgIcon
                            :icon="showtypes.has(sheet.name === '新文件' ? '此文件样式' : sheet.name) ? down_icon : right_icon">
                        </SvgIcon>
                        <span>{{ sheet.name === '新文件' ? '此文件样式' : sheet.name }}</span>
                    </div>
                    <template v-if="showtypes.has(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <div class="styles"
                            :class="{ 'active': editorpanel && currenttarget === mask.id, 'target': mask.id === props.id }"
                            v-for="mask in (sheet.variables as BorderMask[])" :key="mask.id">
                            <div class="left" @click="addBorderMask(mask.id)">
                                <div class="border" :style="{
                                    borderTop: mask.border.sideSetting.thicknessTop < 3 ? mask.border.sideSetting.thicknessTop : 3 + 'px',
                                    borderRight: mask.border.sideSetting.thicknessRight < 3 ? mask.border.sideSetting.thicknessRight : 3 + 'px',
                                    borderBottom: mask.border.sideSetting.thicknessBottom < 3 ? mask.border.sideSetting.thicknessBottom : 3 + 'px',
                                    borderLeft: mask.border.sideSetting.thicknessLeft < 3 ? mask.border.sideSetting.thicknessLeft : 3 + 'px',
                                    borderColor: 'black',
                                    borderStyle: 'solid'
                                }">
                                </div>
                                <div class="name">{{ mask.name }}</div>
                            </div>
                            <div class="editor" style="visibility: hidden;" @click="EditPanel($event, mask.id)">
                                <SvgIcon :icon="editor_icon"></SvgIcon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!showdata.length && searchval" class="null">没有搜索到相关样式</div>
                <div v-if="!showdata.length && !searchval" class="null">没有可用的样式</div>
            </div>
        </el-scrollbar>
        <NewBorderStyle v-if="newpanel" :top="Top" :left="Left" :context="props.context" :shapes="props.shapes"
            @close="props.context.escstack.execute()"></NewBorderStyle>
        <EditorBorderStyle v-if="editorpanel" :maskid="currenttarget" :reder="fillRenderer" :top="Top" :left="Left"
            :shapes="props.shapes" :context="props.context" @close="props.context.escstack.execute()">
        </EditorBorderStyle>
    </div>

</template>
<script setup lang="ts">
import {
    Border,
    BorderMask,
    ShapeView,
} from "@kcdesign/data";
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import EditorBorderStyle from './EditorBorderStyle.vue';
import NewBorderStyle from "./NewBorderStyle.vue";
import { FillRenderer, Mask } from "./fillRenderer";
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { v4 } from "uuid";
import add_icon from '@/assets/icons/svg/add.svg';
import editor_icon from '@/assets/icons/svg/export-menu.svg';
import down_icon from '@/assets/icons/svg/triangle-down.svg';
import right_icon from '@/assets/icons/svg/triangle-right.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import arrow_icon from '@/assets/icons/svg/arrow-right.svg';
import close_icon from '@/assets/icons/svg/close.svg';
import choose_icon from '@/assets/icons/svg/choose.svg';
import select_icon from '@/assets/icons/svg/select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { getShapesForStyle } from "@/utils/style";
import { get_actions_add_mask } from "@/utils/shape_style";

const props = defineProps<{
    context: Context;
    shapes: ShapeView[]
    top: number;
    left: number
    id?: string;
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()


const { t } = useI18n();
const filterpanel = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('全部样式')
const showtypes = ref(new Set<string>())
const newpanel = ref<boolean>(false)
const editorpanel = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const currenttarget = ref<string>('')
const sheets = reactive<StyleSheet[]>([])
const showdata = reactive<StyleSheet[]>([])
const masklist = reactive<Mask[]>([]);
const listfilter = new Map()
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], masklist as Mask[]);

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
        newSheet.variables = s.variables.filter(v => (v as BorderMask).name.includes(searchval.value))
        return newSheet
    })
    showdata.push(...new_arr.filter(s => s.variables.length !== 0))
})

const addBorderMask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_add_mask(shapes, id);
    const editor = props.context.editor4Page(page);
    editor.shapesSetBorderMask(actions);
    emits('close')
}

const EditPanel = (e: MouseEvent, id: string,) => {
    let el = e.target as HTMLElement;
    const { top } = el.getBoundingClientRect()
    while (el.parentElement?.className !== 'border-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    currenttarget.value === id ? editorpanel.value = !editorpanel.value : editorpanel.value = true;
    currenttarget.value = id;
    document.addEventListener('click', checkeditorpanel)
    props.context.escstack.save(v4(), closeEditorPanel)
}

function checkeditorpanel(e: MouseEvent) {
    e.target instanceof Element &&
        !e.target.closest('.editor-style') &&
        !e.target.closest('.editor') &&
        closeEditorPanel();
}

const closeEditorPanel = () => {
    const exe_result: boolean = editorpanel.value;
    editorpanel.value = false
    document.removeEventListener('click', checkeditorpanel)
    return exe_result
}

const NewPanel = (e: MouseEvent) => {
    let el = e.target as HTMLElement;
    while (el.className !== 'border-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    newpanel.value = !newpanel.value
    document.addEventListener('click', checknewpanel)
    props.context.escstack.save(v4(), closeNewPanel)
}

const closeNewPanel = () => {
    const exe_result: boolean = newpanel.value;
    newpanel.value = false
    document.removeEventListener('click', checknewpanel)
    return exe_result
}

function checknewpanel(e: MouseEvent) {
    e.target instanceof Element &&
        !e.target.closest('.new-style') &&
        !e.target.closest('.newstyle') &&
        closeNewPanel();
}

const FilterPanel = () => {
    if (filterpanel.value) return;
    filterpanel.value = !filterpanel.value
    document.addEventListener('click', checkfilterpanel)
}

const closeFilterPanel = () => {
    filterpanel.value = false
    document.removeEventListener('click', checkfilterpanel)
}

const checkfilterpanel = (e: MouseEvent) => {
    e.target instanceof Element &&
        !e.target.closest('.filter-list') &&
        !e.target.closest('.filter') &&
        closeFilterPanel();
}

const Changefilter = (v: string) => {
    filterval.value = v;
    filterpanel.value = false
    showtypes.value.add(v)
    document.removeEventListener('click', checkfilterpanel)
}

function update() {
    const lib = props.context.data.stylelib
    if (!lib) return
    fillRenderer.updateUnderRootContainerMap('border')
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
.border-container {
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

        >.newstyle {
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
        }
    }

    .filter img {
        rotate: -90deg;
        padding: 1px;
        box-sizing: border-box;
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
