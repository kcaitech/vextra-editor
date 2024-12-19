import { Context } from "@/context";
import {
    BasicArray,
    Border,
    Color,
    ColVector3D,
    Fill,
    FillMask,
    makeMatrixByTransform2,
    makeShapeTransform2By1,
    Matrix2,
    NumberArray2D,
    Shadow,
    ShapeView, SymbolView,
    Transform
} from "@kcdesign/data";
import { isShapeOut } from "@/utils/assist";
import { cursorAngle } from "@/components/Document/Selection/common";
import { markRaw } from "vue";
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";

export interface Mask {
    id: string;
    name: string;
    description: string;
    sheet: string;
    fills?: BasicArray<Fill>;
    shadows?: BasicArray<Shadow>
}

export interface Lib {
    id: string;
    name: string;
    description: string;
    sheet: string;
    fills?: BasicArray<Fill>
}


export class FillRenderer {
    private readonly m_context: Context;
    private readonly m_list: Mask[];
    private readonly m_list_lib: StyleSheet[];

    constructor(context: Context, List: StyleSheet[], mask: Mask[]) {
        this.m_context = context;
        this.m_list_lib = List;
        this.m_list = mask
    }

    private getfillmask(v: FillMask) {
        const titleCtx: Mask = {
            id: v.id,
            name: v.name,
            description: v.description,
            sheet: v.sheet,
            fills: v.fills
        };
        this.m_list.push(titleCtx);
    }

    // private getshadowmask(v: ShadowMask) {
    //     const titleCtx: Mask = {
    //         id: v.id,
    //         name: v.name,
    //         description: v.description,
    //         sheet: v.sheet, 
    //         shadows: v.shadows
    //     };
    //     this.m_list.push(titleCtx);
    // }


    currentTarget(mask: string) {
        return this.m_list.find(f => f.id === mask)
    }

    updateUnderRootContainerMap() {

        this.m_list_lib.length = 0;
        this.m_list.length = 0;

        const ctx = this.m_context;
        const lib = ctx.data.stylelib
        if (!lib) return
        this.m_list_lib.push(...lib)
        const sheet = lib.find(s => s.id === ctx.data.id)
        if (!sheet) return
        sheet.variables.forEach(s => {
            if (s instanceof FillMask) {
                this.getfillmask(s)
            }
            // if (s instanceof ShadowMask) {
            //     this.getshadowmask(s)
            // }
        })

    }

    searchstyle(filter: string, value: string) {

    }
}