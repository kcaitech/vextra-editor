<script setup lang="ts">
import { Context } from '@/context';
import { onUnmounted } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const { t } = useI18n();
const detail = ref<boolean>(false);
const box = ref<boolean>(true);
//eff8eba4-1e66-4e4a-a13c-0bd85c7da068.gif、34165807-bda8-404b-b114-6bdf0b31fd6c.jpeg
function toggle_detail() {
    detail.value = !detail.value;
}

function close() {
    box.value = false;
}

function media_watcher(t: number) {

}
onMounted(() => {
    props.context.medias.watch(media_watcher);
})
onUnmounted(() => {
    props.context.medias.unwatch(media_watcher);
})
</script>
<template>
    <div class="wrap">
        <div v-if="box" class="pd-message-box">
            <div class="main">
                <div>图片资源上传失败，稍后将重新尝试上传</div>
                <div class="action">
                    <div class="btn" @click="toggle_detail">{{ detail ? '收起' : '详细信息' }}</div>
                    <div class="btn">取消上传</div>
                    <div class="btn" @click="close">关闭</div>
                </div>
            </div>
            <div :style="{ minHeight: detail ? '200px' : 0 }" class="detail">
                <div class="body"></div>
                <div class="footer">
                    <div class="action">
                        <div class="btn">立即上传</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.wrap {
    .pd-message-box {
        position: fixed;
        width: 450px;
        border-radius: 4px;
        top: 96px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9;
        background-color: #ffffff;
        box-shadow: 0 2px 16px 2px rgba($color: #000000, $alpha: 0.1);
        border: 1px solid #F0F0F0;

        .main {
            width: 100%;
            height: 36px;
            display: flex;
            padding: 4px 8px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #8c8c8c;
            font-size: 12px;

            >.action {
                display: flex;
                gap: 8px;

                .btn {
                    text-align: center;
                    cursor: pointer;
                }
            }
        }

        .detail {
            width: 100%;
            max-height: 400px;
            border-top: 1px solid #F0F0F0;
            transition: 0.1s;
            position: relative;
            overflow: hidden;

            .footer {
                position: absolute;
                width: 100%;
                height: 36px;
                bottom: 0;
                border-top: 1px solid #F0F0F0;
                display: flex;
                flex-direction: row-reverse;
                color: #8c8c8c;
                font-size: 12px;
                align-items: center;
                padding: 4px 8px;
                box-sizing: border-box;

                .btn {
                    text-align: center;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>