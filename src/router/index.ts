/*
 * @Descripttion: 路由配置
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2023-03-07 09:40:26
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2023-06-18 22:57:07
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import systemConfig from "../../config/index"
import { globalLogin } from "@/utils/index"
import { removeAllPendingRequest } from "@/utils/request"
// import BasicLayout from "@/layouts/BasicLayout.vue"
import BasicLayoutV1 from "@/layouts/BasicLayoutV1.vue"
import useStore from "@/store"
const { title } = systemConfig

NProgress.configure({
    // eslint-disable-next-line quotes
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
    showSpinner: false // 转轮
})

// 默认路由
const constantRoutes: Array<RouteRecordRaw> = [
    {
        path: "/user",
        name: "user",
        component: () => import("@/views/user/index.vue"),
        redirect: "/user/login",
        children: [
            {
                path: "login",
                name: "login",
                component: () => import("@/views/user/login.vue"),
                meta: {
                    title: "登录"
                }
            },
            {
                path: "register",
                name: "register",
                component: () => import("@/views/user/register.vue"),
                meta: {
                    title: "注册"
                }
            },
            {
                path: "/error",
                name: "error",
                meta: {
                    title: "error"
                },
                component: () => import("@/views/error/index.vue"),
                redirect: "/error/404",
                children: [
                    {
                        path: "404",
                        name: "NotFound",
                        component: () => import("@/views/error/404.vue"),
                        meta: {
                            title: "资源不存在"
                        }
                    },
                    {
                        path: "401",
                        name: "unauthorized",
                        component: () => import("@/views/error/401.vue"),
                        meta: {
                            title: "没有访问权限"
                        }
                    }
                ]
            }
        ]
    }
]
// 异步路由
const asyncRouterMap: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "index",
        component: BasicLayoutV1,
        meta: {
            title: "首页"
        },
        redirect: "/dashboard",
        children: [
            {
                path: "/dashboard",
                name: "dashboard",
                meta: {
                    title: "工作台",
                    icon: "home-outlined"
                },
                component: () => import("@/views/home/index.vue")
            },
            {
                path: "/list",
                name: "list",
                meta: {
                    title: "列表",
                    icon: "unordered-list-outlined"
                },
                component: () => import("@/views/list/index.vue")
            },
            {
                path: "/system",
                name: "system",
                meta: {
                    title: "系统管理",
                    icon: "setting-outlined"
                },
                component: () => import("@/views/system/index.vue"),
                redirect: "/system/users",
                children: [
                    {
                        path: "/system/users",
                        name: "users",
                        meta: {
                            title: "用户管理"
                        },
                        component: () => import("@/views/system/users/index.vue")
                    },
                    {
                        path: "/system/roles",
                        name: "roles",
                        meta: {
                            title: "角色管理"
                        },
                        component: () => import("@/views/system/roles/index.vue")
                    },
                    {
                        path: "/system/permissions",
                        name: "permissions",
                        meta: {
                            title: "权限管理"
                        },
                        component: () => import("@/views/system/permissions/index.vue")
                    },
                    {
                        path: "/system/errorlog",
                        name: "errorlog",
                        meta: {
                            title: "异常日志"
                        },
                        component: () => import("@/views/system/errorlog/index.vue")
                    }
                ]
            },
            // 捕获所有路由或 404 Not found 路由
            {
                path: "/:path(.*)*",
                hideInMenu: true,
                name: "any",
                redirect: "/error/404"
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: constantRoutes
})

const whiteList: string[] = ["user", "login", "register", "NotFound"]

async function initRouters(user) {
    const permission = asyncRouterMap[0]
    user.setPermission(asyncRouterMap)

    router.addRoute(permission)
}

router.beforeEach(async (to, from, next) => {
    if (to.meta.title) window.document.title = `${title} - ${to.meta.title}`
    NProgress.start()
    // 跳转页面取消上一个页面所有的请求
    removeAllPendingRequest()
    if (localStorage.getItem("token")) {
        if (to.path === "/user/login") {
            next({ path: "/" })
            NProgress.done()
        } else {
            const { user } = useStore()
            if (user.getPermission.length) {
                next()
            } else {
                try {
                    await initRouters(user)
                    next({ ...to })
                } catch (error) {
                    next({ name: "login" })
                    NProgress.done()
                }
            }
        }
    } else {
        if (whiteList.includes(to.name)) {
            next()
        } else {
            next({ path: "user/login", query: { redirect: to.fullPath } })
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
    globalLogin("hide")
})

export default router
