<template>
    <div class="color-container" @wheel.stop>
        <div class="search">
            <div class="icon">
                <SvgIcon :icon="search_icon"></SvgIcon>
            </div>
            <div class="filter" @click.stop="showfilter = !showfilter">
                <SvgIcon :icon="arrow_icon"></SvgIcon>
            </div>
            <input v-focus ref="search" type="text" placeholder="搜索样式" v-model="searchval"
                @keydown.esc="props.context.escstack.execute()">
            <div v-if="showfilter" class="filter-list">
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
                    <div class="type" @click="showtype(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <SvgIcon
                            :icon="showtypes.has(sheet.name === '新文件' ? '此文件样式' : sheet.name) ? down_icon : right_icon">
                        </SvgIcon>
                        <span>{{ sheet.name === '新文件' ? '此文件样式' : sheet.name }}</span>
                    </div>
                    <template v-if="showtypes.has(sheet.name === '新文件' ? '此文件样式' : sheet.name)">
                        <div class="styles"
                            :class="{ 'active': showeditor && Mask_ID === mask.id, 'target': mask.id === props.id }"
                            v-for="mask in (sheet.variables as FillMask[])" :key="mask.id"
                            @click="addfillmask(mask.id)">
                            <div class="left">
                                <div class="color">
                                    <div class="containerfill" v-for="fill in mask.fills" :key="fill.id">
                                        <img v-if="fill.fillType === FillType.Pattern" :src="getImageUrl(fill as Fill)"
                                            alt="" :style="{ opacity: fill.contextSettings?.opacity }">
                                        <div class="gradient" v-if="fill.fillType === FillType.Gradient"
                                            :style="[style(fill.color as Color, fill.gradient as Gradient, fill.fillType), { opacity: fill.gradient?.gradientOpacity }]">
                                        </div>
                                        <div v-if="fill.fillType === FillType.SolidColor" class="main"
                                            :style="{ backgroundColor: `rgb(${fill.color.red},${fill.color.green},${fill.color.blue})`, opacity: fill.color.alpha }">
                                            <div v-if="mask.fills?.length == 1" class="mask"
                                                :style="{ opacity: 1 - fill.color.alpha }"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="name">{{ mask.name }}</div>
                            </div>
                            <div class="editor" style="visibility: hidden;"
                                @click.stop="EditPanel($event, mask.id, mask)">
                                <SvgIcon :icon="editor_icon"></SvgIcon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!fillList?.length && searchval" class="search-null">没有搜索到相关样式</div>
                <div v-if="!fillList?.length && !searchval" class="data-null">暂无颜色样式</div>
            </div>
        </el-scrollbar>
        <EditorColorStyle v-if="showeditor" :type="'editor'" :top="Top" :left="Left"
            :shapes="props.context.selection.selectedShapes" :context="props.context" :maskid="Mask_ID" :style="styles"
            @close="showeditor = !showeditor" :reder="fillRenderer"></EditorColorStyle>
    </div>

</template>
<script setup lang="ts">
import {
    BasicArray,
    Color,
    Fill,
    FillMask,
    FillType,
    Gradient,
    GradientType,
    ImageScaleMode,
    ShapeType,
    ShapeView,
    Stop, SymbolView,
    TableView
} from "@kcdesign/data";
import { Context } from '@/context';
import { computed, onMounted, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import EditorColorStyle from './EditorColorStyle.vue';
import { DocumentMeta_stylelib, FillMask_fills, StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { getShapesForStyle } from "@/utils/style";
import { Mask, FillRenderer } from "./fillRenderer";
import { block_style_generator } from "../../../common/ColorPicker/utils"
import { get_actions_add_mask } from "@/utils/shape_style";
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
import { GradientFrom } from "@/components/Document/Selection/Controller/ColorEdit/gradient_utils";


interface FillItem {
    id: number,
    fill: Fill
}
const props = defineProps<{
    fills?: FillItem[];
    context: Context;
    shapes: ShapeView[];
    id?: string;
    locat?: { index: number, type: GradientFrom };
}>();


const showfilter = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('')
const showtypes = ref(new Set<string>())
const showeditor = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const Mask_ID = ref<string>('')
const search = ref<HTMLInputElement>()
const styles = ref<FillMask>()
const listfilter = new Map()
const sheets = reactive<StyleSheet[]>([])
const showdata = reactive<StyleSheet[]>([])
const fillList = reactive<Mask[]>([]);
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], fillList as Mask[]);

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
        newSheet.variables = s.variables.filter(v => (v as FillMask).name.includes(searchval.value))
        return newSheet
    })
    showdata.push(...new_arr.filter(s => s.variables.length !== 0))
})

const Changefilter = (v: string) => {
    filterval.value = v;
    showfilter.value = false
    showtypes.value.add(v)
    fillRenderer.searchstyle(filterval.value, searchval.value)
}

const style = computed(() => {
    return (c: Color, g: Gradient, t: FillType) => block_style_generator(c, g, t)
})

const getImageUrl = (fill: Fill) => {
    return fill.peekImage(true) || props.context.attr.defaultImage;
}

function update() {
    const lib = props.context.data.stylelib
    if (!lib) return
    fillRenderer.updateUnderRootContainerMap('fill');
}

const addfillmask = (id: string) => {
    if (props.locat?.type === 'borders') {
        console.log('边框颜色');
        
    } else {
        const selected = props.context.selection.selectedShapes;
        const page = props.context.selection.selectedPage!;
        const shapes = getShapesForStyle(selected);
        const actions = get_actions_add_mask(shapes, id);
        const editor = props.context.editor4Page(page);
        editor.shapesSetFillMask(actions);
    }

}

const maskid = ref<string>('')
const EditPanel = (e: MouseEvent, id: string, mask: FillMask) => {
    let el = e.target as HTMLElement;
    while (el.parentElement?.className !== 'style-item') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 12 - 250 - 2;
    Mask_ID.value === id ? showeditor.value = !showeditor.value : showeditor.value = true;
    Mask_ID.value = id;
    styles.value = mask;
}

function inputBlur(e: KeyboardEvent) {
    if (e.code === 'Escape') {
        search.value?.blur()
    }
}

function stylelib_watcher(t: number | string) {
    if (t === 'stylelib') update();
}

onMounted(() => {
    update();
    props.context.data.watch(stylelib_watcher);
    document.addEventListener('keydown', inputBlur)
})

onUnmounted(() => {
    props.context.data.unwatch(stylelib_watcher)
    document.removeEventListener('keydown', inputBlur)
})


</script>
<style lang="scss" scoped>
.color-container {
    margin-bottom: 8px;
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

        .color {
            position: relative;
            width: 16px;
            height: 16px;
            background-color: #fff;
            border: 1px solid rgba(230, 230, 230, 0.7);
            border-radius: 3px;
            overflow: hidden;

            .containerfill {
                position: absolute;
                width: 100%;
                height: 100%;

                img {
                    height: 100%;
                    width: 100%;
                    object-fit: contain;
                }

                .gradient {
                    width: 100%;
                    height: 100%;
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

        img {
            outline: none;
            margin: auto;
            width: 16px;
            height: 16px;
        }
    }

    .search-null {
        margin: auto;
    }

    .data-null {
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
