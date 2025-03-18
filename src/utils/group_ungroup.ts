/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import {Context} from "@/context";
import { ArtboardView, assign, GroupShapeView, Shape, ShapeType, ShapeView } from "@kcdesign/data";
import {is_part_of_symbolref, is_state} from "@/utils/symbol";
import { getName } from "@/utils/content";

/**
 * @description: 输入z轴层级无序的图形列表，输出有序的图形列表
 * @param {Shape[]} shapes z轴层级无序的图形列表
 * @param {1 | -1} reverse 1 为正序，-1为逆序
 * @return {Shape[]} z轴层级有序的图形列表
 */
export function sort_by_layer(context: Context, selectedShapes: ShapeView[], reverse = 1) {
    return compare_layer_3(selectedShapes, reverse);
}

/**
 * @description: 输入z轴层级无序的图形列表，输出有序的图形列表, 每个对象计算出它的路径序列如[0,1,1,3] 表示它在对象树上的根节点的第0个子节点...第1个子节点...最后排序
 * @param {ShapeView[]} selectedShapes z轴层级无序的图形列表
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
            return reverse;
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

export function group(context: Context, views: ShapeView[], name: string, artboard?: boolean) {
    let validViews = views.filter(v => !v.isVirtualShape);
    if (validViews.length === 0) return;
    validViews = compare_layer_3(validViews);
    const page = context.editor4Page(context.selection.selectedPage!);
    if (artboard) {
        page.createArtboard(views, name);
    } else {
        page.group(validViews, name);
    }
}

export function ungroup(context: Context) {
    const selection = context.selection;
    const shapes = selection.selectedShapes;
    if (!shapes.length) return;
    const groups = shapes.filter(i => (i.type === ShapeType.Group || i.type === ShapeType.BoolShape));
    const boards = shapes.filter(i => i.type === ShapeType.Artboard);
    const page = selection.selectedPage!;
    const editor = context.editor4Page(page);
    if (boards.length) editor.dissolution_artboard(boards as ArtboardView[]);
    if (groups.length) editor.ungroup(groups as GroupShapeView[]);
}