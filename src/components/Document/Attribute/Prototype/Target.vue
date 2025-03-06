/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div class="target">
        <span>{{ t('prototype.interaction_destination') }}</span>
        <div class="targetname" @click.stop="showtargerlist = !showtargerlist">
            <span :style="{ color: targetname ? '#000' : '#c8c8c8' }">{{ targetname || t('prototype.destination_select')
                }}</span>
            <div class="svg-wrap"><SvgIcon :icon="down_icon"/></div>
        </div>
        <div class="search-container" v-if="showtargerlist">
            <div class="header-search">
                <SvgIcon :icon="search_icon"/>
                <input v-focus type="text" :placeholder="t('prototype.destination_search')" v-model="searchvlue">
            </div>
            <div class="item-list">
                <div class="item" v-for="shape in search ?? DomList" :key="shape.id"
                    @click.stop="setTargetNode(shape.id)" @mouseover="curHoverValueIndex = shape.id"
                    @mouseleave="curHoverValueIndex = ''">
                    <SvgIcon :style="{ visibility: targetid === shape.id ? 'visible' : 'hidden' }"
                        :icon="curHoverValueIndex === shape.id ? white_select_icon : page_select_icon"/>
                    <span v-html="highlightedName(shape.name)"></span>
                </div>
                <div v-if="!DomList.length && !searchvlue" class="no-data">
                    {{ t('system.empty') }}
                </div>
                <div v-if="!search.length && searchvlue" class="no-data">
                    {{ t('prototype.destination_search_null') }}
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { Context } from '@/context';
import { ArtboardView, PrototypeInterAction, PrototypeNavigationType, ShapeType, ShapeView } from '@kcdesign/data';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import down_icon from '@/assets/icons/svg/down.svg';
import search_icon from '@/assets/icons/svg/search.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

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

const search = computed(() => {
    return DomList.value.filter(i => i.name.includes(searchvlue.value))
})

const highlightedName = (name: string) => {
    if (searchvlue.value && name.includes(searchvlue.value)) {
        return name.replace(
            new RegExp(searchvlue.value, 'g'), // 使用正则表达式进行全局和不区分大小写的搜索
            `<span style="font-weight:600">${searchvlue.value}</span>`
        );
    } else {
        return `<span>${name}</span>`
    }

}


const getDomList = (id: string, nav: PrototypeNavigationType | undefined) => {
    DomList.value.length = 0
    targetname.value = ''
    curHoverValueIndex.value = '';
    const shapemap = new Map()
    const art = (shape: ShapeView): ShapeView => {
        shapemap.set(shape.parent?.id, shape.id)
        if (shape.parent?.type !== ShapeType.Page) {
            return art(shape.parent!)
        } else {
            return shape
        }
    }
    if (nav === PrototypeNavigationType.SCROLLTO) {
        const shapes = props.context.selection.selectedShapes
        const s = art(shapes[0])
        if (s.type === ShapeType.SymbolUnion) return
        for (let index = 0; index < s.childs.length; index++) {
            const shape = s.childs[index];
            if (shape.id === props.targetid) {
                targetname.value = shape.name
            }
            if (shape.id !== shapemap.get(s.id)) {
                DomList.value.push(shape)
            }

        }
    } else {
        const shapes = props.context.selection.selectedPage?.childs
        const shape = props.context.selection.selectedShapes
        const types = [ShapeType.Artboard, ShapeType.Symbol, ShapeType.SymbolRef];
        if (!shapes) return;
        for (let index = 0; index < shapes.length; index++) {
            if (types.includes(shapes[index].type)) {
                if (shapes[index].id !== shape[0].id) DomList.value.push(shapes[index])
            }
            if (shapes[index].id === props.targetid) {
                targetname.value = shapes[index].name
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
        getDomList(props.actionid, props.type)
        nextTick(() => {
            const muen = document.querySelector('.search-container');
            const el = document.querySelector('.targetname');
            (el as HTMLElement).classList.add('action');
            (muen as HTMLElement).style.width = (el as HTMLElement).clientWidth + 'px';
            (muen as HTMLDivElement).addEventListener('blur', onblur);
            (muen as HTMLDivElement).focus()
        })
    } else {
        const el = document.querySelector('.targetname');
        (el as HTMLElement).classList.remove('action')
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
.action {
    background-color: #EBEBEB !important;
}

.target {
    position: relative;
    display: flex;
    gap: 8px;

    span {
        flex: 0.2;
        font-size: 12px;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }



    .targetname {
        flex: 0.8;
        display: flex;
        align-items: center;
        cursor: default;
        outline: none;
        border: none;
        width: 100%;
        height: 32px;
        background-color: #F5F5F5;
        border-radius: 6px;
        font-size: 12px;
        box-sizing: border-box;
        overflow: hidden;

        &:hover {
            background-color: #EBEBEB;
        }

        span {
            flex: 0.8;
            padding: 0 9px;
            color: rgb(0, 0, 0);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .svg-wrap {
            display: flex;
            position: absolute;
            right: 9px;
            height: 32px;
            flex: 0 0 10px;

            img {
                margin: auto 0;
                width: 12px;
                height: 12px;
                transition: 0.3s;
                color: #666666;
            }

            &:hover svg {
                transform: translateY(2px);
            }
        }
    }

    .search-container {
        position: absolute;
        top: 38px;
        right: 0;
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

                span {
                    flex: 1;
                    font-size: 12px;
                    line-height: 32px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>
