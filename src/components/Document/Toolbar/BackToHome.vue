<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { router } from '@/router';
import { Context } from '@/context';
import * as user_api from '@/apis/users';
import * as share_api from '@/apis/share';
import { nextTick, ref, onMounted, onUnmounted } from 'vue';
import Saving from './Saving.vue';
import { useRoute } from 'vue-router';
import { WorkSpace } from '@/context/workspace';
import { message } from '@/utils/message';
const route = useRoute();
interface Props {
    context: Context
}
const props = defineProps<Props>();
const ele = ref<number>(1);
const input = ref<HTMLInputElement>();
const name = ref<string>('');
const { t } = useI18n();
function home() {
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    router.push({ name: 'recently' });
}
function rename() {
    ele.value = 2;
    nextTick(() => {
        if (input.value) {
            input.value.value = name.value;
            input.value.select();
            input.value.addEventListener('blur', blur);
        }
    })
    document.addEventListener('keydown', enter);

}
function enter(e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        blur();
    }
}
async function blur() {
    if (input.value) {
        const p_name = input.value.value.trim().slice(0, 12);
        if (p_name.length < 1) {
            ele.value = 1;
            message('info', props.context.workspace.t('system.null_file_name'));
            return;
        }
        if (p_name === name.value) {
            ele.value = 1;
            return;
        }
        try {
            ele.value = 3;
            await user_api.Setfilename({ doc_id: route.query.id, name: p_name });
            name.value = p_name;
            window.document.title = name.value.length > 8 ? `${name.value.slice(0, 8)}... - ${t('product.name')}` : `${name.value} - ${t('product.name')}`
            document.removeEventListener('keydown', enter);
        } catch (error) {
            console.log(error);
        } finally {
            ele.value = 1;
        }
    }
}
async function init_name() {
    ele.value = 3;
    const result = await share_api.getDocumentInfoAPI({ doc_id: route.query.id });
    if (result?.code === 0) {
        name.value = result.data.document.name;
    } else {
        name.value = props.context?.data.name || '';
    }
    ele.value = 1;
}
function workspace_watcher(t?: any) {
    if (t === WorkSpace.INIT_DOC_NAME) {
        init_name();
    }
}
onMounted(() => {
    init_name();
    props.context.workspace.watch(workspace_watcher);
})
onUnmounted(() => {
    props.context.workspace.unwatch(workspace_watcher);
})
</script>

<template>
    <div class="container" @dblclick.stop>
        <div class="home" title="new file" @click="home">
            <svg-icon icon-class="home_0508"></svg-icon>
        </div>
        <span v-if="ele === 1" @click="rename">{{ name }}</span>
        <input v-if="ele === 2" type="text" ref="input" />
        <div class="save" v-if="ele === 3">
            <Saving></Saving>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
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
        margin-right: 4px;

        >svg {
            width: 88%;
            height: 88%;
        }
    }

    span {
        font-size: var(--font-default-fontsize);
        color: #ffffff;
        cursor: pointer;
    }

    input {
        border: none;
        outline: none;
        background-color: transparent;
        color: #ffffff;
        font-size: var(--font-default-fontsize);
    }

    .save {
        width: 8px;
        height: 8px;
    }
}
</style>