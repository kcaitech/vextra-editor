import { IScout } from "./scout";

export * from "./scout"

export interface IToolBox {
    get scout(): IScout;
}