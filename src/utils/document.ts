import { Context } from "@/context";
import { CoopRepository, DocEditor, Repository, createDocument } from "@kcdesign/data";
import { ResponseStatus } from "@/communication/modules/doc_upload";
import { Document } from "@kcdesign/data";
import * as user_api from '@/apis/users'

/**
 * @description 文档内创建一个新的文档，并在跳转新标签页之后打开新文档
 * @param filename 文档名称
 * @param pagename 初始化页面名称
 */
export async function new_file(context: Context, filename: string, pagename: string) {
  const repo = new Repository();
  const nd = createDocument(filename, repo);
  const coopRepo = new CoopRepository(nd, repo);
  const editor = new DocEditor(nd, coopRepo);
  const page = editor.create(pagename);
  editor.insert(0, page);
  const doc_id = await upload_file(context, nd);
  if (!doc_id) return false;
  const url = `${window.location.href.split('?')[0]}?id=${doc_id}`;
  window.open(url);
}
export async function upload_file(context: Context, data: Document) {
  const token = localStorage.getItem("token");
  if (!token) return false;
  if (!await context.communication.docUpload.start(token, '')) {
    // todo 上传通道开启失败处理
    return false;
  }
  let result;
  try {
    result = await context.communication.docUpload.upload(data);
  } catch (e) {
    // todo 上传失败处理
    return false;
  }
  if (!result || result.status !== ResponseStatus.Success || !result.data?.doc_id || typeof result.data?.doc_id !== "string") {
    // todo 上传失败处理
    return false;
  }
  return result!.data.doc_id;
}

export async function copy_file(id: string) {
  const { code } = await user_api.Copyfile({ doc_id: id })

}