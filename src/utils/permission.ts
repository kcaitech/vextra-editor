import { router, Group } from "@/router";
import { Context } from "@/context";
import { Perm } from "@/context/workspace";
import isMobileDevice from "./mobileDeviceChecker";
import kcdesk from "@/kcdesk";

//守卫白名单
const whiteList = ['/', '/login', '/wxlogin', '/404', '/privacy', '/agreements', '/privacypolicy', '/serviceagreement']
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.title) {
        document.title = to.meta.title as string;
    }
    if (kcdesk) {
        if (kcdesk.isPrepareView()) {
            next(false);
            return;
        }

        if (from.meta.group === Group.Document && to.meta.group !== Group.Document) {
            if (token) kcdesk.fileCloseSelf();
            else kcdesk.fileShow(0);
            next(false);
            return;
        }
    }
    //判断是否存在token且有效
    if (token) {
        if (to.path === '/login' || to.path === '/') {
            if (isMobileDevice()) {
                next('/m')
            } else {
                next('/files')
            }
        } else {
            next(); // 继续路由跳转
        }
    } else {
        if (whiteList.includes(to.path)) {
            next()
        } else {
            if (kcdesk && kcdesk.getViewId() > 0) {
                kcdesk.fileShow(0); // 切换到首页登录
                next(); // 继续吗？
                return;
            }
            if (to.meta.requireAuth) {
                sessionStorage.setItem('perRoute', encodeURIComponent(to.fullPath))
            } else {
                sessionStorage.setItem('perRoute', '')
            }
            if (navigator.userAgent.includes('miniProgram')) {
                next('/wxlogin')
            } else {
                next('/login')
            }
        }
    }
})

router.afterEach((to, from, failure) => {
    if (to.path === "/introduction") {
        history.replaceState(null, '', location.href.replace('introduction', ''))
    }
})

export const permIsEdit = (context: Context) => {
    return Boolean(context.workspace.documentPerm === Perm.isEdit && !context.tool.isLable);
}