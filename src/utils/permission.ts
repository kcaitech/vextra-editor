import {router} from "@/router";
import {Context} from "@/context";
import {Perm} from "@/context/workspace";

//守卫白名单
const whiteList = ['/', '/login', '/404', '/privacypolicy', '/serviceagreement']
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (token) {
        if (to.path === '/login') {
            next('/apphome') //有token且有效，在指向登录页时跳转到首页列表
        } else {
            next(); // 继续路由跳转
        }
    } else {
        if (whiteList.find(function (item) {
            return item === to.path
        })) {
            if (to.name === 'privacypolicy') {
                document.title = '隐私协议'
            } else if (to.name === 'serviceagreement') {
                document.title = '服务协议'
            } else {
                document.title = 'ProtoDesign'
            }
            next()
        } else {
            if (to.meta.requireAuth) {
                localStorage.setItem('perRoute', to.fullPath)
            } else {
                localStorage.setItem('perRoute', '')
            }
            next('/login')
        }
    }
})
export const permIsEdit = (context: Context) => {
    return Boolean(context.workspace.documentPerm === Perm.isEdit && !context.tool.isLable);
}