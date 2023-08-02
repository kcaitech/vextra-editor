
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