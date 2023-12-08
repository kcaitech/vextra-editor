import { GroupShape, Matrix, Path, RenderTransform, ResizingConstraints, Shape, ShapeFrame, ShapeType, innerShadowId, renderBorders, renderFills, renderShadows } from "@kcdesign/data";
import { ShapeDom } from "./shape";
// import comsMap from "./comsmap";
import { boundingBox, fixFrameByConstrain, isDiffRenderTransform, isDiffVarsContainer, isNoTransform, matrix2parent } from "./shape";
import { PropsType, VDom, VarsContainer } from "./basic";
import { EL, elh, elpatch } from "./el";

export class GroupShapeDom extends ShapeDom {

    onCreate(): void {
        // build childs
        // todo
        (this.m_data as GroupShape).childs.forEach((c) => {
            const comsMap = this.m_ctx.comsMap;
            const Com = comsMap.get(c.type) || comsMap.get(ShapeType.Rectangle)!;
            const props = {data: c};
            const ins = new Com(this.m_ctx, props);
            ins.update(props, true);
            this.addChild(ins);
        });
    }

    renderChilds(): VDom[] {
        const childs = this.m_children;
        const ret: VDom[] = [];
        childs.forEach((c) => {
            const r = c.render();
            if (r) ret.push(c);
        })
        return ret;
    }


    updateChild(child: Shape, idx: number, transx: RenderTransform, varsContainer: VarsContainer, resue: Map<string, VDom>) {
        let cdom: VDom | undefined = resue.get(child.id);
        const props = {data: child, transx, varsContainer};
        if (!cdom) {
            const comsMap = this.m_ctx.comsMap;
            const Com = comsMap.get(child.type) || comsMap.get(ShapeType.Rectangle)!;
            cdom = new Com(this.m_ctx, props);
            cdom.update(props, true);
            this.addChild(cdom, idx);
            return;
        }
        this.moveChild(cdom, idx);
        cdom.update(props);
    }

    updateRectangle(scaleX: number, scaleY: number): void {
        const shape = this.m_data;
        const resue: Map<string, VDom> = new Map();
        this.m_children.forEach((c) => resue.set(c.data().id, c));
        for (let i = 0, len = shape.childs.length; i < len; i++) {
            const cc = shape.childs[i]
            const transform = {
                dx: 0,
                dy: 0,
                scaleX,
                scaleY,
                parentFrame: this.m_frame,
                vflip: false,
                hflip: false,
                rotate: 0
            }
            // update childs
            this.updateChild(cc, i, transform, this.m_varsContainer!, resue);
        }
        // 删除多余的
        this.removeChilds(shape.childs.length, Number.MAX_VALUE).forEach((c => c.destory()));
    }

    updateDiamond(scaleX: number, scaleY: number, rotate: number, vflip: boolean, hflip: boolean, bbox: ShapeFrame, m: Matrix): void {
        const shape = this.m_data;
        const resue: Map<string, VDom> = new Map();
        this.m_children.forEach((c) => resue.set(c.data().id, c));
        for (let i = 0, len = shape.childs.length; i < len; i++) { //摆正： 将旋转、翻转放入到子对象
            const cc = shape.childs[i]
            const m1 = cc.matrix2Parent();
            m1.multiAtLeft(m);
            const target = m1.computeCoord(0, 0);
            const c_rotate = rotate + (cc.rotation || 0);
            const c_hflip = hflip ? !cc.isFlippedHorizontal : !!cc.isFlippedHorizontal;
            const c_vflip = vflip ? !cc.isFlippedVertical : !!cc.isFlippedVertical;
            const c_frame = cc.frame;
            // cc matrix2Parent
            const m2 = matrix2parent(c_frame.x, c_frame.y, c_frame.width, c_frame.height, c_rotate, c_hflip, c_vflip);
            m2.trans(bbox.x, bbox.y); // todo 使用parentFrame.x y会与rect对不齐，待研究
            const cur = m2.computeCoord(0, 0);
            const dx = target.x - cur.x;
            const dy = target.y - cur.y;
            const transform = {
                dx,
                dy,
                scaleX,
                scaleY,
                parentFrame: this.m_frame,
                vflip,
                hflip,
                rotate
            }
            // update childs
            this.updateChild(cc, i, transform, this.m_varsContainer!, resue);
        }
        // 删除多余的
        this.removeChilds(shape.childs.length, Number.MAX_VALUE).forEach((c => c.destory()));
    }

}