/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref } from "vue";
import { Color } from "@kcdesign/data";
import { typical } from "@/components/common/ColorPicker/Preset/typical";
import { RGBACatch } from "@/components/common/ColorPicker/Editor/solidcolorlineareditor";

const emits = defineEmits<{
    (e: "change", stop: RGBACatch): void;
}>();
const typicalColor = ref<Color[]>(typical);

function setColor(color: Color) {
    const cc: RGBACatch = {
        R: color.red,
        G: color.green,
        B: color.blue,
        A: color.alpha,
        position: 1
    }
    emits("change", cc);
}
</script>

<template>
    <div class="typical-container">
        <div class="block" v-for="(c, idx) in typicalColor" :key="idx" @click="() => setColor(c as any)"
             :style="{ 'background-color': `rgba(${c.red}, ${c.green}, ${c.blue}, ${c.alpha * 100}%)` }">
        </div>
    </div>
</template>

<style scoped lang="scss">
.typical-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    box-sizing: border-box;
    row-gap: 6px;
    column-gap: 6px;

    > .block {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        cursor: -webkit-image-set(url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABV9JREFUaEPtmG1oVXUcxz8+zpZbLgcuTHDOF6OYsGoTI3IyMG14Hex67waJFERBqdALfZNDDLIoexG9qCjyTTBQat7bwoXMXRTntm4OFnIFr2srkPWc7VG7M77z/1/zsrvOuWdXEe4fDmdnnHPu5/f0/f3Ofx73+Jp3j/OTNeBuRzAbgWwEPHogm0IeHej58WwEPLvQ4wuyEfDoQM+PZyPg2YUeX3AnIqDfmH4I+aY5JjzyZ3wanQ8sNMciQNeCTwD/ADfM3/pfWiuTERDsYmAJ8BDQBDwM/A58B+wGRoExY0xaRmTKgAUGPhd4HAib6+le7gJqgSFjiCLiemXCAAt/P/Ak0GxqYCa4o8B+4BowbtLLlRFzbYDgcwDBPw0cmwVeoD8BT5m0GjH1cFcMkCOs55cC1cDn/wMv0D+BSuAXk0qu0yjdCCRLoy1YeX4r8JlDN8ZMHfwM/G2K2eGjt25LxwArjfL4I8BlQBK5pKys7FBvb+/zDgmkQLuAKPCbiYDk1dVKxwDBSh7l5TLgVeVyeXn5hxcuXKhy+OvS/zeBL036KJUkp64bWzoGCP4+IAB8DMRLS0uvxWKxcofwyvN3jDr9CvwBDJum5roXuDVA91uVeQDwFxcXv93X1+eQfdLD703zvIWXhLr2fjo1oPxXZxX88rq6uj0tLS0vjo+Pc/OmI+cJ/gvAel5NTPCuc996zG0ElP/qrg8Gg8G9J0+e3LNy5cp5hw8fZseOHVy/fn22SLxv+sJ0eOV92vBuI6ChTN7Pa2ho2N3a2rq/qKhofkdHB/n5+USjUTZs2MCNG6rP21dJSUkkHo83moLVLGQ971r3k9/tNAKCV+4vra+vf7mtra2xsLBwCt6+VLWwdu1aJib+S+fS0tLeWCy2F5DWC96ODZ7hnUZgCr6hoeGFSCTyxrJlyxZYzyd75OrVq6xatYpEIkFxcfEPfX19rwCDxgDJpfR/TuCdGDAFHwgEnuvo6HgrLy9vYSr44eFhqqur6ezsZMWKFQwODg4ArwPdpnDVbVUojireibTNlkJTg1kwGKzv7Ow8kpubu2g2+M2bN3Pu3Dm2bdv2TTgc/h54TX0CeAn41uj9nHl/tgjIMDWspYFAYGs0Gv00JydncSr4kZERtmzZwpkzZwT/dTgc/sjMNhrUNNjtMyOH0seT6jgtYqWOum3B+vXre/r7+wsuXbo0qTbJa3R0lJqaGk6fPo3P5/sqFApJLpUq6q4akeVxXQte6XNHDJDi5Pt8vmdDodDRpqYmgsHgjPA+n49Tp05Z+CNmNBCwNF7AMsB+/0pj0+q4qephphpQt51sVn6/f9fx48cPxeNx1qxZc9s7xsbGqK2tpbW1dTq85nopjTxvva2CFbQ95qyAU9WAcl+58qjf7393YGDgCaVIY6P60K2l0aGuro6WlhYZEW5ubtaIIHjNNvK+xgN5fTrsnIKnGiXsrFOwcePGUCQSeayqqor29nYOHjzIzp076enp4cCBA1y8eNHCK23seGBTJxneiSKmdU9yCkk69VW1HLgieBXnpk2bJo2wa926daOrV68Oh0KhD8zHiNLmjsPPlEIyQN+0hdu3bz924sSJchuBmpqay4lEom1oaOjHs2fPnjcjwV/mrNnG0/5OWu6f4ZPSRqAAeKaysnJfV1dXSUVFxZXu7u5PAO3lCFYSac+Sx5lyPl0mV88lp5CtgTwz8+usCVQFKEjBCt5CS2k8bw+6Ik66OdkAXU9+oJtGpmampiYDBKs00SFoFaqVRi8Mnp5N1QfshqzOdkPWNiQLnhFZdGtNqmHO7vsI3i55226Lu/2djN3v9IMmYwBeX/wvm6rTQFcM4lMAAAAASUVORK5CYII=') 1.5x) 4 28, auto;
        box-sizing: border-box;
    }
}
</style>