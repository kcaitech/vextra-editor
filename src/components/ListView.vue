<script setup lang="ts">
import { Matrix } from "@/basic/matrix";
import { onMounted, ref, defineProps, reactive } from "vue";

export interface IDataSource<T> {
    length(): number;
    at(index: number): T;
    onChange(l: (startIdx: number, endIdx: number, offset: number) => void): void;
    measure(data: T): { width: number, height: number };
    select(data: T, shift: boolean, ctrl: boolean): void;
    isSelected(data: T): boolean;
}

enum Orientation {
    H = "horizontal",
    V = "vertical"
}

const props = defineProps<{
    source: IDataSource<any>,
    itemView: any,
    width: number,
    height: number,
    scrollX: number,
    scrollY: number,
    orientation: string
}>();
const prepareDatas = ref({ val: new Array<{ data: any, id: string }>() });
// const curProps = reactive({
//     scrollX: 0,
//     scrollY: 0,
//     width: 0,
//     height: 0,
// });

onMounted(() => {
    prepare();
})

function clamp() {

}

function measure() {

}

function prepare() {
    // todo
    const len = props.source.length();
    const val = new Array<{ data: any, id: string }>();
    for (let i = 0; i < len; i++) {
        let data = props.source.at(i);
        val.push({ data, id: data ? data.id : "" });
    }
    prepareDatas.value.val = val;
    matrix.reset();
}

// todo
// 滚动
// 滚动条
// 局部更新
// 滚动到可见
// 点击
// hover
// 单选、多选

props.source.onChange((startIdx: number, endIdx: number, offset: number): void => {
    prepare();
})

// function scrollBy(deltaX: number, deltaY: number) {
//     curProps.scrollX += deltaX;
//     curProps.scrollY += deltaY;
//     clamp();
//     prepare();
// }

// function scrollTo(scrollX: number, scrollY: number) {
//     curProps.scrollX = scrollX;
//     curProps.scrollY = scrollY;
//     clamp();
//     prepare();
// }

const matrix = reactive(new Matrix());

function onMouseWheel(e: WheelEvent) {
    console.log(e);
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    matrix.trans(-deltaX, -deltaY);
}

function onItemClick(data: any) {
    props.source.select(data, false, false);
}

</script>

<template>
    <div class="container" @wheel.prevent="onMouseWheel">
        <div :class="props.orientation" :style="{ transform: matrix.toString() }">
            <component :is="props.itemView" v-for="c in prepareDatas.val" :key="c.id" :data="c.data"
                v-on:click="onItemClick(c.data)" :selected="props.source.isSelected(c.data)" />
        </div>
    </div>
</template>

<style scoped>
div .container {
    overflow: hidden;
}

div .horizontal {
    display: flex;
    flex-flow: row nowrap;
    width: auto;
    height: 100%;
}

div .vertical {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    height: auto;
}
</style>