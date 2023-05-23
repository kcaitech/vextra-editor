import {router} from "@/router";

//守卫白名单
const whiteList = ['/login', '/404']
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (token) {
        if (to.path === '/login') {
            next('/')
        } else {
            next(); // 继续路由跳转
        }
    } else {
        if (whiteList.find(function (item) {
            return item === to.path
        })) {
            next()
        } else {
            next('/login')
        }
    }
    
})