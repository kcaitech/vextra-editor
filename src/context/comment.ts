import { Shape, Watchable } from "@kcdesign/data";
import { DocInfo, UserInfo } from "./user";

export class Comment extends Watchable(Object) {
  static SHUTDOWN_COMMENT = 1;
  static SELECT_LIST_TAB = 2;
  static SEND_COMMENT = 3;
  static EDIT_COMMENT = 4;
  static HOVER_COMMENT = 5;
  static COMMENT_POPUP = 6;
  static UPDATE_COMMENT = 7;
  static OPACITY_COMMENT = 8;
  static CURRENT_COMMENT = 9;
  static SELECTE_COMMENT = 10;
  static UPDATE_PAGE_COMMENT = 11;
  static COMMENT_ALL = 12;
  static UPDATE_COMMENT_POS = 13;
  static SHOW_COMMENT_POPUP = 14;
  static COMMENT_HANDLE_INPUT = 15;
  static VISIBLE_COMMENT = 16;
  static TOGGLE_COMMENT_PAGE = 17;
  static HOVER_SHOW_COMMENT = 18;
  static UPDATE_COMMENT_CHILD = 19;

  private m_document_perm: number = 3;
  private m_comment_input: boolean = false;
  private m_document_info: DocInfo | undefined;
  private m_comment_list: any[] = []; // 当前文档评论
  private m_page_comment_list: any[] = []; // 当前页面评论
  private m_comment_move: boolean = false; //是否拖动评论，解决hove评论拖动时的闪烁问题
  private m_hove_commetn: boolean = false; //是否hover评论
  private m_comment_mount: boolean = false;//评论弹层的显示
  private m_comment_opacity: boolean = false;//评论弹层显示时其他评论置灰
  private m_hover_comment_id: string | undefined; //hover中的评论id
  private m_select_comment_id: string | undefined; //选中的评论id
  private m_shape_comment: boolean = false; //是否在编辑shape上的评论（移动shape修改评论位置）
  private m_comment_shape: Shape[] = [] //保存移动shape上有评论的shape
  private m_not2tree_comment: any = [] //没有转树的评论列表
  private m_comment_visible: boolean = true; //是否显示评论
  constructor() {
    super();
  }
  get documentPerm() {
    return this.m_document_perm;
  }
  get isUserInfo() {
    return this.m_user_info;
  }
  get isCommentInput() {
    return this.m_comment_input;
  }
  get commentList() {
    return this.m_comment_list;
  }
  get isCommentMove() {
    return this.m_comment_move;
  }
  get isHoverComment() {
    return this.m_hove_commetn;
  }
  get isCommentMount() {
    return this.m_comment_mount;
  }
  get pageCommentList() {
    return this.m_page_comment_list;
  }
  get isCommentOpacity() {
    return this.m_comment_opacity;
  }
  get isHoverCommentId() {
    return this.m_hover_comment_id;
  }
  get isSelectCommentId() {
    return this.m_select_comment_id;
  }
  get isEditShapeComment() {
    return this.m_shape_comment;
  }
  get commentShape() {
    return this.m_comment_shape;
  }
  get not2treeComment() {
    return this.m_not2tree_comment;
  }
  get isDocumentInfo() {
    return this.m_document_info;
  }
  get isVisibleComment() {
    return this.m_comment_visible;
  }
  setDocumentPerm(perm: number) {
    this.m_document_perm = perm;
  }
  showCommentPopup(index: number, e: MouseEvent) {
    this.notify(Comment.SHOW_COMMENT_POPUP, index, e);
  }
  setDocumentInfo(info: DocInfo) {
    this.m_document_info = info
  }
  setUserInfo(info: UserInfo) {
    this.m_user_info = info
  }
  commentMove(v: boolean) {
    this.m_comment_move = v
  }
  setVisibleComment(visible: boolean) {
    this.m_comment_visible = visible;
    this.notify(Comment.VISIBLE_COMMENT)
  }
  setCommentList(list: any[]) {
    this.m_comment_list = list;
    this.notify(Comment.UPDATE_COMMENT);
  }
  updateCommentList(pageId: string) {
    const list = this.m_comment_list;
    this.m_page_comment_list = list.filter(item => item.page_id === pageId)
  }
  setPageCommentList(list: any[], pageId: string) {
    this.m_page_comment_list = list.filter(item => item.page_id === pageId)
    this.notify(Comment.UPDATE_PAGE_COMMENT);
  }
  commentInput(visible: boolean) {
    this.m_comment_input = visible;
    if (!visible) {
      this.notify(Comment.SHUTDOWN_COMMENT)
    }
  }
  commentMount(visible: boolean) {
    this.m_comment_mount = visible;
    if (!visible) {
      this.notify(Comment.COMMENT_POPUP)
    }
  }
  commentOpacity(status: boolean) { //点击后改变其他评论的透明度
    this.m_comment_opacity = status
    this.notify(Comment.OPACITY_COMMENT)
  }
  saveCommentId(id: string) { //保存点击的评论id
    this.m_select_comment_id = id
    this.notify(Comment.SELECTE_COMMENT)
  }
  editShapeComment(state: boolean, shapes?: Shape[]) {
    this.m_shape_comment = state
    if (state) {
      this.m_comment_shape.push(...shapes!)
      this.m_comment_shape = Array.from(new Set(this.m_comment_shape));
    } else {
      this.m_comment_shape = []
    }
  }
  setNot2TreeComment(list: any[]) {
    this.m_not2tree_comment = list
    this.notify(Comment.COMMENT_ALL)
  }
  sendComment() {
    this.notify(Comment.SEND_COMMENT);// listTab栏和content组件之间的通信
  }
  editTabComment() {
    this.notify(Comment.EDIT_COMMENT); // listTab栏和content组件之间的通信
  }
  hoverComment(v: boolean, id?: string) {
    this.m_hove_commetn = v
    this.m_hover_comment_id = id
    if (!v) {
      this.notify(Comment.HOVER_COMMENT);
    } else {
      this.notify(Comment.HOVER_SHOW_COMMENT)
    }
    if (id) {
      this.notify(Comment.CURRENT_COMMENT);
    }
  }
  toggleCommentPage() {
    this.m_comment_list = [];
    this.m_page_comment_list = [];
    this.notify(Comment.TOGGLE_COMMENT_PAGE);//点击评论跳转页面
  }
}