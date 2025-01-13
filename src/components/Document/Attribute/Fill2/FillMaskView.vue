<script setup lang="ts">
import SvgIcon from "@/components/common/SvgIcon.vue";
import delete_icon from "@/assets/icons/svg/delete.svg";
import unbind_icon from "@/assets/icons/svg/unbind.svg";

import { Context } from "@/context";
import { FillCatch, FillContextMgr, FillMaskInfo } from "@/components/Document/Attribute/Fill2/ctx";
import { Fill } from "@kcdesign/data";
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { onUnmounted, ref, watch } from "vue";

const props = defineProps<{
    context: Context;
    manager: FillContextMgr;
    fills: FillCatch[];
    info: FillMaskInfo
}>();
const colors = ref<Fill[]>(props.fills.map(i => i.fill).reverse());
const name = ref<string>(props.info.name);

onUnmounted(watch(() => props.info, () => {
    colors.value = props.fills.map(i => i.fill).reverse();
    name.value = props.info.name;
}))
</script>
<template>
    <div class="fill-mask-container">
        <div class="fill-mask-port">
            <div class="info">
                <div class="desc">
                    <ColorBlock :colors="colors as Fill[]" round disabled-alpha/>
                    <span>{{ name }}</span>
                </div>
                <div class="unbind">
                    <SvgIcon :icon="unbind_icon"/>
                </div>
            </div>
            <div class="del">
                <SvgIcon :icon="delete_icon"/>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.fill-mask-container {
    width: 100%;
    height: 32px;

    .fill-mask-port {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;

        .info {
            flex: 1;
            width: 100px;
            height: 100%;
            border-radius: var(--default-radius);
            background-color: var(--input-background);
            display: flex;
            overflow: hidden;

            > div {
                transition: .1s;
                padding: 0 8px;
                box-sizing: border-box;
                &:hover {
                    background-color: #e5e5e5;
                }
            }

            .desc {
                flex: 1;
                width: 50px;
                height: 100%;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .unbind {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 28px;
                width: 28px;
                height: 100%;

                > img {
                    width: 16px;
                    height: 16px;
                }
            }
        }

        .del {
            flex: 0 0 28px;
            width: 28px;
            height: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: var(--default-radius);
            overflow: hidden;
            transition: .2s;

            > svg {
                width: 16px;
                height: 16px;
            }

            &:hover {
                background-color: var(--input-background);
            }
        }
    }
}
</style>