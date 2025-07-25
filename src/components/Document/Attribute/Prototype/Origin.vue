/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
    <div class="origin">
        <div class="title" @click.stop=createOrigin>
            <div class="text" :class="{ active: prototypestart }">{{ t('prototype.origin_title') }}</div>
            <div v-if="!prototypestart" class="add">
                <SvgIcon :icon="add_icon"/>
            </div>
            <div v-else class="delete" @click.stop=deleteOrigin>
                <SvgIcon :icon="delete_icon"/>
            </div>
        </div>
        <div v-if="!prototypestart" class="default">{{ t('prototype.origin_tips') }}</div>
        <div v-else class="originname">
            <label v-if="!showIpnut" for="name" @dblclick="showIpnut = true">{{ originName }}</label>
            <input v-focus v-if="showIpnut" id="name" type="text" v-model="originName" @blur="showIpnut = false"
                @change="setOrigin" autocomplete="off">
            <textarea v-select name="origindes" id="" cols="30" rows="10" :placeholder="t('prototype.origin_des_pla')"
                v-model="originDescribed" @change="setOrigin"></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { ShapeView, PrototypeStartingPoint, PageView, SymbolRefView } from "@kcaitech/vextra-core"
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import add_icon from '@/assets/icons/svg/add.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

type Prototypestart = {
    name: string,
    desc: string
}
const props = defineProps<{
    context: Context,
    prototypestart: Prototypestart | undefined,
}>();

const emits = defineEmits<{
    (e: "createorigin", data: PrototypeStartingPoint): any
    (e: "deleteorigin"): void
    (e: "setorigin", data: PrototypeStartingPoint): void
}>()
const { t } = useI18n()
const showIpnut = ref<boolean>(false)
const originName = ref<string>('')
const originDescribed = ref<string>('')

const start = computed<PrototypeStartingPoint>(() => {
    return new PrototypeStartingPoint(originName.value, originDescribed.value)
})

const maxnumber = (page: PageView) => {
    const shapes = page.childs;
    let start: PrototypeStartingPoint[] = [];
    const name = t('prototype.origin_default_name')
    const regex = new RegExp(name + " \\d")

    let number = 0
    for (let index = 0; index < shapes.length; index++) {
        if (shapes[index].isContainer || shapes[index] instanceof SymbolRefView) {
            const startPoint = shapes[index].prototypeStartPoint
            if (startPoint) start.push(startPoint);
        }
    }

    start = start.filter((i) => regex.test(i.name))

    for (let index = 0; index < start.length; index++) {
        const i = start[index]
        number = Math.max(Number(i.name.split(' ')[1]), number)
    }
    return ++number
}

//创建原型起始节点
const createOrigin = () => {
    if (props.prototypestart) return
    showIpnut.value = true
    const number = maxnumber(props.context.selection.selectedPage!)
    const data = new PrototypeStartingPoint(t('prototype.origin_default_name') + ' ' + number, '')
    emits('createorigin', data)
}

watch(() => props.prototypestart, () => {
    if (!props.prototypestart) return
    originName.value = props.prototypestart.name
    originDescribed.value = props.prototypestart.desc
})

//删除原型起始节点
const deleteOrigin = () => {
    emits('deleteorigin')
}

//设置原型起始节点
const setOrigin = () => {
    showIpnut.value = false
    emits('setorigin', start.value)
}

onMounted(() => {
    if (props.prototypestart?.name) {
        originName.value = props.prototypestart?.name
        originDescribed.value = props.prototypestart?.desc
    }
})

</script>

<style lang="scss" scoped>
@mixin flex($j, $a) {
    display: flex;
    justify-content: $j;
    align-items: $a;
}

.flex {
    display: flex;
    justify-content: space-between;
}

.active {
    color: #000 !important;
}

.origin {
    display: flex;
    flex-direction: column;
    padding: 14px 12px;
    border-bottom: 1px solid #F0F0F0;
    box-sizing: border-box;
    gap: 8px;

    .title {
        @extend .flex;
        line-height: 30px;

        .text {
            font-size: 12px;
            color: #c8c8c8;
        }

        .add,
        .delete {
            width: 28px;
            height: 28px;
            border-radius: var(--default-radius);
            @include flex(center, center);

            &:hover {
                background-color: #F5F5F5;
            }
        }

        img {
            width: 16px;
            height: 16px;
        }
    }

    .default {
        font-size: 11px;
        color: #D9D9D9;
        line-height: 24px;
    }

    .originname {
        // position: relative;

        label {
            display: inline-block;
            width: 100%;
            font-size: 12px;
            line-height: 32px;
            height: 32px;
            padding: 0 12px;
            background-color: #F5F5F5;
            border-radius: 6px;
            box-sizing: border-box;
        }

        input {
            outline: none;
            border: none;
            font-size: 12px;
            width: 100%;
            height: 32px;
            padding: 12px 10px;
            border-radius: 6px;
            background-color: #F5F5F5;
            box-sizing: border-box;

            &:focus {
                border: 1px solid #1878F5;
            }
        }

        textarea {
            margin-top: 8px;
            outline: none;
            resize: none;
            border: none;
            font-size: 12px;
            padding: 12px 10px;
            width: 100%;
            height: 60px;
            border-radius: 6px;
            border: 1px solid #EBEBEB;
            box-sizing: border-box;

            &::placeholder {
                color: #D9D9D9;
            }

            &:focus {
                border-color: #1878F5;
            }

            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }
        }
    }
}
</style>
