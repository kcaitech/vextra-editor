import { ICoopNet, IStorage } from '@kcdesign/data'
import { ICommunication } from './communication'

export * from './communication'
export * from './plugins'

export type DocumentProps = (
    { source: 'storage', storage: IStorage, path: string, fid: string, versionId: string } |
    { source: 'file', file: File, fmt: 'sketch' | 'fig' } |
    { source: 'new' }) &
{ coop?: ICoopNet } &
{ communication?: ICommunication } &
{ readonly?: boolean }