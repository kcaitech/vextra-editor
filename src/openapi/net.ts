import { ICoopNet } from "@kcdesign/data";

export interface INet extends ICoopNet {

    upload(name: string, data: ArrayBufferLike): Promise<boolean>
}