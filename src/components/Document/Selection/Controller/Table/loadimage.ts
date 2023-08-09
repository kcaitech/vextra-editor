import { FilePicker } from "@/components/common/filepicker";
import { onUnmounted } from "vue";

export function loadImage(name: string, buffer: ArrayBuffer) {
    const uInt8Array = new Uint8Array(buffer);
    let i = uInt8Array.length;
    const binaryString = new Array(i);
    while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    const data = binaryString.join('');

    const base64 = window.btoa(data);

    let url = '';
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext == "png") {
        url = "data:image/png;base64," + base64;
    }
    else if (ext == "gif") {
        url = "data:image/gif;base64," + base64;
    }
    else {
        console.log("imageExt", ext);
    }

    return { buff: uInt8Array, base64: url };
}


export function useImagePicker() {
    let filePicker: FilePicker | undefined;
    const accept = 'image/png, image/jpeg, image/gif, image/svg+xml, image/icns';

    function pickImage(onPickImage: (name: string, data: { buff: Uint8Array, base64: string }) => void) {
        if (!filePicker) filePicker = new FilePicker(accept, (file: File) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const buffer = e.target?.result;
                if (!buffer || !(buffer instanceof ArrayBuffer)) {
                    console.log("read image fail")
                    return;
                }
                const name = file.name;
                const data = loadImage(name, buffer);
                onPickImage(name, data);
            }
            reader.readAsArrayBuffer(file);
        });
        filePicker.invoke();
    }

    onUnmounted(() => {
        if (filePicker) filePicker.unmount();
    })

    return pickImage;
}