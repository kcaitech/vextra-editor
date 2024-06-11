import { Context } from "@/context";
import { CoopRepository, DocEditor, Repository, createDocument } from "@kcdesign/data";
// import { ResponseStatus } from "@/communication/modules/doc_upload";
import { Document } from "@kcdesign/data";
// import * as user_api from '@/request/users'
import { message } from "@/utils/message";
// import kcdesk from "@/kcdesk";

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
  // if (kcdesk) {
  //   kcdesk.fileOpen(doc_id, filename, "");
  // } else {
  //   const url = `${window.location.href.split('?')[0]}?id=${doc_id}`;
  //   window.open(url);
  // }
  return true;
}
async function upload_file(context: Context, data: Document) {
  const getToken = () => Promise.resolve(localStorage.getItem("token") || "");
  if (!await getToken()) return false;
  // if (!await context.communication.docUpload.start(getToken, '')) {
  //   // todo 上传通道开启失败处理
  //   return false;
  // }
  // let result;
  // try {
  //   result = await context.communication.docUpload.upload(data);
  // } catch (e) {
  //   // todo 上传失败处理√
  //   message('danger', '资源上传失败');
  //   return false;
  // }
  // if (!result || result.status !== ResponseStatus.Success || !result.data?.doc_id || typeof result.data?.doc_id !== "string") {
  //   // todo 上传失败处理√
  //   message('danger', '资源上传失败');
  //   return false;
  // }
  // return result!.data.doc_id;
}

export async function copy_file(id: string) {
  // const { code, data } = await user_api.Copyfile({ doc_id: id });
  // const doc_id = data?.document?.id;
  // if (code !== 0 || !doc_id) return false;

  // if (kcdesk) {
  //   kcdesk.fileOpen(doc_id, data.document.name, "");
  // } else {
  //   const url = `${window.location.href.split('?')[0]}?id=${doc_id}`;
  //   window.open(url);
  // }
  return true;
}