<script setup lang="ts">
import Popover from '@/components/common/Popover.vue';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { AutoLayout } from "@kcdesign/data";
import { Menu } from "@/context/menu";


interface Props {
    autoLayoutDate: AutoLayout
    context: Context
}

const props = defineProps<Props>();
const { t } = useI18n();
const popover = ref();

function showMenu() {
    props.context.menu.notify(Menu.SHUTDOWN_MENU);
    popover.value.show();
}



onMounted(() => {
})
onUnmounted(() => {
})
</script>

<template>
    <div class="auto-layout-detail-container" @mousedown.stop>
        <Popover :context="props.context" class="popover" ref="popover" :width="250" :auto_to_right_line="true"
            :title="t('autolayout.auto_layout_settings')">
            <template #trigger>
                <div class="trigger">
                    <div class="bg" :class="{ actived: props.context.menu.ispopover }" @click="showMenu">
                        <svg-icon icon-class="select-more"></svg-icon>
                    </div>
                </div>
            </template>
            <template #body>
                <div class="options-container">
                    <div class="selected">
                        <div class="title">描边</div>
                        <div class="options">
                            <span>不包含</span>
                            <div><svg-icon icon-class="down"></svg-icon></div>
                        </div>
                    </div>
                    <div class="preview">
                        <div style="width: 120px;"><svg-icon icon-class="excluded-strokes"></svg-icon></div>
                    </div>
                    <div class="selected">
                        <div class="title">堆叠</div>
                        <div class="options">
                            <span>反向堆叠</span>
                            <div><svg-icon icon-class="down"></svg-icon></div>
                        </div>
                    </div>
                    <div class="preview">
                        <div><svg-icon icon-class="reverse-stack"></svg-icon></div>
                    </div>
                </div>
            </template>
        </Popover>
    </div>
</template>

<style scoped lang="scss">
.actived {
    background-color: #EBEBEB;
}

.auto-layout-detail-container {
    >.popover {
        width: 28px;
        height: 32px;

        .trigger {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;

            .bg {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                >svg {
                    width: 16px;
                    height: 16px;
                }
            }

            .bg:hover {
                background-color: #F5F5F5;
            }
        }

        .options-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px 12px 4px 12px;
            box-sizing: border-box;
            height: 100%;


            .selected {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 32px;
                margin-bottom: 8px;

                .options {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-left: 10px;
                    width: 138px;
                    height: 100%;
                    border-radius: 6px;
                    background-color: #F5F5F5;
                    box-sizing: border-box;

                    >div {
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        svg {
                            width: 14px;
                            height: 14px;
                        }
                    }

                    &:hover {
                        background-color: #EBEBEB;
                    }
                }
            }

            .preview {
                width: 100%;
                height: 100px;
                border-radius: 6px;
                background-color: #F5F5F5;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                div {
                    width: 102px;
                    height: 41px;
                    svg {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
        }
    }
}
</style>