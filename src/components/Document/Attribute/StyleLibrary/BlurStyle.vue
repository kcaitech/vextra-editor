<template>
    <div class="shadow-container" :style="{ top: props.top + 'px', left: props.left + 'px' }" @wheel.stop
        @mousedown.stop>
        <div class="header">
            <div class="title">模糊样式</div>
            <div class="tool">
                <div class="newstyle" @click="NewPanel($event)">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <div class="close" @click="emits('close')">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
        </div>
        <div class="search">
            <div class="icon">
                <svg-icon icon-class="search"></svg-icon>
            </div>
            <div class="filter" @click="FilterPanel">
                <svg-icon icon-class="arrow"></svg-icon>
            </div>
            <input v-focus ref="search" type="text" placeholder="搜索样式" v-model="searchval"
                @keydown.esc="props.context.escstack.execute()">
            <div v-if="filterpanel" class="filter-list" @click.stop>
                <div class="list-item" @click="Changefilter('全部')">
                    <span>全部</span>
                </div>
                <div class="list-item" v-for="sheet in sheets" :key="sheet.id" @click="Changefilter(sheet.name)">
                    <span> {{ sheet.name }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="sheet in sheets" :key="sheet.id">
                    <div class="type" @click="showtype(sheet.name)">
                        <svg-icon
                            :icon-class="showtypes.has(sheet.name) ? 'triangle-down' : 'triangle-right'"></svg-icon>
                        <span>{{ sheet.name }}</span>
                    </div>
                    <template v-if="showtypes.has(sheet.name)">
                        <div class="styles" :class="{ 'active': editorpanel && Mask_ID === mask.id }"
                            v-for="mask in masklist" :key="mask.id" @click.stop="addshadowmask(mask.id)">
                            <div class="left">
                                <div class="effect">
                                    <div class="item" v-for="(i, index) in 25" :key="index"></div>
                                </div>
                                <div class="name">{{ mask.name }}</div>
                            </div>
                            <div class="editor clickeditor" style="visibility: hidden;"
                                @click.stop="EditPanel($event, mask.id)">
                                <svg-icon icon-class="export-menu"></svg-icon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!masklist.length" class="null">没有搜索到相关样式</div>
            </div>
        </el-scrollbar>
        <NewBlurStyle v-if="newpanel" :context="props.context" :shapes="props.shapes" :top="Top" :left="Left"
            @close="closenewpanel"></NewBlurStyle>
        <EditorBlurStyle v-if="editorpanel" :top="Top" :left="Left" :shapes="props.shapes" :context="props.context"
            :maskid="Mask_ID" :reder="fillRenderer" @close="closeeditorpanel">
        </EditorBlurStyle>
    </div>

</template>
<script setup lang="ts">
import { ShapeView } from "@kcdesign/data";
import { v4 } from 'uuid';
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import EditorBlurStyle from './EditorBlurStyle.vue';
import NewBlurStyle from './NewBlurStyle.vue';
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";
import { FillRenderer, Mask } from "./fillRenderer";
import { getShapesForStyle } from "@/utils/style";
import { get_actions_add_mask } from "@/utils/shape_style";

const props = defineProps<{
    context: Context;
    shapes: ShapeView[]
    top: number;
    left: number
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()


const { t } = useI18n();
const filterpanel = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('')
const showtypes = ref(new Set<string>())
const editorpanel = ref<boolean>(false)
const newpanel = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const Mask_ID = ref<string>('')
const search = ref<HTMLInputElement>()

const showtype = (t: string) => {
    showtypes.value.has(t) ? showtypes.value.delete(t) : showtypes.value.add(t)
}

const sheets = reactive<StyleSheet[]>([])
const masklist = reactive<Mask[]>([]);
const fillRenderer = new FillRenderer(props.context, sheets as StyleSheet[], masklist as Mask[]);

const addshadowmask = (id: string) => {
    const selected = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage!;
    const shapes = getShapesForStyle(selected);
    const actions = get_actions_add_mask(shapes, id);
    const editor = props.context.editor4Page(page);
    editor.shapesSetBlurMask(actions);
    emits('close')
}

const closenewpanel = () => {
    props.context.escstack.execute()
    newpanel.value = false
    emits('close')
}

const closeeditorpanel = () => {
    props.context.escstack.execute()
    editorpanel.value = false
}

watchEffect(() => {
    sheets.forEach(i => showtypes.value.add(i.name))
    console.log(showtypes.value);
})


let timer: any
const EditPanel = (e: MouseEvent, maskid: string) => {
    let el = e.target as HTMLElement;
    const { top } = el.getBoundingClientRect()
    while (el.parentElement?.className !== 'shadow-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    Mask_ID.value === maskid ? editorpanel.value = !editorpanel.value : editorpanel.value = true;
    Mask_ID.value = maskid;
    if (editorpanel.value) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            document.addEventListener('click', checkeditorpanel)
            clearTimeout(timer)
        }, 0);
        props.context.escstack.save(v4(), closeEditorPanel)
    } else {
        document.removeEventListener('click', checkeditorpanel)
    }
}

function checkeditorpanel(e: MouseEvent) {
    const muen2 = document.querySelectorAll('.clickeditor')
    let b: boolean[] = [];
    muen2.forEach((i) => {
        b.push(i.contains(e.target as HTMLElement))
    })
    const a = b.some(i => i === true)
    if (!a) {
        editorpanel.value = false
        document.removeEventListener('click', checkeditorpanel)
    }
}

const closeEditorPanel = () => {
    const exe_result: boolean = editorpanel.value;
    editorpanel.value = false
    document.removeEventListener('click', checkeditorpanel)
    return exe_result
}

let timer2: any
const NewPanel = (e: MouseEvent) => {
    let el = e.target as HTMLElement;
    while (el.className !== 'shadow-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    newpanel.value = !newpanel.value;
    if (newpanel.value) {
        if (timer2) clearTimeout(timer2)
        timer2 = setTimeout(() => {
            document.addEventListener('click', checknewpanel)
            clearTimeout(timer2)
        }, 0);
        props.context.escstack.save(v4(), closeNewPanel)
    } else {
        document.removeEventListener('click', checknewpanel)
    }
}

function checknewpanel(e: MouseEvent) {
    const muen = document.querySelector('.newstyle')
    if (!muen) return;
    if (!muen.contains(e.target as HTMLElement)) {
        newpanel.value = false
        document.removeEventListener('click', checknewpanel)
    }
}

const closeNewPanel = () => {
    const exe_result: boolean = newpanel.value;
    newpanel.value = false
    document.removeEventListener('click', checknewpanel)
    return exe_result
}

let timer3: any
const FilterPanel = () => {
    filterpanel.value = !filterpanel.value
    if (filterpanel.value) {
        if (timer3) clearTimeout(timer3)
        timer3 = setTimeout(() => {
            document.addEventListener('click', checkfilterpanel)
            clearTimeout(timer3)
        }, 0);
    } else {
        document.removeEventListener('click', checkfilterpanel)
    }
}

const checkfilterpanel = (e: MouseEvent) => {
    const muen = document.querySelector('.filter-list')
    if (!muen) return;
    if (!muen.contains(e.target as HTMLElement)) {
        filterpanel.value = false
        document.removeEventListener('click', checkfilterpanel)
    }
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
