import { createRouter, createWebHistory } from "vue-router";
import i18n from "./i18n";
import _ from "lodash";
import isMobileDevice from "./utils/mobileDeviceChecker";
import kcdesk from "@/kcdesk";

declare module 'vue-router' {
    interface RouteMeta {
        transition?: string,
        beforeEnter?: NavigationGuardWithThis<undefined> | NavigationGuardWithThis<undefined>[],
        title?: string
    }
}

const HomeVue = () => import("@/components/Home/index.vue");
const DocumentVue = () => import("@/components/Document/index.vue");
const Apphome = () => import("@/components/AppHome/Apphome.vue");
const Login = () => import("@/components/Login/Login.vue");
const Recently = () => import("@/components/AppHome/Main/Recently.vue");
const StarFile = () => import("@/components/AppHome/Main/StarFile.vue");
const ShareMe = () => import("@/components/AppHome/Main/ShareMe.vue");
const MeShare = () => import("@/components/AppHome/Main/MeShare.vue");
const RecycleBin = () => import("@/components/AppHome/Main/RecycleBin.vue");
const Apply = () => import("@/components/Apply/index.vue")
const per_center = () => import('@/components/Userinfo/per_center.vue')
const Privacypolicy = () => import("@/components/Login/Privacypolicy.vue");
const Serviceagreement = () => import("@/components/Login/Serviceagreement.vue");
const KChome = () => import("@/components/Home/KChome.vue");
const HomeContent = () => import("@/components/Home/HomeContent.vue");
const TeamPage = () => import("@/components/TeamProject/TeamPage.vue");
const joinTeam = () => import("@/components/TeamProject/jionTeam.vue");
const ProjectPage = () => import("@/components/TeamProject/ProjectPage.vue");
const projectApply = () => import("@/components/TeamProject/ProjectFill/ProjectApply.vue");
const ProjectShare = () => import('@/components/TeamProject/ProjectShare/ProjectSharePage.vue')
const MobileHome = () => import('@/components/Mobile/index.vue')
const PageViews = () => import('@/components/Mobile/PageViews.vue')
const ProjectView = () => import('@/components/Mobile/ProjectView.vue')
const ProjectFileView = () => import('@/components/Mobile/ProjectFileView.vue')
const Privacy = () => import('@/components/Mobile/MobliePrivacyolicy.vue')
const Agreements = () => import('@/components/Mobile/MoblieServiceagreement.vue')
const Sharefile = () => import('@/components/Mobile/ShareFile.vue')
const Wxlogin = () => import('@/components/Mobile/WxLogin.vue')
const Mapply = () => import('@/components/Mobile/Mapply.vue')
const Msearch = () => import('@/components/Mobile/Searchview.vue')
const HomePage = () => import('@/components/Mobile/HomePage.vue')
const MyFile = () => import('@/components/Mobile/MyFile.vue')
const MyTeam = () => import('@/components/Mobile/Team.vue')
const About = () => import('@/components/Mobile/About.vue')
const Message = () => import('@/components/Mobile/MessageInfo.vue')
const ShareMember = () => import('@/components/Mobile/ShareMember.vue')
const Preview = () => import('@/components/Preview/index.vue')
let _t: any = i18n.global
const productName = _t.t('product.name');

export enum Group {
    Home,
    Document,
}

const apphome_children = [
    {
        path: 'recently',
        name: 'recently',
        component: Recently,
        meta: { title: _t.t('home.recently_opened') + ' - ' + productName, group: Group.Home },
        beforeEnter: (to: any, from: any, next: any) => {
            if (to.name === 'recently') {
                if (isMobileDevice()) {
                    next('/m')
                } else {
                    next()
                }
            }
        }
    },
    {
        path: 'star',
        name: 'starfile',
        component: StarFile,
        meta: { title: _t.t('home.star_file') + ' - ' + productName, group: Group.Home },
    },
    {
        path: 'myfile',
        name: 'meshare',
        component: MeShare,
        meta: { title: _t.t('home.file_shared') + ' - ' + productName, group: Group.Home },
    },
    {
        path: 'shared',
        name: 'shareme',
        component: ShareMe,
        meta: { title: _t.t('home.shared_file_received') + ' - ' + productName, group: Group.Home },
    },
    {
        path: 'trash',
        name: 'recyclebin',
        component: MeShare,
        meta: {
            group: Group.Home
        }
    },
    {
        path: 'team/:id',
        name: 'TeamPage',
        component: TeamPage,
        meta: {
            requireAuth: true,
            group: Group.Home
        }
    },
    {
        path: 'project_shared',
        name: 'ProjectShare',
        component: ProjectShare,
        meta: { title: _t.t('Createteam.sharetip') + ' - ' + productName, group: Group.Home },
    },
    {
        path: 'project/:id',
        name: 'ProjectPage',
        component: ProjectPage,
        meta: {
            requireAuth: true,
            group: Group.Home
        }
    },
]

const routes = [
    {
        path: '/',
        name: "kchome",
        component: KChome,
        // redirect: 'login',
        children: [
            {
                path: "introduction",
                name: "homecontent",
                component: HomeContent,
                alias: '/'
            },
            {
                path: "privacypolicy",
                name: "privacypolicy",
                component: Privacypolicy,
                meta: { title: _t.t('system.read_Privacy') + ' - ' + productName },

            },
            {
                path: "serviceagreement",
                name: "serviceagreement",
                component: Serviceagreement,
                meta: { title: _t.t('system.read_TOS') + ' - ' + productName },
            },
        ],
        meta: { group: Group.Home }
    },
    {
        path: "/login",
        name: "login",
        component: Login,
        meta: {
            // title: _t.t('system.btn_login') + ' - ' + productName,
            requireAuth: true,
            group: Group.Home
        },
    },
    {
        path: "/home",
        name: "home",
        component: HomeVue,
        props: true,
        meta: { group: Group.Home }
    },
    {
        path: "/document",
        name: "document",
        component: DocumentVue,
        meta: {
            requireAuth: true,
            group: Group.Document
        },
        beforeEnter: (to: any, from: any, next: any) => {
            if (to.name === 'document' && to.query.id) {
                const id = to.query.id
                const newid = id ? (id.split(' ')[0] ? id.split(' ')[0] : id.split('%20')[0]) : ''; // 去掉url中的空格
                if (kcdesk && to.query.from !== 'kcdesk') {
                    const name = window.sessionStorage.getItem("open_document_name") ?? "";
                    kcdesk.fileOpen(newid, name, "");
                    next(false);
                }
                else if (newid !== id) {
                    next({ ...to, query: { ...to.query, id: newid } });
                } else {
                    next();
                }
            } else {
                next();
            }
        },
    },
    {
        path: "/prototype",
        name: "prototype",
        component: Preview,
        meta: {
            requireAuth: true,
            group: Group.Document
        }
    },
    {
        path: "/pageviews",
        name: "pageviews",
        component: PageViews,
        meta: {
            requireAuth: true,
            group: Group.Document
        },
        beforeEnter: (to: any, from: any, next: any) => {
            if (to.name === 'pageviews' && to.query.id) {
                const id = to.query.id
                const newid = id ? (id.split(' ')[0] ? id.split(' ')[0] : id.split('%20')[0]) : '';
                if (newid !== id) {
                    next({ ...to, query: { ...to.query, id: newid } });
                } else {
                    next();
                }
            } else {
                next();
            }
        },
    },
    {
        path: "/files",
        name: "apphome",
        component: Apphome,
        redirect: '/files/recently',
        children: apphome_children,
        meta: {
            group: Group.Home
        }
    },
    {
        path: "/wxlogin",
        name: "Wxlogin",
        component: Wxlogin,
        meta: {
            requireAuth: true,
            group: Group.Home
        },
    },
    {
        path: "/m",
        name: "mobilehome",
        component: MobileHome,
        redirect: '/m/home',
        children: [
            {
                path: "home",
                name: "home",
                component: HomePage,
                meta: {
                    requireAuth: true,
                    // title: '首页'
                }
            },
            {
                path: "file",
                name: "file",
                component: MyFile,
                meta: {
                    requireAuth: true,
                    // title: '我的文件'
                }
            },
            {
                path: "team",
                name: "team",
                component: MyTeam,
                meta: {
                    requireAuth: true,
                    // title: '团队'
                }
            },
            {
                path: "about",
                name: "about",
                component: About,
                meta: {
                    requireAuth: true,
                    // title: '我的'
                }
            },

        ],
        meta: {
            requireAuth: true,
            title: '墨师设计',
            group: Group.Home
        }
    },
    {
        path: "/team",
        name: 'projectview',
        component: ProjectView,
        meta: {
            requireAuth: true,
            title: '团队',
            group: Group.Home
        }
    },
    {
        path: "/project",
        name: 'projectfileview',
        component: ProjectFileView,
        meta: {
            requireAuth: true,
            group: Group.Home
        }
    },
    {
        path: "/share",
        name: 'share',
        component: Sharefile,
        meta: {
            requireAuth: true,
            title: '分享',
            group: Group.Home
        }
    },
    {
        path: "/member",
        name: "member",
        component: ShareMember,
        meta: {
            requireAuth: true,
            title: '已加入分享的人',
            group: Group.Home
        }
    },
    {
        path: "/search",
        name: 'search',
        component: Msearch,
        meta: {
            requireAuth: true,
            title: '搜索',
            group: Group.Home
        }
    },
    {
        path: "/message",
        name: 'message',
        component: Message,
        meta: {
            requireAuth: true,
            title: '消息通知',
            group: Group.Home
        }
    },
    {
        path: "/privacy",
        name: 'privacy',
        component: Privacy,
        meta: {
            title: '隐私政策',
            group: Group.Home
        }
    },
    {
        path: "/agreements",
        name: 'agreements',
        component: Agreements,
        meta: {
            title: '在线服务协议',
            group: Group.Home
        }
    },
    {
        path: "/join",
        name: "join",
        component: joinTeam,
        meta: {
            requireAuth: true,
            group: Group.Home
        }
    },
    {
        path: "/apply",
        name: "apply",
        component: Apply,
        meta: {
            requireAuth: true,
            group: Group.Home,
            title: '文档权限申请'
        }
    },
    {
        path: "/mapply",
        name: "mapply",
        component: Mapply,
        meta: {
            requireAuth: true,
            group: Group.Home
        }
    },
    {
        path: "/projectApply",
        name: "projectApply",
        component: projectApply,
        meta: {
            requireAuth: true,
            group: Group.Home
        }
    },
    {
        path: "/pcenter",
        name: "per_center",
        component: per_center,
        meta: {
            group: Group.Home
        }
    },
    {
        path: '/catchAll(.*)/:catchAll(.*)',
        redirect: '/',

    },
]

declare const ENV_SUFFIX: string;
let devPrefix = ENV_SUFFIX;
if (devPrefix) {
    if (devPrefix[0] !== '/') devPrefix = '/' + devPrefix;
    if (devPrefix[devPrefix.length - 1] !== '/') devPrefix += '/';
}

export const router = createRouter({
    // history: createWebHistory(),
    history: createWebHistory(devPrefix),
    // history: createWebHashHistory(),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {
                top: 0,
                behavior: 'smooth'
            }
        }
    },
    routes: routes
})

