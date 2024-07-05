<script setup lang="ts">
import { templates, TL } from "@/components/Document/Attribute/Artboard/template";
import Folder from "@/components/Document/Attribute/Artboard/Folder.vue";
import { onBeforeMount, ref } from "vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n'

interface Props {
    context: Context
}

const props = defineProps<Props>();
const t = useI18n().t;

const extendStatus = ref<boolean[]>([]);

function modify(index: number) {
    extendStatus.value[index] = !extendStatus.value[index];
    localStorage.setItem('templateStatus', JSON.stringify(extendStatus.value));
}

function action(template: TL) {
    let name = template.name;
    let reg = new RegExp(`^${name} - [0-9]+$`);
    let max = 0;
    const artboardList = props.context.selection.selectedPage!.artboardList;
    artboardList.forEach(a => {
        if (!reg.test(a.name)) return;
        const index = a.name.lastIndexOf(' ');
        const end = Number(a.name.slice(index + 1));
        if (isNaN(end)) return;
        if (end > max) max = end;
    });
    name = template.name + ' - ' + (max ? max + 1 : 1);
    props.context.tool.setArtboardTemp(template.width, template.height, name);
}

onBeforeMount(() => {
    const templateStatus = JSON.parse(localStorage.getItem('templateStatus') || '[]') as boolean[];
    if (templateStatus.length === templates.length) {
        extendStatus.value = templateStatus.map(i => i);
    } else {
        for (let i = 0; i < templates.length; i++) {
            extendStatus.value.push(false);
        }
        extendStatus.value[0] = true;
    }
})
</script>
<template>
<div class="board-template">
    <div class="header">
        {{ t('attr.frameSize') }}
    </div>
    <el-scrollbar style="height: calc(100% - 40px)">
        <Folder
            v-for="(f, index) in templates"
            :key="index"
            :title="f.title"
            :extend="extendStatus[index]"
            :list="f.children"
            @toggle="() => {modify(index)}"
            @action="(tl: TL) => {action(tl)}"
        ></Folder>
    </el-scrollbar>
</div>
</template>
<style scoped lang="scss">
.board-template {
    position: absolute;
    background-color: #FFFFFF;
    width: 100%;
    height: calc(100% + 40px);
    top: -40px;
    z-index: 1;

    .header {
        padding: 12px 14px;
        height: 40px;
        width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid #EBEBEB;
    }
}
</style>