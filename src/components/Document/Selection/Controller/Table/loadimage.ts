/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { FilePicker } from "@/components/common/filepicker";
import { onUnmounted } from "vue";
function base64ToDataUrl(format: string, base64: string) {
    format = format.toLocaleLowerCase();
    const de_fileheader = new Map([
        ['svg', `data:image/svg+xml;base64,${base64}`,],
        ['gif', `data:image/gif;base64,${base64}`],
        ['jpeg', `data:image/jpeg;base64,${base64}`],
        ['jpg', `data:image/jpeg;base64,${base64}`],
        ['png', `data:image/png;base64,${base64}`]
    ])
    return de_fileheader.get(format) || '';
}
export function getFormatFromBase64(base64: string) {
    const fileheader = new Map([
        ['data:image/svg+xml', 'svg'],
        ['data:image/gif', 'gif'],
        ['data:image/jpeg', 'jpeg'],
        ['data:image/png', 'png'],
    ])
    const header = base64.substring(0, base64.indexOf(';'));
    return fileheader.get(header);
}
export function loadImage(name: string, buffer: ArrayBuffer) {
    const uInt8Array = new Uint8Array(buffer);
    let i = uInt8Array.length;
    const binaryString = new Array(i);
    while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    const data = binaryString.join('');
    const base64 = btoa(data);
    const ext = name.substring(name.lastIndexOf('.') + 1);
    const url = base64ToDataUrl(ext, base64);
    return { buff: uInt8Array, base64: url };
}
const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';
export function useImagePicker() {
    let filePicker: FilePicker | undefined;
    let cb: (name: string, data: { buff: Uint8Array, base64: string }) => void | undefined;

    function onFilePick(file: File) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const buffer = e.target?.result;
            if (!buffer || !(buffer instanceof ArrayBuffer)) {
                console.log("read image fail")
                return;
            }
            const name = file.name;
            const data = loadImage(name, buffer);
            if (cb) cb(name, data);
        }
        reader.readAsArrayBuffer(file);
    }

    function initpicker() {
        if (!filePicker) filePicker = new FilePicker(accept, onFilePick);
        return filePicker;
    }

    function pickImage(onPickImage: (name: string, data: { buff: Uint8Array, base64: string }) => void) {
        cb = onPickImage;
        initpicker().invoke();
    }

    onUnmounted(() => {
        if (filePicker) filePicker.unmount();
    })

    return pickImage;
}