/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {Context} from "@/context";
import {GroupShape, Shape, ShapeView} from "@kcdesign/data";
import {is_part_of_symbolref, is_state} from "@/utils/symbol";

/**
 * @description: 输入z轴层级无序的图形列表，输出有序的图形列表
 * @param {Shape[]} shapes z轴层级无序的图形列表
 * @param {1 | -1} reverse 1 为正序，-1为逆序
 * @return {Shape[]} z轴层级有序的图形列表
 */
export function sort_by_layer(context: Context, selectedShapes: ShapeView[], reverse = 1) {
    return compare_layer_3(selectedShapes, reverse); // 方案三：按照节点路径的排序
    // return compare_layer_2(selectedShapes, reverse); // 方案二： 找共同父亲节点，在该节点下进行比较：速度取决于selectedShapes数组的长度，selectedShapes元素的深度，两个元素共同父亲子元素的长度
    // return compare_layer_1(context, selectedShapes, reverse); // 方案一：遍历，最糟糕的情况下会遍历整棵树，但通常只会遍历一小段
}

/**
 * @description: 输入z轴层级无序的图形列表，输出有序的图形列表, 采用遍历整棵数的方法，但是通常情况下，所选图形都是新建的即处于末尾的图形，所以通常只要遍历一小段就可以结束
 * @param {Shape[]} shapes z轴层级无序的图形列表
 * @return {Shape[]} z轴层级有序的图形列表
 */
function compare_layer_1(context: Context, selectedShapes: ShapeView[], reverse = 1): ShapeView[] {
    const origin_map = new Map();
    for (let i = 0; i < selectedShapes.length; i++) {
        origin_map.set(selectedShapes[i].id, selectedShapes[i]);
    }
    const sort_shapes: ShapeView[] = [];
    const page = context.selection.selectedPage;
    if (page) {
        deep(page.childs);
    }
    return sort_shapes;

    function deep(childs: ShapeView[]) {
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
 * @description: 输入z轴层级无序的图形列表，输出有序的图形列表, 采用两两图形比较，不会遍历整棵树，但是在列表比较长的情况下两两的对数比较多，消耗较大
 * @param {Shape[]} shapes z轴层级无序的图形列表
 * @param {1 | -1} reverse 1 为正序，-1为逆序
 * @return {Shape[]} z轴层级有序的图形列表
 */
function compare_layer_2(selectedShapes: Shape[], reverse = 1): Shape[] {
    return selectedShapes.sort((a, b) => {
        if (compare_layer_a_b_1(a, b)) {
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
function compare_layer_a_b_1(shape: Shape, another: Shape) {
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

/**
 * @description: 输入z轴层级无序的图形列表，输出有序的图形列表, 每个对象计算出它的路径序列如[0,1,1,3] 表示它在对象树上的根节点的第0个子节点...第1个子节点...最后排序
 * @param {Shape[]} shapes z轴层级无序的图形列表
 * @param {1 | -1} reverse 1 为正序，-1为逆序
 * @return {Shape[]} z轴层级有序的图形列表
 */
export function compare_layer_3(selectedShapes: ShapeView[], reverse = 1): ShapeView[] {
    const path_map = new Map();
    for (let i = 0; i < selectedShapes.length; i++) {
        const shape = selectedShapes[i];
        path_map.set(shape.id, get_node_path(shape));
    }
    return selectedShapes.sort((a, b) => {
        if (compare_layer_a_b_2(a, b, path_map)) {
            return reverse * -1;
        } else {
            return reverse * 1;
        }
    });
}

/**
 * @description: 比较图形shape的z轴层级是否比another高
 * @param {Shape} shape 被比较的图形
 * @param {Shape} another 比较的图形
 * @param {Map<string, number[]>} paths 所有等待比较图形的节点路径集合
 * @return {boolean} 图形shape的z轴层级较高则为真
 */
function compare_layer_a_b_2(shape: ShapeView, another: ShapeView, paths: Map<string, number[]>) {
    const path1 = paths.get(shape.id);
    const path2 = paths.get(another.id);
    if (!path1 || !path2) return false;

    const len = Math.min(path1.length, path2.length);
    for (let i = 0; i < len; i++) {
        if (path1[i] === path2[i]) {
            if (path1[i + 1] === path2[i + 1]) {
                continue;
            } else if (path1[i + 1] > path2[i + 1]) {
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
}

/**
 * @description: 获取图形shape的路径序列
 * @param {Shape} shape
 * @return {number[]} 图形shape的路径序列
 */
function get_node_path(shape: ShapeView): number[] {
    const path: number[] = [];
    let self = shape;
    let p = self.parent;
    while (p) {
        const childs = (p).childs;
        for (let i = childs.length - 1; i > -1; i--) { // 从后面往前找更快，因为大多数情况下操作的是新生成的图形，即index靠近length的图形
            if (childs[i].id === self.id) {
                path.unshift(i);
                break;
            }
        }
        self = p!;
        p = self.parent;
    }
    path.unshift(0);
    return path;
}

export function filter_for_group1(shapes: ShapeView[]) {
    const result: ShapeView[] = [];
    for (let i = 0, l = shapes.length; i < l; i++) {
        const item = shapes[i];
        if (is_part_of_symbolref(item) || is_state(item)) continue;
        result.push(item);
    }
    return result;
}