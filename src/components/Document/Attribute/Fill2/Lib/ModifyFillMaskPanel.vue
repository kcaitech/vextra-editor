<script setup lang="ts">
import { Context } from "@/context";
import { FillMask } from "@kcdesign/data";
import { FillCatch, FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import close_icon from "@/assets/icons/svg/close.svg";
import add_icon from "@/assets/icons/svg/add.svg";
import SvgIcon from "@/components/common/SvgIcon.vue";
import { onMounted, onUnmounted, ref } from "vue";
import FillItem from "@/components/Document/Attribute/Fill2/FillItem.vue";

const {context, manager, data} = defineProps<{
    context: Context;
    manager: FillContextMgr;
    data?: FillMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();

const firstInput = ref<HTMLInputElement>();

const name = ref<string>(data?.name ?? '颜色样式');
const desc = ref<string>(data?.description ?? '');
const fills = ref<FillCatch[]>(getFills());

function getFills() {
    if (!data) return [];
    const container: FillCatch[] = [];
    for (let i = data.fills.length - 1; i > -1; i--) container.push({fill: data.fills[i]});
    return container;
}

function update() {
    name.value = data?.name ?? '';
    desc.value = data?.description ?? '';
    fills.value = getFills();
}

function modifyName(event: Event) {
    if (!data) return;
    const target = event.target as HTMLInputElement;
    manager.modifyMaskName(data.sheet, data.id, target.value);
    target.blur();
}

function modifyDesc(event: Event) {
    if (!data) return;
    const target = event.target as HTMLInputElement;
    manager.modifyMaskDesc(data.sheet, data.id, target.value);
    target.blur();
}

function blur(event: KeyboardEvent) {
    (event.target as HTMLInputElement).blur();
}

onMounted(() => {
    if (data) {
        data.watch(update);
    } else {
        firstInput.value!.focus();
        firstInput.value!.select();
    }
});
onUnmounted(() => {
    data?.unwatch(update);
})
</script>
<template>
    <div class="modify-fill-style-panel" id="modify-fill-style-panel">
        <div class="header">
            <div class="title">{{ data ? '编辑颜色样式' : '创建颜色样式' }}</div>
            <div class="close" @click.stop="emits('close')">
                <SvgIcon :icon="close_icon"/>
            </div>
        </div>
        <div class="detail">
            <div class="name">
                <label for="name">名称</label>
                <input ref="firstInput" type="text" id="name" :value="name" @change="modifyName" @keydown.esc="blur">
            </div>
            <div class="des">
                <label for="des">描述</label>
                <input type="text" id="des" :value="desc" @change="modifyDesc">
            </div>
        </div>
        <div class="list-header">
            <div class="title">颜色</div>
            <div class="create" @click.stop="">
                <SvgIcon :icon="add_icon"/>
            </div>
        </div>
        <div class="fills-container">
            <FillItem v-for="(fill, index) in fills" :key="index" :context="context" :manager="manager"
                      :data="fill as FillCatch"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.modify-fill-style-panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid #f0f0f0;
        box-sizing: border-box;

        .close {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            img {
                width: 16px;
                height: 16px;
                margin: auto;
                padding: 2px;
                box-sizing: border-box;
            }
        }
    }

    .detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .name, .des {
            display: flex;
            align-items: center;
            height: 32px;
            gap: 8px;

            input {
                flex: 1;
                outline: none;
                font-size: 12px;
                padding: 10px 8px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid transparent;
                background-color: #F5F5F5;
                box-sizing: border-box;

                &:focus {
                    border: 1px solid #1878f5;
                }
            }
        }
    }

    .list-header {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 12px;
        box-sizing: border-box;

        .create {
            width: 28px;
            height: 28px;
            display: flex;
            border-radius: 4px;

            &:hover {
                background-color: #F5F5F5;
            }

            img {
                width: 16px;
                height: 16px;
                margin: auto;
            }
        }
    }

    .fills-container {
        display: flex;
        flex-direction: column;
        gap: 6px;

        width: 100%;
        height: fit-content;
        padding: 6px 12px;
        box-sizing: border-box;
    }

    .create-bnt {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        font-size: 12px;
        width: 100px;
        height: 40px;
        border-radius: 6px;
        background-color: #1878f5;
        color: #fff;

        &:hover {
            background-color: #429AFF;
        }

        &:active {
            background-color: #0A59CF;
        }
    }
}
</style>