import { IEventEmitter } from "@kcdesign/data";
import { IScout } from "./scout";

export * from "./scout"

export interface IToolBox {
    get scout(): IScout;
    // get storage(): Map<string, any>;
    get event(): IEventEmitter;
}