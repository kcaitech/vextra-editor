<script setup lang="ts">
import { Context } from "@/context";
import { onMounted } from "vue";
import { BoardLoader, BoardMenuItem } from "@/components/Document/Toolbar/Others/Publish/BoardMenu/boardLoader";
import BoardItemView from "@/components/Document/Toolbar/Others/Publish/BoardMenu/BoardItemView.vue";

const props = defineProps<{
    context: Context;
    boardList: BoardMenuItem[];
    lister: BoardLoader;
}>();


onMounted(() => {

})
</script>
<template>
<BoardItemView v-for="d in props.boardList" :key="d.page.id + d.boards.length" :data="d" :lister="lister"/>
</template>
<style scoped lang="scss">

</style>