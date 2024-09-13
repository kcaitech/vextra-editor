import { Context } from "@/context";

//todo 边框数据管理器

interface BorderData {
    index: number; // 在borders数组中index

}

export class BorderDataManager {
    private m_context: Context;

    constructor(context: Context) {
        this.m_context = context;
    }

    update() {}
}