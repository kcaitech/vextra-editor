import { ICoopNet } from "@kcdesign/data";

export interface INet extends ICoopNet {

    upload(name: string, data: ArrayBuffer): Promise<boolean>
}