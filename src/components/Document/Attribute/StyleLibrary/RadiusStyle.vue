<template>
    <div class="radius-container" :style="{ top: props.top + 'px', left: props.left + 'px' }" @wheel.stop
        @mousedown.stop>
        <div class="header">
            <div class="title">圆角样式</div>
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
            <input v-focus type="text" placeholder="搜索样式" v-model="searchval"
                @keydown.esc="emits('close')">
            <div v-if="filterpanel" class="filter-list">
                <div class="list-item" @click.stop="Changefilter('全部')">
                    <span>全部</span>
                </div>
                <div class="list-item" v-for="i in test" :key="i.type" @click.stop="Changefilter(i.type)">
                    <span> {{ i.type }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="i in data" :key="i.type">
                    <div class="type" @click.stop="showtype(i.type)">
                        <svg-icon :icon-class="showtypes.has(i.type) ? 'triangle-down' : 'triangle-right'"></svg-icon>
                        <span>{{ i.type }}</span>
                    </div>
                    <template v-if="showtypes.has(i.type)">
                        <div class="styles" :class="{ 'active': editorpanel && currenttarget === s.content.id }"
                            v-for="s in i.styles.filter(s => s.name.includes(searchval))">
                            <div class="left">
                                <div class="border" :style="{
                                    borderTop: s.content.sideSetting.thicknessTop < 3 ? s.content[0].sideSetting.thicknessTop : 3 + 'px',
                                    borderRight: s.content[0].sideSetting.thicknessRight < 3 ? s.content[0].sideSetting.thicknessRight : 3 + 'px',
                                    borderBottom: s.content[0].sideSetting.thicknessBottom < 3 ? s.content[0].sideSetting.thicknessBottom : 3 + 'px',
                                    borderLeft: s.content[0].sideSetting.thicknessLeft < 3 ? s.content[0].sideSetting.thicknessLeft : 3 + 'px',
                                    borderColor: 'black',
                                    borderStyle: 'solid'
                                }">
                                </div>
                                <div class="name">{{ s.name }}</div>
                            </div>
                            <div class="editor clickeditor" style="visibility: hidden;"
                                @click="EditPanel($event, s.content[0].id, s.content[0])">
                                <svg-icon icon-class="export-menu"></svg-icon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!data.length" class="null">没有搜索到相关样式</div>
            </div>
        </el-scrollbar>
        <NewRadiusStyle v-if="newpanel" :top="Top" :left="Left" :context="props.context"
            @close="props.context.escstack.execute()"></NewRadiusStyle>
        <EditorRadiusStyle v-if="editorpanel" :border="borders" :top="Top" :left="Left" :context="props.context"
            @close="props.context.escstack.execute()"></EditorRadiusStyle>
    </div>

</template>
<script setup lang="ts">
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
import { computed, onMounted, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import EditorRadiusStyle from './EditorRadiusStyle.vue';
import NewRadiusStyle from "./NewRadiusStyle.vue";
import { v4 } from "uuid";
interface FillItem {
    id: number,
    fill: Fill
}

const props = defineProps<{
    context: Context;
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
const newpanel = ref<boolean>(false)
const editorpanel = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const Type = ref<string>('')

const currenttarget = ref<string>('')
const borders = ref<Border>()
const showtype = (t: string) => {
    showtypes.value.has(t) ? showtypes.value.delete(t) : showtypes.value.add(t)
}

const color = new Color(1, 0, 0, 0);
const borderStyle = new BorderStyle(0, 0);
const side = new BorderSideSetting(SideType.Normal, 1, 2, 0, 4);
const strokePaints = new BasicArray<StrokePaint>();
const strokePaint = new StrokePaint( new BasicArray<number>(0), v4(),true, FillType.SolidColor, color);
strokePaints.push(strokePaint);
const border = new Border(BorderPosition.Center, borderStyle, CornerType.Miter, side, strokePaints);

const test = [
    { type: 'location', styles: [{ name: '33', content: [border] }, { name: '2', content: [border] }] },
]

const data = computed(() => {
    let d;
    if (filterval.value && filterval.value !== '全部') {
        d = test.filter(i => i.type === filterval.value)
    } else {
        d = test
    }
    return d.filter(i => i.styles.filter(s => s.name.includes(searchval.value)).length !== 0)
})
let timer: any

const EditPanel = (e: MouseEvent, id: string, b: Border) => {
    borders.value = b;
    let el = e.target as HTMLElement;
    const { top } = el.getBoundingClientRect()
    while (el.parentElement?.className !== 'radius-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    currenttarget.value === id ? editorpanel.value = !editorpanel.value : editorpanel.value = true;
    currenttarget.value = id;
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
    while (el.className !== 'radius-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    newpanel.value = !newpanel.value
    if (editorpanel.value) editorpanel.value = false
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
    const muen = document.querySelector('.new-style')
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

watchEffect(() => {
    data.value.forEach(i => showtypes.value.add(i.type))
})

onMounted(() => {


})


</script>
<style lang="scss" scoped>
.radius-container {
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
