<template>
    <div class="target">
        <span>目标</span>
        <div class="targetname" @click.stop="showtargerlist = !showtargerlist">
            <span :style="{ color: targetname ? '#000' : '#c8c8c8' }">{{ targetname || '请选择容器' }}</span>
            <div class="svg-wrap"><svg-icon icon-class="down"></svg-icon></div>
        </div>
        <div class="search-container" v-if="showtargerlist">
            <div class="header-search">
                <svg-icon icon-class="search"></svg-icon>
                <input v-focus type="text" placeholder="搜索容器" v-model="searchvlue">
            </div>
            <div class="item-list">
                <div class="item" v-for="shape in DomList" :key="shape.id" @click.stop="setTargetNode(shape.id)"
                    @mouseover="curHoverValueIndex = shape.id" @mouseleave="curHoverValueIndex = ''">
                    <svg-icon :style="{ visibility: targetid === shape.id ? 'visible' : 'hidden' }"
                        :icon-class="curHoverValueIndex === shape.id ? 'white-select' : 'page-select'"></svg-icon>
                    <span>{{ shape.name }}</span>
                </div>
                <div v-if="!DomList.length" class="no-data"> {{ t('system.empty') }}</div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { Context } from '@/context';
import { ArtboradView, PrototypeInterAction, PrototypeNavigationType, ShapeType, ShapeView } from '@kcdesign/data';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    context: Context
    type: PrototypeNavigationType | undefined
    actionid: string
    targetid: string | undefined
}>()

const emits = defineEmits<{
    (e: "settargetnode", id: string): void
}>()

const { t } = useI18n()
const DomList = ref<ShapeView[]>([])
const curHoverValueIndex = ref<string>('');
const showtargerlist = ref<boolean>(false)
const searchvlue = ref<string>('')
const targetname = ref<string>('')

const setTargetNode = (id: string) => {
    emits('settargetnode', id)
    showtargerlist.value = false
}

const getDomList = (id: string, nav: PrototypeNavigationType | undefined) => {
    DomList.value = []
    targetname.value = ''
    curHoverValueIndex.value ='';
    if (nav === PrototypeNavigationType.SCROLLTO) {
        const shapes = props.context.selection.selectedShapes
        if (!(shapes[0] instanceof ArtboradView)) return
        for (let index = 0; index < shapes[0].childs.length; index++) {
            const s = shapes[0].childs[index];
            if (s.id === props.targetid) {
                targetname.value = s.name
            }
            DomList.value.push(s)
        }
    } else {
        const shapes = props.context.selection.selectedPage?.childs
        const types = [ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolRef];
        if (!shapes) return;
        for (let index = 0; index < shapes.length; index++) {
            const shape = shapes[index];
            if (types.includes(shape.type)) {
                const actions = (shape as ArtboradView).prototypeInterAction
                if (actions?.length) {
                    for (let index = 0; index < actions.length; index++) {
                        const e = actions[index];
                        if (e.id === id) break
                        DomList.value?.push(shape)
                    }
                } else {
                    DomList.value?.push(shape)
                }
            }
            if (shape.id === props.targetid) {
                targetname.value = shape.name
            }
        }
    }
}

function checktargetlist(e: MouseEvent) {
    const muen = document.querySelector('.search-container')
    if (!muen) return;
    if (!muen.contains(e.target as HTMLElement)) {
        showtargerlist.value = false
    }
}

function onblur() {
    const muen = document.querySelector('.search-container');
    (muen as HTMLDivElement).removeEventListener('blur', onblur);
    showtargerlist.value = false
}

watch(showtargerlist, () => {
    if (showtargerlist.value) {
        document.addEventListener('click', checktargetlist);
        nextTick(() => {
            const muen = document.querySelector('.search-container');
            (muen as HTMLDivElement).addEventListener('blur', onblur);
            (muen as HTMLDivElement).focus()
        })
    }
})

watch(() => props.targetid, () => {
    if (!props.targetid) return
    getDomList(props.actionid, props.type)
})

watch(() => props.type, () => {
    if (!props.type) return
    getDomList(props.actionid, props.type)
})

onMounted(() => {
    getDomList(props.actionid, props.type)
})

</script>

<style lang="scss" scoped>
.target {
    position: relative;
    display: flex;
    gap: 8px;

    span {
        line-height: 32px;
        white-space: nowrap;
    }

    .svg-wrap {
        display: flex;
        position: absolute;
        right: 9px;
        height: 32px;
        flex: 0 0 10px;

        svg {
            margin: auto 0;
            width: 10px;
            height: 12px;
            transition: 0.3s;
            color: #666666;
        }

        &:hover svg {
            transform: translateY(2px);
        }
    }

    .targetname {
        display: flex;
        align-items: center;
        cursor: default;
        outline: none;
        border: none;
        width: 100%;
        padding: 10px;
        height: 32px;
        background-color: #F5F5F5;
        border-radius: 6px;
        font-size: 12px;
        box-sizing: border-box;

        &:hover {
            background-color: #EBEBEB;
        }
    }

    .search-container {
        position: absolute;
        top: 38px;
        left: 32px;
        width: 140px;
        padding: 6px 0;
        border-radius: 4px;
        background-color: white;
        box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.08);
        box-sizing: border-box;
        z-index: 999;

        .header-search {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0 6px;
            height: 32px;
            padding: 10px 8px;
            border-radius: 6px;
            margin-bottom: 6px;
            background-color: #F5F5F5;
            box-sizing: border-box;

            svg {
                width: 12px;
                height: 12px;
            }

            input {
                outline: none;
                border: none;
                padding: 0;
                width: 100%;
                font-size: 12px;
                background-color: transparent;

                &::placeholder {
                    color: #BFBFBF;
                }
            }
        }

        .item-list {
            max-height: 200px;
            overflow-y: scroll;

            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            .no-data {
                height: var(--default-input-height);
                color: var(--theme-color);
                line-height: var(--default-input-height);
                padding-left: 8px;
            }

            .item {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 8px;
                height: 32px;
                padding: 0 6px;

                svg {
                    flex: 0 0 12px;
                    height: 12px;
                }

                &:hover {
                    background-color: var(--active-color);
                    color: white;
                }
            }
        }
    }
}
</style>
