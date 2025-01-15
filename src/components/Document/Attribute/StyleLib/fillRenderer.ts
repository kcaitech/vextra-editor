import { Context } from "@/context";
import {
    BasicArray,
    Blur,
    BlurMask,
    Color,
    Fill,
    FillMask,
    Shadow,
    ShadowMask,
    ShadowPosition,
    BorderMask,
    BorderMaskType,
} from "@kcdesign/data";
import { StyleSheet } from "@kcdesign/data/dist/types/data/typesdefine";

export interface Mask {
    id: string;
    name: string;
    description: string;
    sheet: string;
    fills?: BasicArray<Fill>;
    shadows?: BasicArray<Shadow>
    blur?: Blur;
    border?:BorderMaskType
}

export interface ShadowItem {
    id: number,
    shadow: Shadow
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

    private getshadowmask(v: ShadowMask) {
        const titleCtx: Mask = {
            id: v.id,
            name: v.name,
            description: v.description,
            sheet: v.sheet,
            shadows: v.shadows
        };
        this.m_list.push(titleCtx);
    }

    private getblurmask(v: BlurMask) {
        const titleCtx: Mask = {
            id: v.id,
            name: v.name,
            description: v.description,
            sheet: v.sheet,
            blur: v.blur
        };
        this.m_list.push(titleCtx);
    }

    private getbordermask(v:BorderMask){
        const titleCtx: Mask = {
            id: v.id,
            name: v.name,
            description: v.description,
            sheet: v.sheet,
            border: v.border
        };
        this.m_list.push(titleCtx);
    }


    currentTarget(mask: string) {
        return this.m_list.find(f => f.id === mask)
    }

    updateUnderRootContainerMap(type: string) {

        this.m_list_lib.length = 0;
        this.m_list.length = 0;

        const ctx = this.m_context;
        const lib = ctx.data.stylelib
        if (!lib) return
        const sheet = lib.find(s => s.id === ctx.data.id)

        let arr: StyleSheet[] = lib.map((s, i) => {
            let newSheet: StyleSheet = { ...s }; // 创建 s 的浅拷贝
            if (type === 'fill') {
                newSheet.variables = s.variables.filter(v => v instanceof FillMask); // 只保留 FillMask 实例
            }
            if (type === 'shadow') {
                newSheet.variables = s.variables.filter(v => v instanceof ShadowMask); // 只保留 ShadowMask 实例
            }
            if (type === 'blur') {
                newSheet.variables = s.variables.filter(v => v instanceof BlurMask); // 只保留 BlurMask 实例
            }
            if(type==='border'){
                newSheet.variables = s.variables.filter(v => v instanceof BorderMask); // 只保留 Border 实例
            }
            return newSheet;
        });
        this.m_list_lib.push(...arr);
        if (!sheet) return
        sheet.variables.forEach(s => {
            if (type === 'fill') {
                if (s instanceof FillMask) {
                    this.getfillmask(s)
                }
            }
            if (type === 'shadow') {
                if (s instanceof ShadowMask) {
                    this.getshadowmask(s)
                }
            }
            if (type === 'blur') {
                if (s instanceof BlurMask) {
                    this.getblurmask(s)
                }
            }
            if(type==='border'){
                if (s instanceof BorderMask) {
                    this.getbordermask(s)
                }
            }
        })
    }
}

export class EditorAtt {
    private readonly m_list: ShadowItem[];

    constructor(List: ShadowItem[]) {
        this.m_list = List;
    }

    OffsetX(index: number, value: number) {
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.offsetX = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

    OffsetY(index: number, value: number) {
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.offsetY = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

    setBlurRadius(index: number, value: number) {
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.blurRadius = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

    setSpread(index: number, value: number) {
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.spread = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

    setColor(index: number, value: Color) {
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.color = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

    setPosition(index: number, value: ShadowPosition) {
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.position = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

    setIsEnabled(index: number, value: boolean){
        const arr = [...this.m_list]
        const _shadow = { ...arr[index].shadow };
        _shadow.isEnabled = value;
        arr[index].shadow = _shadow as Shadow
        this.m_list.length = 0;
        this.m_list.push(...arr)
    }

}