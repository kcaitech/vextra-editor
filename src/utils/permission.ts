import { router } from "@/router";
import { Context } from "@/context";
import { Perm } from "@/context/workspace";

//守卫白名单
const whiteList = ['/', '/login', '/404', '/privacypolicy', '/serviceagreement']
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.title) {
        document.title = to.meta.title as string
    } else {
        document.title = 'ProtoDesign'
    }
    //判断是否存在token且有效
    if (token) {
        if (to.path === '/login') {
            next('/apphome')
        } else {
            next(); // 继续路由跳转
        }
    } else {
        if (whiteList.includes(to.path)) {
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
    return Boolean(context.workspace.documentPerm === Perm.isEdit);
}