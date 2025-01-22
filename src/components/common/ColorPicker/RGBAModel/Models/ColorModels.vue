<script setup lang="ts">
import Select, { SelectItem, SelectSource } from "@/components/common/Select.vue";
import { genOptions } from "@/utils/common";
import { computed, ref } from "vue";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";
import Hex from "@/components/common/ColorPicker/RGBAModel/Models/Hex.vue";
import RGB from "@/components/common/ColorPicker/RGBAModel/Models/RGB.vue";
import HSB from "@/components/common/ColorPicker/RGBAModel/Models/HSB.vue";
import HSL from "@/components/common/ColorPicker/RGBAModel/Models/HSL.vue";

defineProps<{ stop: RGBACatch }>();
const emits = defineEmits(["change"]);

const modelOptions: SelectSource[] = genOptions([['Hex', 'Hex'], ['RGB', 'RGB'], ['HSL', 'HSL'], ['HSB', 'HSB']]);
const model = ref<SelectItem>({value: 'Hex', content: 'Hex'});

const input = computed(() => {
    switch (model.value.value) {
        case 'Hex':
            return Hex;
        case 'RGB':
            return RGB;
        case 'HSL':
            return HSL;
        case 'HSB':
            return HSB;
        default:
            return Hex;
    }
})

function switchModel(item: SelectItem) {
    model.value = item;
}

function focus(event: Event) {
    const target = event.target as HTMLInputElement;
    target.select();
}

function colorChange(rgba: RGBACatch) {
    emits("change", rgba);
}
</script>
<template>
    <div class="models-container">
        <Select class="model" :source="modelOptions" :selected="model" @select="switchModel"/>
        <div class="values">
            <component :is="input" :stop="stop" @change="colorChange"/>
            <div class="alpha">
                <input value="100" @focus="focus"/>
                <span>%</span>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.models-container {
    width: 100%;
    height: fit-content;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    gap: 8px;

    .model {
        flex: 0 0 62px;
    }

    .values {
        flex: 1;
        background-color: var(--input-background);
        padding: 0 8px;
        box-sizing: border-box;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .alpha {
            flex: 0 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            input {
                width: 100%;
                height: 100%;
                border: none;
                outline: none;
                text-align: center;
                padding: 0;
                background-color: transparent;
                font-size: var(--default-font-size);
                font-weight: 500;
                color: #000000;
            }

            span {
                font-size: var(--default-font-size);
                flex: 0 0 16px;
            }
        }
    }
}

</style>