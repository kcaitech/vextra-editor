import { Shape } from "@kcdesign/data/data/shape";
import { CanvasKitScout } from "./scout_beta";
import { Scout } from "./scout";
// 蜻蜓队长：用于比较两个方案性能强弱
function compare(canvaskitScout: CanvasKitScout, scout: Scout) {
    const size = 10000;
    let alphaStart: number = 0;
    let alphaEnd: number = 0;
    let betaStart: number = 0;
    let betaEnd: number = 0;
    let stepA: boolean = false;
    let stepB: boolean = false;
    const load: Shape[] = [];

    function loading(bullet: Shape[]) {
        for (let i = 0; i < size; i++) {
            bullet.forEach(b => {
               load.push(b);
            })
        }
        console.log('loaded');
    }

    function firstExecute() {
        alphaStart = Date.now();
        for (let i = 0; i < 500; i++) {
            alphaFn(load, canvaskitScout);
        }
        alphaEnd = Date.now();
        stepA = true;
        console.log('alpha finish');
    }
    function lastExecute() {
        if (!stepA) return;
        betaStart = Date.now();
        for (let i = 0; i < 500; i++) {
            betaFn(load, scout)
        }
        betaEnd = Date.now();
        stepB = true;
        console.log('beta finish');
    }
    function result() {
        if (stepA && stepB) {
            const a = alphaEnd - alphaStart;
            const b = betaEnd - betaStart;
            console.log('对50000个图层进行500次比对， 结果');
            console.log(`canvaskit方案用时：${a}ms, ${a / 1000}s`);
            console.log(`SVGGeometryElement方案用时：${b}ms, ${b / 1000}s`);
        } else {
            console.log('让子弹飞一会儿！');
        }
    }
    return { loading, firstExecute, lastExecute, result }
}

function alphaFn(load: Shape[], canvaskitScout: CanvasKitScout) {
    const shapes: Shape[] = [];
    for (let i = 0; i < load.length; i++) {
        const item = load[i];
        const path = item.getPath(true);
        const m2page = item.matrix2Page();
        path.transform(m2page);
        const d = path.toString();
        // if (i === load.length - 5) {
        //     console.log('last 5', d);
        // }
        if (canvaskitScout.isPointInShape(d, { x: 100, y: 100 })) {
            shapes.push(item);
        }
    }
}
function betaFn(load: Shape[], scout: Scout) {
    const shapes: Shape[] = [];
    for (let i = 0; i < load.length; i++) {
        const item = load[i];
        const path = item.getPath(true);
        const m2page = item.matrix2Page();
        path.transform(m2page);
        const d = path.toString();
        // if (i === load.length - 5) {
        //     console.log('last 5', d);
        // }
        if (scout.isPointInShape(d, { x: 100, y: 100 })) {
            shapes.push(item);
        }
    }
}

export { compare }