<script setup lang="ts">
import { ref } from "vue";
import { Context } from "@/context";
import developing from "@/assets/development.svg"
import { useI18n } from 'vue-i18n';
import ShowHiddenLeft from "./ShowHiddenLeft.vue";
import ComponentList from "@/components/common/ComponentList.vue";
import ComponentCollapse from "./Component/ComponentCollapse.vue";
const props = defineProps<{ context: Context, leftTriggleVisible: boolean, showLeft: boolean }>();
const { t } = useI18n();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const showHiddenLeft = () => {
    emit('showNavigation')
}
interface Compo { }
interface CompoItem {
    id: string
    name: string[]
    contents: Compo[]
    children: CompoItem[]
    parent: string | undefined
}
const list = [{
    name: ['页面1'],
    contents: [
        { name: '矩形1' },
        { name: '矩形2' },
        { name: '矩形3' },
        { name: '矩形4' }
    ],
    children: []
}, {
    name: ['页面2'],
    contents: [],
    children: [
        {
            name: ['容器'],
            contents: [
                { name: '矩形1' },
                { name: '矩形2' },
                { name: '矩形3' },
                { name: '矩形4' }
            ],
            children: []
        },
    ]
}]
function gen_tree(list: CompoItem[]) {
    const map: Map<string, CompoItem> = new Map();
    const result: CompoItem[] = [];
    for (let i = 0, len = list.length; i < len; i++) {
        let item = list[i];
        map.set(item.id, item);
        if (item.children.length) {
            deep_mapping(map, item.children);
            set_parent(item, item.children);
        }
    }
}
function deep_mapping(map: Map<string, CompoItem>, range: CompoItem[]) {
    for (let i = 0; i < range.length; i++) {
        map.set(range[i].id, range[i]);
    }
}
function set_parent(parent: CompoItem, range: CompoItem[]) {
    if (parent.children.length) {
        for (let i = 0, len = parent.children.length; i < len; i++) {
            const item = range[i];
            item.parent = parent.id;
            if (item.children.length) {
                set_parent(item, item.children);
            }
        }
    }
}
</script>

<template>
    <div class="comps-container">
        <ComponentList v-slot="type">
            <el-scrollbar>
                <div class="demo-collapse" v-for="(item, index) in list" :key="index">
                    <ComponentCollapse :context="context" :type="type.type" :item="item" :index="index"></ComponentCollapse>
                </div>
            </el-scrollbar>
        </ComponentList>
        <ShowHiddenLeft :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft">
        </ShowHiddenLeft>
    </div>
</template>

<style scoped lang="scss">
.comps-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-size: 10px;
    box-sizing: border-box;
    overflow: hidden;

    .el-scrollbar {
        padding-right: 10px;

        .demo-collapse {
            box-sizing: border-box;

        }

        .el-collapse {
            --el-collapse-border-color: none;

            :deep(.el-collapse-item__content) {
                padding-bottom: 10px;
            }
        }

    }

    :deep(.el-collapse-item__header) {
        height: 35px;
        font-size: 10px;
        border-bottom-color: transparent;
        border-radius: 4px;

        &:hover {
            background-color: var(--grey-light);
        }

        padding-left: 4px;
    }
}
</style>