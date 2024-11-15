<template>
    <div class="shadow-container" :style="{ top: props.top + 'px', left: props.left + 'px' }" @wheel.stop>
        <div class="header">
            <div class="title">特效样式</div>
            <div class="tool">
                <div class="newstyle" @click.stop="NewPanel($event)">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <div class="close" @click.stop="emits('close')">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
        </div>
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
                <div class="list-item" v-for="i in test" :key="i.type" @click.stop="Changefilter(i.type)">
                    <span> {{ i.type }}</span>
                </div>
            </div>
        </div>
        <el-scrollbar>
            <div class="content">
                <div class="style-item" v-for="i in data" :key="i.type">
                    <div class="type" @click="showtype(i.type)">
                        <svg-icon :icon-class="showtypes.has(i.type) ? 'triangle-down' : 'triangle-right'"></svg-icon>
                        <span>{{ i.type }}</span>
                    </div>
                    <template v-if="showtypes.has(i.type)">
                        <div class="styles" :class="{ 'active': showeditor && currenttarget === i.id }">
                            <div class="left">
                                <div class="effect" :style="{
                                    boxShadow: `
                                    ${i.styles[0].position.includes('in') ? 'inset' : ''} 
                                    ${i.styles[0].offsetX > 0 ? '1px' : i.styles[0].offsetX < 0 ? '-1px' : '0'} 
                                    ${i.styles[0].offsetY > 0 ? '1px' : i.styles[0].offsetY < 0 ? '-1px' : '0'} 
                                    ${i.styles[0].blurRadius > 0 ? '1px' : '0'}
                                    ${i.styles[0].spread > 0 ? '1px' : '0'}
                                    #0000004d
                                    `}">
                                </div>
                                <div class="name">{{ i.name }}</div>
                            </div>
                            <div class="editor" style="visibility: hidden;" @click.stop="EditPanel($event, i.id,i.styles,i.name,i.des)">
                                <svg-icon icon-class="export-menu"></svg-icon>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="!data.length" class="null">没有搜索到相关样式</div>
            </div>
        </el-scrollbar>
        <EditorEffectStyle v-if="showeditor" :type="Type" :top="Top" :left="Left" :shapes="props.shapes"
            :context="props.context" :list="Data" :name="effectname" :des="effectdes" @close="showeditor = !showeditor" @set-position="setPositoin"
            @add-shadow="addShadow" @set-shadow-enable="setEbable" @del-shadow="delShadow">
        </EditorEffectStyle>
    </div>

</template>
<script setup lang="ts">
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
    ShadowPosition
} from "@kcdesign/data";
import { v4 } from 'uuid';
import { Context } from '@/context';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import EditorEffectStyle from './EditorEffectStyle.vue';
import { SelectItem } from "@/components/common/Select.vue";
import { first } from "lodash";
interface FillItem {
    id: number,
    fill: Fill
}

const props = defineProps<{
    context: Context;
    shapes: ShapeView[]
    shadowlist: Shadow[]
    top: number;
    left: number
}>()

const emits = defineEmits<{
    (e: 'close'): void
}>()


const { t } = useI18n();
const showfilter = ref<boolean>(false)
const searchval = ref<string>('')
const filterval = ref<string>('')
const showtypes = ref(new Set<string>())
const showeditor = ref<boolean>(false)
const Top = ref<number>(0)
const Left = ref<number>(0)
const Type = ref<string>('')
const currenttarget = ref<number>(-1)
const Changefilter = (v: string) => {
    filterval.value = v;
    showfilter.value = false
    showtypes.value.add(v)
}
const search = ref<HTMLInputElement>()
const showtype = (t: string) => {
    showtypes.value.has(t) ? showtypes.value.delete(t) : showtypes.value.add(t)
}
const effectname=ref<string>()
const effectdes=ref<string>()
const Data=ref<Shadow[]>()


const test = [
    { type: 'location',styletype:'effect',id:1,name:'test',des:'s12323',styles: props.shadowlist},
    { type: 'location',styletype:'effect',id:2,name:'123213',des:'上海市是',styles: props.shadowlist}
]

const setEbable = (id: string, b: boolean) => {
    list.value.forEach(i => {
        if (i.id === id)
            i.isEnabled = b
    })
}

const setPositoin = (value: SelectItem, id: string) => {
    list.value.forEach(i => {
        if (i.id === id) {
            i.position = value.value as ShadowPosition
        }
    })
}

const delShadow = (id: string) => {
    list.value.splice(list.value.findIndex(i => i.id === id), 1)
}

const data = computed(() => {
    let d;
    if (filterval.value && filterval.value !== '全部') {
        d = test.filter(i => i.type === filterval.value).filter(i=>i.styletype==='effect')
    } else {
        d = test.filter(i=>i.styletype==='effect')
    }
    return d.filter(i => i.name.includes(searchval.value))
})

const EditPanel = (e: MouseEvent, idx: number,effects:Shadow[],name:string,des:string) => {
    Data.value=effects;
    effectname.value=name;
    effectdes.value=des;
    let el = e.target as HTMLElement;
    while (el.parentElement?.className !== 'style-item') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 12 - 250 - 2;
    Type.value = 'editor'
    if (currenttarget.value === idx) {
        showeditor.value = !showeditor.value
    } else {
        showeditor.value = true
    }
    if (showeditor.value) {
        document.addEventListener('click', checktargetlist)
    }
    currenttarget.value = idx
}

function checktargetlist(e: MouseEvent) {
    const muen = document.querySelector('.editor-style')
    if (!muen) return;
    if (!muen.contains(e.target as HTMLElement)) {
        showeditor.value = false
        document.removeEventListener('click', checktargetlist)
    }
}

const NewPanel = (e: MouseEvent) => {
    currenttarget.value =-1;
    let el = e.target as HTMLElement;
    while (el.className !== 'shadow-container') {
        if (el.parentElement) {
            el = el.parentElement;
        }
    }
    const { top, left } = el.getBoundingClientRect();
    Top.value = top;
    Left.value = left - 250;
    if (showeditor.value) {
        if (Type.value !== 'new') {
            Type.value = 'new'
        } else {
            showeditor.value = false
            document.removeEventListener('click', checktargetlist)
        }
    } else {
        showeditor.value = true
        Type.value = 'new'
        document.addEventListener('click', checktargetlist)
    }
}

watch(showfilter, () => {
    if (showfilter) {
        document.addEventListener('click', (e) => {
            const muen = document.querySelector('.filter-list')
            if (!muen) return;
            if (!muen.contains(e.target as HTMLElement)) {
                showfilter.value = false
            }
        })
    }
})

watchEffect(() => {
    data.value.forEach(i => showtypes.value.add(i.type))
})

onMounted(() => {
    console.log(props.shadowlist);

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
