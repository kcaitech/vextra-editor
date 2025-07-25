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
import Popover from '@/components/common/Popover.vue';
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { Context } from '@/context';
import { ShapeView } from '@kcaitech/vextra-core';
import { genOptions } from '@/utils/common';
import { ResizingConstraints } from '@kcaitech/vextra-core';

type Side = 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'center';
interface Controller {
  right: boolean;
  width: boolean;
  left: boolean;
  bottom: boolean;
  height: boolean;
  top: boolean;
}
const props = defineProps<{
  context: Context,
  shape: ShapeView,
}>();
const editor = computed(() => {
  return props.context.editor4Shape(props.shape);
})
let shape: ShapeView | undefined;
const reflush = ref(0);
const watcher = () => {
  reflush.value++;
}

const { t } = useI18n();
const popover = ref();
const controller: Controller = reactive({
  right: false,
  width: false,
  left: false,
  bottom: false,
  height: false,
  top: false
});
const widthSelected = ref<SelectItem>();
const widthOptions: SelectSource[] = genOptions([
  ['left', t('attr.fixed_left')],
  ['right', t('attr.fixed_right')],
  ['lr', t('attr.fixed_left_right')],
  ['centerh', t('attr.center')],
  ['widthWithContainer', t('attr.follow_container')]
]);

const heightSelected = ref<SelectItem>();
const heightOptions: SelectSource[] = genOptions([
  ['top', t('attr.fixed_top')],
  ['bottom', t('attr.fixed_bottom')],
  ['tb', t('attr.fixed_top_bottom')],
  ['centerv', t('attr.center')],
  ['heightWithContainer', t('attr.follow_container')]
]);

function setupWatcher() {
  if (!shape) {
    shape = props.shape;
    shape.watch(watcher);
  }
  else if (shape.id != props.shape.id) {
    shape.unwatch(watcher);
    shape = props.shape;
    shape.watch(watcher);
  }
}
function showMenu() {
  return false;
  // const workspace = props.context.workspace
  // workspace.popoverVisible(false);
  // popover.value?.show();
}
function setConstrain(side: Side) {
  let resizingConstraint = props.shape.resizingConstraint as number;

  switch (side) {
    case 'right':
      if (controller.left && controller.width) return;
      resizingConstraint = resizingConstraint ^ ResizingConstraints.Right;
      break;
    case 'width':
      if (controller.left && controller.right) return;
      resizingConstraint = resizingConstraint ^ ResizingConstraints.Width;
      break;
    case 'left':
      if (controller.width && controller.right) return;
      resizingConstraint = resizingConstraint ^ ResizingConstraints.Left;
      break;
    case 'bottom':
      if (controller.height && controller.top) return;
      resizingConstraint = resizingConstraint ^ ResizingConstraints.Bottom;
      break;
    case 'height':
      if (controller.top && controller.bottom) return;
      resizingConstraint = resizingConstraint ^ ResizingConstraints.Height;
      break;
    case 'top':
      if (controller.height && controller.bottom) return;
      resizingConstraint = resizingConstraint ^ ResizingConstraints.Top;
      break;
    case 'center':
      break;
    default: break;
  }

  editor.value.setResizingConstraint(resizingConstraint);

  controllerInit();
}
function controllerInit() {
  const init = props.shape.resizingConstraint as number;
  controller.right = Boolean((~init & ResizingConstraints.Right));
  controller.width = Boolean((~init & ResizingConstraints.Width));
  controller.left = Boolean((~init & ResizingConstraints.Left));
  controller.bottom = Boolean((~init & ResizingConstraints.Bottom));
  controller.height = Boolean((~init & ResizingConstraints.Height));
  controller.top = Boolean((~init & ResizingConstraints.Top));
}
function status(side: Side): string {
  const disabled = '#e0e0e0';
  const active = '#0929fa';
  const normal = '#000000';
  switch (side) {
    case 'right':
      if (controller.left && controller.width) return disabled;
      if (controller.right) return active;
      return normal;
    case 'width':
      if (controller.left && controller.right) return disabled;
      if (controller.width) return active;
      return normal;
    case 'left':
      if (controller.right && controller.width) return disabled;
      if (controller.left) return active;
      return normal;
    case 'bottom':
      if (controller.top && controller.height) return disabled;
      if (controller.bottom) return active;
      return normal;
    case 'height':
      if (controller.top && controller.bottom) return disabled;
      if (controller.height) return active;
      return normal;
    case 'top':
      if (controller.bottom && controller.height) return disabled;
      if (controller.top) return active;
      return normal;
    case 'center':
      if (controller.left && controller.right && controller.bottom && controller.top) return disabled;
      if (controller.height || controller.width) return active;
      return normal;
    default: return '#000000';
  }
}

// hooks
onMounted(() => {
  setupWatcher();
  controllerInit();
})
onUnmounted(() => {
  if (shape) {
    shape.unwatch(watcher);
    shape = undefined;
  }
})

import gear_icon from '@/assets/icons/svg/gear.svg';
import side_button_icon from '@/assets/icons/svg/side-button.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
</script>

<template>
  <div class="position-container">
    <Popover class="popover" ref="popover" :left="-592" :height="160" :title="t('attr.constraints')"
      :context="props.context">
      <template #trigger>
        <div class="trigger">
          <SvgIcon :icon="gear_icon" @click="showMenu"/>
        </div>
      </template>
      <template #body>
        <div class="position">
          <div class="options">
            <div>
              <label>{{ t('attr.horizontal') }}</label>
              <Select :item-height="30" :width="136" :source="widthOptions"></Select>
            </div>
            <div>
              <label>{{ t('attr.vertical') }}</label>
              <Select :item-height="30" :width="136" :source="heightOptions"></Select>
            </div>
          </div>
          <div class="control">
            <div class="top" :style="{ color: status('top') }" @click="setConstrain('top')">
              <SvgIcon :icon="side_button_icon"/>
            </div>
            <div class="right" :style="{ color: status('right') }" @click="setConstrain('right')">
              <SvgIcon :icon="side_button_icon"/>
            </div>
            <div class="bottom" :style="{ color: status('bottom') }" @click="setConstrain('bottom')">
              <SvgIcon :icon="side_button_icon"/>
            </div>
            <div class="left" :style="{ color: status('left') }" @click="setConstrain('left')">
              <SvgIcon :icon="side_button_icon"/>
            </div>
            <div class="height" @click="setConstrain('height')" :style="{ backgroundColor: status('height') }" />
            <div class="width" @click="setConstrain('width')" :style="{ backgroundColor: status('width') }" />
            <div class="dot" @click.stop="setConstrain('center')" :style="{ backgroundColor: status('center') }"></div>
          </div>
        </div>
      </template>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.position-container {
  z-index: inherit;

  >.popover {
    width: 22px;
    height: 22px;

    .trigger {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;

      >svg {
        width: 50%;
        height: 50%;
        transition: 0.5s;
      }

      >svg:hover {
        transform: rotate(90deg);
      }
    }

    .position {
      height: 100%;
      display: flex;
      padding: var(--default-padding);
      box-sizing: border-box;

      .options {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        >div {
          display: flex;
          align-items: center;

          >label {
            flex: 0 0 80px;
            text-align: left;
            font-weight: var(--font-default-bold);
          }
        }
      }

      .control {
        flex: 0 0 96px;
        box-sizing: border-box;
        border: 2px solid var(--grey-dark);
        height: 100%;
        border-radius: var(--default-radius);
        background-color: var(--input-background);
        margin: 0 auto;
        position: relative;

        >div {
          position: absolute;
          height: 32px;
          width: 32px;
          text-align: center;

          >svg {
            height: 80%;
            width: 80%;
            margin-top: 12px;
          }
        }

        >.top {
          transform: rotate(180deg) translateX(50%);
          left: 50%;
        }

        >.right {
          transform: rotate(270deg) translateX(50%);
          right: 0;
          top: 50%;
        }

        >.bottom {
          transform: rotate(0deg) translateX(-50%);
          left: 50%;
          bottom: 0;
        }

        >.left {
          transform: rotate(90deg) translateX(-50%);
          left: 0;
          top: 50%;
        }

        .height {
          width: 3px;
          height: 20px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .width {
          width: 20px;
          height: 3px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .dot {
          width: 3px;
          height: 3px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
}
</style>