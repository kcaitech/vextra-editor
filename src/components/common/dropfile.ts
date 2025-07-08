/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ref, onMounted, onUnmounted } from 'vue';

const fileRef = ref<File>();

export function useDropFile() {
  onMounted(() => {
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragenter', onDragEnter);
  });
  onUnmounted(() => {
    document.removeEventListener('drop', onDrop);
    document.removeEventListener('dragover', onDragOver);
    document.removeEventListener('dragenter', onDragEnter);
  });

  return fileRef;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
}

function onDragEnter(event: DragEvent) {
  event.preventDefault();
}

const fileTypes = ['.sketch', '.fig', '.vext', '.svg'];
function onDrop(event: DragEvent) {
  event.preventDefault();
  const file = Array.from(event.dataTransfer?.files || []).find((file) => {
    const filename = file.name.toLowerCase();
    return fileTypes.some(type => filename.endsWith(type));
  });
  if (file) {
    fileRef.value = file;
  } else {
    alert('It it not a sketch file!');
  }
}
