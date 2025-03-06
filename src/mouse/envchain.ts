/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ShapeView, ShapeType, GroupShapeView } from "@kcdesign/data";
import { debounce } from "lodash";

export type EnvChain = {
    base: ShapeView | undefined;
    children: EnvChain[];
}

/**
 * @description 链式穿透：存在深层选区时，选区附近以及上层的元素需要暴露出去来完成穿透选择。
 * 在此之前，是通过将所有附近以及上层的元素平铺到最上层完成暴露，这样会破坏层级之间的权重关系，
 * 表现为上层元素权重被相对地降低无法被优先选中、附近以及上层的元素权重提高使得其在被容器裁剪
 * 的情况下也能被优先选中。链式穿透在尊重层级之间的权重关系的前提下以线代替面，得到了更好的性
 * 能，是更好的穿透方案。
 */
export class EnvChainGenerator {
    private m_chain: Map<string, EnvChain>;

    constructor() {
        this.m_chain = new Map<string, EnvChain>();
    }

    private updateChain(selected: ShapeView[]) {
        this.m_chain.clear();
        if (!selected.length) return;
        const chains = new Map<string, EnvChain>();
        const deepMap = new Map<string, number>();
        const porter = new Set<ShapeView>();
        for (const view of selected) {
            if (view.parent!.type === ShapeType.Page) continue;
            let deep = 0;
            let chain: EnvChain = {
                children: [],
                base: undefined
            }
            let parent: GroupShapeView | undefined = view.parent as GroupShapeView;
            while (parent) {
                deep++;
                porter.add(parent);
                const bros = parent.childs;
                for (let l = bros.length - 1; l >= 0; l--) {
                    const v = bros[l];
                    if (!v.isVisible || v.isLocked) continue;
                    if ((v.type === ShapeType.Group || v.type === ShapeType.BoolShape) && porter.has(v)) continue;
                    chain.children.push({ base: v, children: [] });
                }

                if (parent.isContainer) {
                    const type = parent.parent?.parent?.type || parent.parent?.type;
                    if (type !== ShapeType.Page) {
                        chain["base"] = parent;
                        chain = Object.assign({}, { children: [chain], base: undefined });
                    }
                }
                if (parent.parent?.type === ShapeType.Page) break;
                if (parent.parent?.isContainer && parent.parent.parent?.type === ShapeType.Page) break;
                parent = parent.parent as GroupShapeView;
            }
            const existChain = deepMap.get(parent.id);
            if (!existChain || existChain < deep) {
                chains.set(parent.id, chain);
                deepMap.set(parent.id, deep);
            }
        }
        this.m_chain = chains;
    }

    get chains() {
        return this.m_chain;
    }

    gen = debounce(this.updateChain.bind(this), 200);
}