<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {router} from '@/router';
import {Context} from '@/context';
import * as user_api from '@/apis/users';
import * as share_api from '@/apis/share';
import {nextTick, ref, onMounted, onUnmounted} from 'vue';
import Saving from './Saving.vue';
import {useRoute} from 'vue-router';
import {WorkSpace, Perm} from '@/context/workspace';
import {message} from '@/utils/message';
import {ElMessageBox} from 'element-plus'
import DocumentMenu from './DocumentMenu/DocumentMenu.vue';

const route = useRoute();

interface Props {
  context: Context
}

const props = defineProps<Props>();
const ele = ref<number>(1);
const input = ref<HTMLInputElement>();
const name = ref<string>('');
const {t} = useI18n();

function home() {
  if (props.context.communication.docOp.hasPendingSyncCmd()) return hasPendingSyncCmd();
  window.document.title = t('product.name');
  (window as any).sketchDocument = undefined;
  (window as any).skrepo = undefined;
  if (props.context.comment.isDocumentInfo?.project) {
    router.push({path: '/apphome/project/' + props.context.comment.isDocumentInfo.project.id});
  } else {
    router.push({name: 'meshare'});
    sessionStorage.setItem('index', '3')
  }
}

const hasPendingSyncCmd = () => {
  ElMessageBox.confirm(
      `${t('message.unuploaded_msg')}`,
      `${t('message.back_home')}`,
      {
        confirmButtonText: `${t('message.exit_document')}`,
        cancelButtonText: `${t('message.cancel')}`,
      }
  )
      .then(() => {
        window.document.title = t('product.name');
        (window as any).sketchDocument = undefined;
        (window as any).skrepo = undefined;
        if (props.context.comment.isDocumentInfo?.project) {
          router.push({path: '/apphome/project/' + props.context.comment.isDocumentInfo.project.id});
        } else {
          router.push({name: 'meshare'});
          sessionStorage.setItem('index', '3')
        }
      })
      .catch(() => {
        return
      })
}

function rename() {
  if (props.context.workspace.documentPerm !== Perm.isEdit) return
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
  if (e.code === 'Enter' || e.code === 'NumpadEnter') blur();
}

async function blur() {
    if (input.value) {
        const p_name = input.value.value.trim();
        if (p_name.length < 1) {
            ele.value = 1;
            message('info', props.context.workspace.t('system.null_file_name'));
            return;
        }
        if (p_name.length > 50) {
            ele.value = 1;
            message('info', props.context.workspace.t('navi.overname'));
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
            if ((error as any)?.data?.code == '403') {
                message('info', props.context.workspace.t('permission.no_authority_to_rename'));
            }
        } finally {
            ele.value = 1;
        }
    }
}

async function init_name() {
  ele.value = 3;
  const result = await share_api.getDocumentInfoAPI({doc_id: route.query.id});
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
        <div class="home" @click="home">
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M946.751948 410.824772L527.008111 79.821076a28.047291 28.047291 0 0 0-34.717904 0L72.547395 410.824772c-12.15659 9.583567-14.25146 27.21692-4.654583 39.374534 9.596877 12.19857 27.271186 14.252484 39.37351 4.654582l48.518854-38.260546v513.949477c0 15.484218 12.540547 28.0391 28.038076 28.0391h651.65591c15.497528 0 28.038076-12.554882 28.038076-28.0391v-513.949477l48.51783 38.260546a27.917257 27.917257 0 0 0 17.331307 6.023518c8.296543 0 16.510151-3.655271 22.041179-10.679124 9.581519-12.15659 7.500984-29.789944-4.655606-39.37351z m-553.250292 490.379637V668.85616h232.323676v232.347225H393.501656z m413.937383 1.300334H681.899435V640.81706c0-15.484218-12.540547-28.0391-28.038075-28.039099h-288.39778c-15.497528 0-28.037052 12.554882-28.037052 28.039099v261.687683H211.85928V372.373782L509.649159 137.541587 807.439039 372.373782v530.130961z"
                    fill="#ffffff">
                </path>
            </svg>
        </div>
        <DocumentMenu :context="props.context" @rename="rename"></DocumentMenu>
        <div class="rename">
            <span v-if="ele === 1" @click="rename">{{ name }}</span>
            <input v-if="ele === 2" type="text" ref="input" />
            <div class="save" v-if="ele === 3">
                <Saving></Saving>
            </div>
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
        width: 18px;
        height: 18px;
        box-sizing: border-box;
        margin-right: 4px;

        >svg {
            width: 100%;
            height: 100%;
        }
    }

    .rename {
        margin-left: 9px;

        .save {
            width: 8px;
            height: 8px;
        }

        span {
            display: block;
            max-width: 210px;
            height: 100%;
            font-size: var(--font-default-fontsize);
            color: #ffffff;
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        input {
            display: block;
            max-width: 210px;
            height: 100%;
            border: none;
            outline: none;
            background-color: transparent;
            color: #ffffff;
            font-size: var(--font-default-fontsize);
        }
    }

}
</style>