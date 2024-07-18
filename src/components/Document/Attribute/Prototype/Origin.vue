<template>
    <div class="origin">
        <div class="title" @click.stop=createOrigin>
            <div class="text" :class="{ active: prototypestart }">流程起点</div>
            <div v-if="!prototypestart" class="add">
                <svg-icon icon-class="add"></svg-icon>
            </div>
            <div v-else class="delete" @click.stop=deleteOrigin>
                <svg-icon icon-class="delete"></svg-icon>
            </div>
        </div>
        <div v-if="!prototypestart" class="default">设置选中容器为新流程起点</div>
        <div v-else class="originname">
            <label v-if="!showIpnut" for="name" @dblclick="showIpnut = true">{{ originName }}</label>
            <input v-focus v-if="showIpnut" id="name" type="text" v-model="originName" @blur="showIpnut = false"
                @change="setPrototypeStartPoint" autocomplete="off">
            <textarea v-select name="origindes" id="" cols="30" rows="10" placeholder="点击输入流程备注信息"
                v-model="originDescribed" @change="setPrototypeStartPoint"></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { ShapeView, PrototypeStartingPoint } from "@kcdesign/data"
import { ref, watch } from 'vue';

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
}>()

watch(() => props.prototypestart, () => {
    console.log(props.prototypestart);

})

const showIpnut = ref<boolean>(false)
const originNumber = ref<number>(1)
const originName = ref<string>('流程' + originNumber.value)
const originDescribed = ref<string>('')

//创建原型起始节点
const createOrigin = () => {
    console.log('111');
    
    originNumber.value++
    const start = new PrototypeStartingPoint(originName.value, originDescribed.value)
    emits('createorigin', start)
    // if (prototypestart.value) return;
    // showIpnut.value = true
    // originName.value = '流程 ' + ++originNameNumber.value
    // originDescribed.value = ''
    // originedit.value = true;
    // const page = props.context.selection.selectedPage!;
    // const e = props.context.editor4Page(page);
    // const shape = props.context.selection.selectedShapes[0];
    // if (!shape) return;
    // e.setPrototypeStart(shape, new PrototypeStartingPoint(originName.value, originDescribed.value));
    // updateData()
}

//删除原型起始节点
const deleteOrigin = () => {
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0]
    if (!shape) return;
    e.delPrototypeStart(shape as ShapeView);

}

//设置原型起始节点
const setPrototypeStartPoint = () => {
    console.log('change');
    const page = props.context.selection.selectedPage!;
    const e = props.context.editor4Page(page);
    const shape = props.context.selection.selectedShapes[0];
    if (!shape) return;
    e.setPrototypeStart(shape as ShapeView, new PrototypeStartingPoint(originName.value, originDescribed.value));

    console.log('change-end');
}

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

        svg {
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
        }
    }
}
</style>
