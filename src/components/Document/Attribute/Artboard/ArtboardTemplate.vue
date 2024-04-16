<script setup lang="ts">
import { templates, TL } from "@/components/Document/Attribute/Artboard/template";
import Folder from "@/components/Document/Attribute/Artboard/Folder.vue";
import { ref } from "vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n'

interface Props {
    context: Context
}

const props = defineProps<Props>();
const t = useI18n().t;

const extendStatus = ref<boolean[]>([]);
for (let i = 0; i < templates.length; i++) {
    extendStatus.value.push(false);
}
extendStatus.value[0] = true;

function modify(index: number) {
    extendStatus.value[index] = !extendStatus.value[index];
}

function action(template: TL) {
    props.context.tool.setArtboardTemp(template.width, template.height, template.name);
}

</script>
<template>
    <div class="board-template">
        <div class="header">
            {{ t('attr.frameSize')}}
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