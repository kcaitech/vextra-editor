<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { router } from '@/router';
import Saving from './Saving.vue';
import { WorkSpace } from '@/context/workspace';
const { t } = useI18n();
interface Props {
    context: Context
}
const props = defineProps<Props>();
const saving = ref<boolean>(false);
function home() {
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    router.push({ name: 'recently' });
}
function workspaceWatcher(t: number) {
    if (t === WorkSpace.START_SAVE) {
        saving.value = true;
    } else if (t === WorkSpace.END_SAVE) {
        saving.value = false;
    }
}
onMounted(() => {
    props.context.workspace.watch(workspaceWatcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspaceWatcher);
})
</script>

<template>
    <div class="container">
        <div class="home" title="new file" @click="home">
            <svg-icon icon-class="home_0508"></svg-icon>
        </div>
        <div class="save">
            <Saving v-if="saving"></Saving>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
    width: 42px;
    justify-content: space-around;

    .home {
        cursor: pointer;
        width: 28px;
        height: 28px;
        font-size: 12px;
        color: #ffffff;
        box-sizing: border-box;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-items: center;
        margin-top: 4px;

        >svg {
            width: 88%;
            height: 88%;
        }
    }

    .save {
        width: 8px;
        height: 8px;
    }
}
</style>