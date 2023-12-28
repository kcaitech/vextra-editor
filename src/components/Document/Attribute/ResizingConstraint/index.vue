<script setup lang="ts">
import { Shape } from '@kcdesign/data';
import { Context } from 'aws-sdk/clients/autoscaling';
import { reactive, ref } from 'vue'
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { useI18n } from 'vue-i18n';

interface Props {
    context: Context
    shapes: Shape[]
}
const { t } = useI18n();
const props = defineProps<Props>();
const horizontal_position = ref<boolean>(true);
const vertical_position = ref<boolean>(true);
const checked1 = ref(false)
const checked2 = ref(false)

const horizontalSelected = ref<SelectItem>({ value: 'left', content: t('attr.fixed_left') });
const horizontalOptions: SelectSource[] = genOptions([
    ['left', t('attr.fixed_left')],
    ['right', t('attr.fixed_right')],
    ['centerh', t('attr.center')],
    ['lr', t('attr.fixed_left_right')],
    ['widthWithContainer', t('attr.follow_container')]
]);

const verticalSelected = ref<SelectItem>({ value: 'top', content: t('attr.fixed_top') });
const verticalOptions: SelectSource[] = genOptions([
    ['top', t('attr.fixed_top')],
    ['bottom', t('attr.fixed_bottom')],
    ['centerv', t('attr.center')],
    ['tb', t('attr.fixed_top_bottom')],
    ['heightWithContainer', t('attr.follow_container')]
]);

const state = ref<number>(0);
type Side = 'left' | 'right' | 'hcenter' | 'lrfixed' | 'hfollow' | 'top' | 'bottom' | 'vcenter' | 'tbfixed' | 'vfollow';
enum Codes1 {
    Left = 1,
    Right = 2,
    HCenter = 4,
    LRFixed = 8,
    HFollow = 16,
}
enum Codes2 {
    Top = 1,
    Bottom = 2,
    VCenter = 4,
    TBFixed = 8,
    VFollow = 16,
}
interface Controller {
    left: boolean;
    right: boolean;
    hcenter: boolean;
    lrfixed: boolean;
    follow: boolean;
    top: boolean;
    bottom: boolean;
    vcenter: boolean;
    tbfixed: boolean
}
const controller: Controller = reactive({
    left: false,
    right: false,
    hcenter: false,
    lrfixed: false,
    follow: false,
    top: false,
    bottom: false,
    vcenter: false,
    tbfixed: false,
});
function horizontalJudgment() {
    controller.left = Boolean((~state & Codes1.Left));
    controller.right = Boolean((~state & Codes1.Right));
    controller.hcenter = Boolean((~state & Codes1.HCenter));
    controller.lrfixed = Boolean((~state & Codes1.LRFixed));
    controller.follow = Boolean((~state & Codes1.HFollow));
}
function verticalJudgment() {
    controller.top = Boolean((~state & Codes2.Top));
    controller.bottom = Boolean((~state & Codes2.Bottom));
    controller.vcenter = Boolean((~state & Codes2.VCenter));
    controller.tbfixed = Boolean((~state & Codes2.TBFixed));
    controller.follow = Boolean((~state & Codes2.VFollow));
}
//更新水平状态
function horizontalChange(side: Side) {
    switch (side) {
        case 'left':
            state.value |= Codes1.Left;
            break;
        case 'right':
            state.value |= Codes1.Right;
            break;
        case 'hcenter':
            state.value |= Codes1.HCenter;
            break;
        case 'lrfixed':
            state.value |= Codes1.LRFixed;
            break;
        case 'hfollow':
            state.value |= Codes1.HFollow;
            break;
        default:
            break;
    }
    //更新controller对象
    horizontalJudgment();
}
function horizontalSelect(selected: SelectItem) {
    // props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    horizontalSelected.value = selected;
    // if (state.value === )
}
//更新垂直状态
function verticalChange(side: Side) {
    switch (side) {
        case 'top':
            state.value |= Codes2.Top;
            break;
        case 'bottom':
            state.value |= Codes2.Bottom;
            break;
        case 'vcenter':
            state.value |= Codes2.VCenter;
            break;
        case 'tbfixed':
            state.value |= Codes2.TBFixed;
            break;
        case 'vfollow':
            state.value |= Codes2.VFollow;
            break;
        default:
            break;
    }
    //更新controller对象
    verticalJudgment();
}
function verticalSelect(selected: SelectItem) {
    verticalSelected.value = selected;
}
// function constraint(side: Side): string {
//     const
//     switch (side) {
//         case 'left':
//         if(controller.left && controller.hcenter) return
//     }
// }
function fix_width() {
    checked1.value = !checked1.value
}
function fix_height() {
    checked2.value = !checked2.value
}
</script>
<template>
    <div class="wrap">
        <h6 style="font-weight: 600;flex-shrink: 0;margin-left: 4%;height: 5%;">{{ t('attr.groupings') }}</h6>
        <div v-if="horizontal_position" class="horizontal-container">
            <label style="margin-left: 4%;">{{ t('attr.horizontal') }}</label>
            <Select :selected="horizontalSelected" :source="horizontalOptions" @select="horizontalSelect"></Select>
            <div class="checkbox1">
                <div :class="checked1 ? 'visibility' : 'hidden'" @click="fix_width">
                    <svg-icon v-if="checked1" icon-class="select"></svg-icon>
                </div>
            </div>
            <div class="word1"><span>{{ t('attr.fixedWidth') }}</span></div>
        </div>
        <div v-if="vertical_position" class="vertical-container">
            <label style="margin-left: 4%;">{{ t('attr.vertical') }}</label>
            <Select :selected="verticalSelected" :source="verticalOptions" @select="verticalSelect"></Select>
            <div class="checkbox2">
                <div :class="checked2 ? 'visibility' : 'hidden'" @click="fix_height">
                    <svg-icon v-if="checked2" icon-class="select"></svg-icon>
                </div>
            </div>
            <div class="word2"><span>{{ t('attr.fixedHeight') }}</span></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.wrap {
    width: 100%;
    height: 200px;
    background-color: rgba(0, 0, 0, 0.2);

    .horizontal-container {
        display: flex;
        align-items: center;

        .word1 {
            margin-top: -2px;
            margin-left: 5px;
        }

        .checkbox1 {
            margin-left: -2px;

            .visibility {
                flex: 0 0 18px;
                height: 13px;
                width: 13px;
                margin-left: 15px;
                background-color: var(--active-color);
                border-radius: var(--default-radius);
                border: 1px solid var(--input-background);
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;

                >svg {
                    width: 60%;
                    height: 60%;
                }
            }

            .hidden {
                flex: 0 0 18px;
                height: 13px;
                width: 13px;
                margin-left: 15px;
                background-color: transparent;
                border-radius: var(--default-radius);
                border: 1px solid var(--input-background);
                box-sizing: border-box;
            }
        }

    }

    .vertical-container {
        display: flex;
        align-items: center;
        margin-top: 5%;

        .word2 {
            margin-top: -2px;
            margin-left: 5px;
        }

        .checkbox2 {
            margin-left: -2px;

            .visibility {
                flex: 0 0 18px;
                height: 13px;
                width: 13px;
                margin-left: 15px;
                background-color: var(--active-color);
                border-radius: var(--default-radius);
                border: 1px solid var(--input-background);
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;

                >svg {
                    width: 60%;
                    height: 60%;
                }
            }

            .hidden {
                flex: 0 0 18px;
                height: 13px;
                width: 13px;
                margin-left: 15px;
                background-color: transparent;
                border-radius: var(--default-radius);
                border: 1px solid var(--input-background);
                box-sizing: border-box;
            }
        }
    }
}
</style>