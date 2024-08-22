// import { Canvg } from 'canvg';

export interface WorkerArgs {
    canvas: OffscreenCanvas,
    svg: string,
    taskId: number
}

export interface WorkerResult {
    args: WorkerArgs,
    image: ImageBitmap
}

// import {
//     Canvg,
//     presets
//   } from 'canvg'

//   const preset = presets.offscreen()

//   async function toPng(data: {width: number, height: number, svg: string}) {
//     const {
//       width,
//       height,
//       svg
//     } = data
//     const canvas = new OffscreenCanvas(width, height)
//     const ctx = canvas.getContext('2d')!
//     const v = await Canvg.fromString(ctx, svg, preset)

//     // Render only first frame, ignoring animations and mouse.
//     await v.render()

//     const blob = await canvas.convertToBlob()
//     const pngUrl = URL.createObjectURL(blob)

//     return pngUrl
//   }

//   toPng({
//     width: 600,
//     height: 600,
//     svg: './example.svg'
//   }).then((pngUrl) => {
//     const img = document.querySelector('img')

//     img.src = pngUrl
//   })

const ctx: Worker = self as any;
console.log("worker load", typeof DOMParser !== 'undefined' ? 'has dom parser' : 'no dom parser')
ctx.onmessage = async function (evt) {
    console.log("worker onmessage", typeof DOMParser !== 'undefined' ? 'has dom parser' : 'no dom parser')
    const task = evt.data as WorkerArgs;
    const canvas = task.canvas as OffscreenCanvas;
    const ctx = canvas.getContext("2d")!;
    const svg = task.svg.replaceAll("#", "%23");

    // const parser = new DOMParser(); // 用不了
    // const document = parser.parseFromString(svg, 'image/svg+xml')
    // console.log(document)
    // await Canvg.fromString(ctx, svg).render(); // 用不了
    const image = canvas.transferToImageBitmap();
    postMessage({
        args: evt.data,
        image
    } as WorkerResult, [image, task.canvas]);
    // const blob = await canvas.convertToBlob();
    // const dataURL = new FileReaderSync().readAsDataURL(blob);
    // postMessage({
    //     args: evt.data,
    //     dataURL
    // } as WorkerResult);
};

export default ctx;