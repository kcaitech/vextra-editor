<script setup lang="ts">
import { BoardLoader, BoardMenuItem } from "@/components/Document/Toolbar/Others/Publish/BoardMenu/boardLoader";

const props = defineProps<{
    data: BoardMenuItem;
    lister: BoardLoader;
}>();
</script>
<template>
<div style="width: 100%">
    <div
        style="width: 100%; height: 28px;
        font-size: 12px;color: #000; font-weight: 500;
        white-space: nowrap; cursor: pointer; display: flex; align-items: center;gap: 8px;"
        @click="() => lister.fold(data.page)"
    >
        <span>{{ data.page.name }}</span>
        <svg-icon v-if="data.fold && data.selected" style="width: 12px; height: 12px;"
                  icon-class="comment-solved"/>
    </div>
    <div v-if="!data.fold"
         style="display: grid; column-gap: 4px; row-gap: 4px;grid-template-columns: repeat(auto-fill, 100px);">
        <div v-for="board in data.boards" :key="board.id"
             style="width: 100px; height: 100px; background-color: pink;cursor: pointer"
             @click="() => lister.selected(data.page, board)"
        >
            <div v-if="data.selected?.id === board.id"
                 style="position: relative;width: 100%; height: 100%;background-color: rgba(255, 255, 255, 0.6)">
                <svg-icon style="position: absolute; top: 6px; right: 6px;width: 12px; height: 12px;"
                          icon-class="comment-solved"/>
            </div>
        </div>
    </div>
</div>
</template>
<style scoped lang="scss">

</style>