import { IStorage } from '@kcdesign/data'

export * from './plugins'
export * from "./context"
export * from "./net"
export * from "./selection"
export * from "./workspace"

export type DocumentProps = (
    { source: 'storage', storage: IStorage, path: string, fid: string, versionId: string } |
    { source: 'file', file: File, fmt: 'sketch' | 'fig' } |
    { source: 'new' }) &
// { coop?: ICoopNet } & // 通过CoopRepo设置
// { communication?: ICommunication } &
{ readonly?: boolean }