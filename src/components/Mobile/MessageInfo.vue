<template>
    <div class="info">
        <div class="card-header">
            <span>{{ t('apply.notification_message') }}</span>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="back-icon"></svg-icon>
            </div>
        </div>
        <div class="botton">
            <div class="file" @click="clickEvent">文件</div>
            <div class="team" @click="clickEvent">团队</div>
            <div class="indicator" :style="{ width: elwidth + 'px', left: elleft + 'px' }"></div>
        </div>
    </div>
    
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const elwidth = ref()
const elleft = ref()

const emits = defineEmits<{
    (e: 'close'): void,
    (e: 'reviewed'): void
}>()

const props = defineProps<{
    applyList: any,
    teamApplyList: any,
}>()

const clickEvent = (e: MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x
}

function resizechange() {
    const items = document.querySelectorAll('.item')
    const rect = items[itemid.value].getBoundingClientRect()
    elwidth.value = rect.width
    elleft.value = rect.x
}

</script>

<style lang="scss" scoped>
.botton {
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .file,
    .team {
        width: 32px;
        text-align: center;
    }
}

.indicator {
    position: absolute;
    height: 2px;
    background-color: rgba(12, 111, 240, 1);
    bottom: -4px;
    border-radius: 2px;
    transition: all 0.2s ease-in-out;
}

.info {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 999;

    .card-header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 44px;

        .close {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 14px;

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
