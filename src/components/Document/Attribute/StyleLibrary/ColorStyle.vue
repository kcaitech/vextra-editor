<template>
    <div class="container" @wheel.stop>
        <div class="search">
            <div class="icon">
                <svg-icon icon-class="search"></svg-icon>
            </div>
            <div class="filter" @click.stop="showfilter = !showfilter">
                <svg-icon icon-class="arrow"></svg-icon>
            </div>
            <input v-focus ref="search" type="text" placeholder="搜索样式" v-model="searchval">
            <div v-if="showfilter" class="filter-list">
                <div class="list-item" @click.stop="Changefilter('全部')">
                    <span>全部</span>
                </div>
                <div class="list-item" v-for="s in data" :key="s.id" @click.stop="Changefilter(s.name)">
                    <span> {{ s.name }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="s in data" :key="s.id">
                    <div class="type" @click.stop="showtype(s.name)">
                        <svg-icon :icon-class="showtypes.has(s.name) ? 'triangle-down' : 'triangle-right'"></svg-icon>
                        <span>{{ s.name }}</span>
                    </div>
                    <template v-if="showtypes.has(s.name)">
                        <div class="styles" v-for="f in s.variables.filter(v => v.name.includes(searchval))" :key="f.id"
                            @click="addfillmask(f.id)">
                            <div class="left">
                                <div class="color">
                                    <div class="main"
                                        :style="{ backgroundColor: `rgb(${f.fills[0].color.red},${f.fills[0].color.green},${f.fills[0].color.blue})`, opacity: f.fills[0].color.alpha }">
                                        <div class="mask" :style="{ opacity: 1 - f.fills[0].color.alpha }"></div>
                                    </div>
                                </div>
                                <div class="name">{{ f.name }}</div>
                            </div>
                            <div class="editor" style="visibility: hidden;"
                                @click.stop="EditPanel($event, f as FillMask)">
                                <svg-icon icon-class="export-menu"></svg-icon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!data?.length && searchval" class="search-null">没有搜索到相关样式</div>
                <div v-if="!data?.length && !searchval" class="data-null">暂无颜色样式</div>
            </div>
        </el-scrollbar>
        <EditorColorStyle v-if="showeditor" :type="'editor'" :top="Top" :left="Left"
            :shapes="props.context.selection.selectedShapes" :context="props.context" :style="styles"
            @close="showeditor = !showeditor"></EditorColorStyle>
    </div>

</template>
<script setup lang="ts">
import {
    BasicArray,
    Color,
    Fill,
    FillMask,
    FillType,
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
import { FillMask_fills } from "@kcdesign/data/dist/types/data/typesdefine";
import { getShapesForStyle } from "@/utils/style";
import { get_actions_add_fillmask } from "@/utils/shape_style";
interface FillItem {
    id: number,
    fill: Fill
}
const props = defineProps<{
    fills?: FillItem[];
    context: Context;
    shapes: ShapeView[];
}>();


const showfilter = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('')
const showtypes = ref(new Set<string>())
const showeditor = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const Changefilter = (v: string) => {
    filterval.value = v;
    showfilter.value = false
    showtypes.value.add(v)
}
const search = ref<HTMLInputElement>()
const styles = ref<FillMask>()
const showtype = (t: string) => {
    showtypes.value.has(t) ? showtypes.value.delete(t) : showtypes.value.add(t)
    console.log(showtypes.value);

}

function update() {
    const lib = props.context.data.stylesMgr
    console.log(lib);

    if (!lib) return
}

const addfillmask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    if (false) {
        const actions = get_actions_fill_unify(shapes);
        const editor = props.context.editor4Page(page);
        editor.shapesFillsUnify(actions);
    } else {
        const actions = get_actions_add_fillmask(shapes, id);
        const editor = props.context.editor4Page(page);
        editor.shapesSetFillMask(actions);
    }
}



const data = computed(() => {
    if (!props.context.data.stylelib) return []
    let d;
    if (filterval.value && filterval.value !== '全部') {
        d = props.context.data.stylelib.filter(s => s.name === filterval.value)
    } else {
        d = props.context.data.stylelib
    }
    return d.filter(s => s.variables.filter(v => v.name.includes(searchval.value)).length !== 0)
})



const EditPanel = (e: MouseEvent, style: FillMask) => {
    styles.value = style
    let el = e.target as HTMLElement;
    while (el.parentElement?.className !== 'style-item') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    console.log(el.getBoundingClientRect(), '**************');
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 12 - 250 - 2;
    showeditor.value = !showeditor.value

}

watchEffect(() => {
    data.value.forEach(i => showtypes.value.add(i.name))
    console.log(showtypes.value);
})

function inputBlur(e: KeyboardEvent) {
    if (e.code === 'Escape') {
        search.value?.blur()
    }
}

onMounted(() => {
    // update();
    // console.log(data.value);

    document.addEventListener('keydown', inputBlur)
})

onUnmounted(() => {
    document.removeEventListener('keydown', inputBlur)
})


</script>
<style lang="scss" scoped>
.container {
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

        svg {
            height: 100%;
            width: 14px;
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

        .color {
            width: 16px;
            height: 16px;
            background-color: #fff;
            border: 1px solid rgba(230, 230, 230, 0.7);
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

    .search-null {
        margin: auto;
    }

    .data-null {
        margin: auto;
    }
}
</style>
