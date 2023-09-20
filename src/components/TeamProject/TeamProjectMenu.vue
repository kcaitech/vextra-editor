<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const props = defineProps<{
    items: string[],
    data: any,
    top: number,
    left: number
}>()
const menu = ref<HTMLDivElement>();

defineExpose({ menu });
const emit = defineEmits<{
    (e: 'cancelFixed', data: any): void;
    (e: 'projectSetting', data: any): void;
    (e: 'showMembergDialog', data: any): void;
    (e: 'delProject', data: any): void;
    (e: 'exitProject', data: any): void;
    (e: 'close'): void;
    (e: 'reName', data: any): void;
}>();

const cancelFixed = () => {
    emit('cancelFixed', props.data);
    close();
}
const close = () => {
    emit('close');
}
const projectSetting = () => {
    emit('projectSetting', props.data);
    close();
}
const showMembergDialog = () => {
    emit('showMembergDialog', props.data);
    close();
}
const reName = () => {
    emit('reName', props.data);
    close();
}
const delProject = () => {
    emit('delProject', props.data);
    close();
}
const exitProject = () => {
    emit('exitProject', props.data);
    close();
}

const handleClickOutside = (event: MouseEvent) => {
    if (event.target instanceof Element && !event.target.closest('.rightmenu')) {
        close();
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>
<template>
    <!-- 右键菜单 -->
    <div class="rightmenu" ref="menu" :style="{ top: top + 'px', left: left + 'px' }">
        <ul>
            <li v-if="props.items.includes('rename')" @click.stop="reName">{{t('teamprojectmenu.rename')}}</li>
            <li v-if="props.items.includes('visit')" @click.stop="projectSetting">{{t('teamprojectmenu.projectsetting')}}</li>
            <li v-if="props.items.includes('perm')" @click.stop="showMembergDialog">{{t('teamprojectmenu.membersetting')}}</li>
            <li v-if="props.items.includes('fixed')" @click.stop="cancelFixed">{{t('teamprojectmenu.fixed')}}</li>
            <li v-if="props.items.includes('no_fixed')" @click.stop="cancelFixed">{{t('teamprojectmenu.cancelFixed')}}</li>
            <li v-if="props.items.includes('exit')" @click.stop="exitProject">{{t('teamprojectmenu.projectexittitle')}}</li>
            <li v-if="props.items.includes('del')" @click.stop="delProject">{{t('teamprojectmenu.projectdeltitle')}}</li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.rightmenu {
    min-width: 200px;
    z-index: 999;
    position: absolute;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

    ul {
        padding: 0;

        li {
            display: block;
            padding: 10px 20px;
            font-size: 14px;
            text-decoration: none;
            color: rgba(13, 13, 13, 0.9);
            border-radius: 2px;
            cursor: pointer;

            &:hover {
                background-color: #f3f0ff;
            }
        }
        .line {
            width: 100%;
            height: 8px;
            border-bottom: 1px solid gray;
            margin-bottom: 8px;
            box-sizing: border-box;
        }


    }
}
</style>
