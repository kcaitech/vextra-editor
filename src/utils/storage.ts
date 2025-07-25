/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

// import { IStorage } from "@kcaitech/vextra-core"

// export type StorageOptions = {
//     endPoint: string
//     region: string
//     accessKey: string
//     secretKey: string
//     sessionToken?: string | undefined
//     bucketName: string
// }

// import AWS from "aws-sdk"

// AWS.config.correctClockSkew = true

// export class S3Storage implements IStorage {
//     private client: AWS.S3
//     private options: StorageOptions

//     constructor(options: StorageOptions) {
//         this.client = new AWS.S3({
//             endpoint: options.endPoint,
//             region: options.region,
//             signatureVersion: "v4",
//             credentials: {
//                 accessKeyId: options.accessKey,
//                 secretAccessKey: options.secretKey,
//                 sessionToken: options.sessionToken,
//             },
//             s3ForcePathStyle: true,
//             sslEnabled: false,
//             correctClockSkew: true,
//         })
//         this.options = options
//     }

//     public get(uri: string, versionId?: string): Promise<Uint8Array> {
//         return new Promise<Uint8Array>((resolve, reject) => {
//             this.client.getObject({
//                 Bucket: this.options.bucketName,
//                 Key: uri,
//                 VersionId: versionId,
//             }, (err, data) => {
//                 if (err) {
//                     reject(err)
//                     return
//                 }
//                 resolve(data.Body as Uint8Array)
//             })
//         })
//     }

//     // 将二进制数据上传到指定的路径
//     public put(uri: string, data: Uint8Array, contentType: string = "application/json"): Promise<void> {
//         return new Promise<void>((resolve, reject) => {
//             this.client.putObject({
//                 Bucket: this.options.bucketName,
//                 Key: uri,
//                 Body: data,
//                 ContentType: contentType,
//             }, (err, data) => {
//                 if (err) {
//                     reject(err)
//                     return
//                 }
//                 resolve()
//             })
//         })
//     }
// }

// import OSS from "ali-oss"

// export class OssStorage implements IStorage {
//     private client: OSS
//     private options: StorageOptions

//     constructor(options: StorageOptions) {
//         this.client = new OSS({
//             endpoint: options.endPoint,
//             region: options.region,
//             accessKeyId: options.accessKey,
//             accessKeySecret: options.secretKey,
//             stsToken: options.sessionToken,
//             bucket: options.bucketName,
//             secure: false,
//             internal: true,
//             cname: true,
//         })
//         this.options = options
//     }

//     private async _get(uri: string, versionId?: string): Promise<Uint8Array> {
//         const result = await this.client.get(uri, {
//             versionId: versionId,
//         })
//         if (result.res.status !== 200) {
//             throw new Error(`${uri} 请求失败 status:${result.res.status}`)
//         } else if (!(result.content instanceof Uint8Array)) {
//             throw new Error(`${uri} 数据类型错误 content:${typeof result.content}`)
//         }
//         return result.content
//     }

//     public async get(uri: string, versionId?: string): Promise<Uint8Array> {
//         try {
//             return await this._get(uri, versionId)
//         } catch (err) {
//             return await this._get(uri)
//         }
//     }

//     // 将二进制数据上传到指定的路径
//     public async put(uri: string, data: Uint8Array, contentType: string = "application/json"): Promise<void> {
//         await this.client.put(uri, Buffer.from(data), { headers: { "Content-Type": contentType } })
//     }
// }
