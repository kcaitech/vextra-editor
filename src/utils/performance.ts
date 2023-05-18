// 蜻蜓队长：用于比较两个方案性能强弱，开发阶段使用
// import { Shape } from "@kcdesign/data/data/shape";
// import { CanvasKitScout } from "./scout_beta";
// import { Scout } from "./scout";
// function compare(canvaskitScout: CanvasKitScout, scout: Scout) {
//     const size = 10;
//     let alphaStart: number = 0;
//     let alphaEnd: number = 0;
//     let betaStart: number = 0;
//     let betaEnd: number = 0;
//     let stepA: boolean = false;
//     let stepB: boolean = false;
//     const load: Shape[] = [];

//     function loading(bullet: Shape[]) {
//         for (let i = 0; i < size; i++) {
//             bullet.forEach(b => {
//                 load.push(b);
//             })
//         }
//         return 'loaded';
//     }

//     function firstExecute() {
//         alphaStart = Date.now();
//         for (let i = 0; i < 500; i++) {
//             betaFn(load, scout);
//         }
//         alphaEnd = Date.now();
//         stepA = true;
//         return 'finish';
//     }
//     function lastExecute() {
//         if (!stepA) return;
//         betaStart = Date.now();
//         for (let i = 0; i < 500; i++) {
//             alphaFn(load, canvaskitScout);
//         }
//         betaEnd = Date.now();
//         stepB = true;
//         return 'finish';
//     }
//     function result() {
//         if (stepA && stepB) {
//             const a = alphaEnd - alphaStart;
//             const b = betaEnd - betaStart;
//             console.log('====');
//             console.log('对50个图层进行500次比对， 结果');
//             console.log(`SVGGeometryElement方案用时：${a}ms, ${a / 1000}s`);
//             console.log(`canvaskit方案用时：${b}ms, ${b / 1000}s`);
//         } else {
//             console.log('让子弹飞一会儿！');
//         }
//         return '====='
//     }
//     function auto() { // after loaded
//         firstExecute();
//         lastExecute();
//         result();
//     }

//     return { loading, firstExecute, lastExecute, result, auto }
// }

// function alphaFn(load: Shape[], canvaskitScout: CanvasKitScout) {
//     const shapes: Shape[] = [];
//     for (let i = 0; i < load.length; i++) {
//         const item = load[i];
//         const path = item.getPath(true);
//         const m2page = item.matrix2Page();
//         path.transform(m2page);
//         const d = path.toString();
//         // console.log('judge');
//         if (canvaskitScout.isPointInShape(d, { x: 100, y: 100 })) {
//             shapes.push(item);
//         }
//     }
// }
// function betaFn(load: Shape[], scout: Scout) {
//     const shapes: Shape[] = [];
//     for (let i = 0; i < load.length; i++) {
//         const item = load[i];
//         // console.log('judge');
//         if (scout.isPointInShape(load[i], { x: 100, y: 100 })) {
//             shapes.push(item);
//         }
//     }
// }

// export { compare }
// // log：canvaskitScout、scout
// // 5个图形，分别比对500次
// // c   s  ms
// // 51  69
// // 44  64
// // 47  56
// // 49  69
// // 54  57
// // 51  71
// // 41  64
// // 56  45 !
// // 51  57
// // 61  48 !
// // 53  55
// // 61  53