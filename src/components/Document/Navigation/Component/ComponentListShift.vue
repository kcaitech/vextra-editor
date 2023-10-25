<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import ComponentContainer from './ComponentContainer.vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context
}
interface Emits {
    (e: 'close'): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const search = ref('');
const isList = ref<'alpha' | 'beta'>('beta');
function set_card_type(v: 'alpha' | 'beta') {
    props.context.component.set_card_type(v);
    isList.value = props.context.component.card_type;
}
const close = () => {
    emit('close');
}
onMounted(() => {
    isList.value = props.context.component.card_type;
})
</script>

<template>
    <div class="container">
        <div class="header">
            <span class="title">{{ t('compos.compos') }}</span>
            <div class="close">
                <svg-icon icon-class="close" @click.stop="close"></svg-icon>
            </div>
        </div>
        <div class="search_togger">
            <el-input v-model="search" class="w-50 m-2" :placeholder="t('compos.search_compos')" :prefix-icon="Search" />
            <div class="toggle_list">
                <svg-icon v-if="isList === 'beta'" icon-class="resource"
                    @click.stop="() => set_card_type('alpha')"></svg-icon>
                <svg-icon v-if="isList === 'alpha'" icon-class="text-bulleted-list"
                    @click.stop="() => set_card_type('beta')"></svg-icon>
            </div>
        </div>
        <div class="body">
            <ComponentContainer :context="context" :search="search" :is-attri="true"></ComponentContainer>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 100%;
    min-width: 250px;
    padding: 8px 0 8px 8px;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;

    .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        box-sizing: border-box;
        align-items: center;
        margin-bottom: 10px;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: var(--default-padding-half);
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 65%;
                height: 65%;
            }
        }
    }

    .search_togger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 28px;
        margin-bottom: 10px;

        .el-input {
            height: 28px;
            font-size: 10px;
            line-height: 28px;

            :deep(.el-input__wrapper) {
                background-color: var(--grey-light);
            }

            :deep(.el-input__wrapper.is-focus) {
                box-shadow: 0 0 0 1px var(--active-color) inset !important;
            }
        }

        .toggle_list {
            width: 28px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .body {
        height: calc(100% - 80px);
        box-sizing: border-box;
    }
}
</style>