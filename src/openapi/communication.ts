// type getTokenFuncAsync = () => Promise<string>
// type StartOptions = {
//     last_time?: number
// }

export interface IDocResourceUpload {
    // start(getToken: getTokenFuncAsync, documentId: string, options?: StartOptions): Promise<boolean>
    upload(name: string, data: ArrayBuffer): Promise<boolean>
    // close(): void
}

export interface ICommentUpload {

}

export interface ICommunication {

    docResourceUpload: IDocResourceUpload
}