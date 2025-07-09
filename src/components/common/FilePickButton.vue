/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<template>
  <input ref="input" @change="onFilePicked" type="file" :accept="supportedFormats.map(ext => `.${ext}`).join(',')" style="display: none" />
  <button @click="onClick">Open File</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supportedFormats } from '@/basic/consts';

const emit = defineEmits<{
  (e: 'pick', value: File): void;
}>();

const input = ref<HTMLInputElement>();

function onClick() {
  input.value?.click();
}
function onFilePicked() {
  const files = input.value?.files;
  if (files && files.length > 0) {
    emit('pick', files[0]);
  }
}
</script>
