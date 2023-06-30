import { Context } from "@/context";
import { GroupShape, Shape } from "@kcdesign/data";

/**
* @description: 输入z轴层级无序的图形列表，输出有序的图形列表
* @param {Shape[]} shapes z轴层级无序的图形列表
* @param {boolean} reverse 逆序
* @return {Shape[]} z轴层级有序的图形列表
*/
export function sort_by_layer(context: Context, selectedShapes: Shape[], reverse = 1) {
    if (selectedShapes.length < 10) {
        return compare_layer_2(selectedShapes, reverse); // 速度取决于selectedShapes数组的长度，selectedShapes元素的深度，两个元素共同父亲子元素的长度
    } else {
        return compare_layer_1(context, selectedShapes, reverse); // 最糟糕的情况下会遍历整棵树，但是通常只会遍历一小段
    }
}

/**
* @description: 输入z轴层级无序的图形列表，输出有序的图形列表, 采用遍历整棵数的方法，但是通常情况下，所选图形都是末尾的图形，所以通常只要遍历一小段就可以结束
* @param {Shape[]} shapes z轴层级无序的图形列表
* @return {Shape[]} z轴层级有序的图形列表
*/
function compare_layer_1(context: Context, selectedShapes: Shape[], reverse = 1): Shape[] {
    const origin_map = new Map();
    for (let i = 0; i < selectedShapes.length; i++) {
        origin_map.set(selectedShapes[i].id, selectedShapes[i]);
    }
    const sort_shapes: Shape[] = [];
    const page = context.selection.selectedPage;
    if (page) {
        deep(page.childs);
    }
    return sort_shapes;

    function deep(childs: Shape[]) {
        for (let i = childs.length - 1; i > -1; i--) {
            const shape = childs[i];
            if (origin_map.get(shape.id)) {
                if (reverse < 0) {
                    sort_shapes.unshift(shape);
                } else {
                    sort_shapes.push(shape);
                }
                if (sort_shapes.length === origin_map.size) return;
            }
            if (shape.childs && shape.childs.length) {
                deep(shape.childs);
            }
        }
    }
}

/**
* @description: 输入z轴层级无序的图形列表，输出有序的图形列表, 采用两两图形比较，不会遍历整棵树，但是在列表比较长的情况下会两两的对数比较多，消耗较大
* @param {Shape[]} shapes z轴层级无序的图形列表
* @return {Shape[]} z轴层级有序的图形列表
*/
function compare_layer_2(selectedShapes: Shape[], reverse = 1): Shape[] {
    return selectedShapes.sort((a, b) => {
        if (compare_layer_a_b(a, b)) {
            return reverse * 1;
        } else {
            return reverse * -1;
        }
    })
}

/**
* @description: 比较图形shape的z轴层级是否比another高
* @param {Shape} shape 被比较的图形
* @param {Shape} another 比较的图形 
* @return {boolean} 图形shape的z轴层级较高则为真
*/
function compare_layer_a_b(shape: Shape, another: Shape) {
    const shape_parents_id = new Map();
    let self = shape;
    let s_p = self.parent;
    while (s_p) {
        shape_parents_id.set(s_p.id, self);
        self = s_p;
        s_p = s_p.parent;
    }

    let bro: Shape | undefined = undefined;

    let a_self = another;
    let a_p = a_self.parent;
    let count = 1;
    while (a_p && !bro && count < 1000) {
        const s_p = shape_parents_id.get(a_p!.id)
        if (s_p) {
            bro = s_p
        } else {
            a_self = a_p;
            a_p = a_self.parent;
        }
        count++;
    }

    const childs = (a_p as GroupShape).childs;
    let first: Shape | undefined = undefined;
    for (let i = childs.length - 1; i > -1; i--) {
        if (childs[i].id === bro?.id || childs[i].id === a_self.id) {
            first = childs[i];
            break;
        }
    }
    return first?.id !== bro?.id;
}