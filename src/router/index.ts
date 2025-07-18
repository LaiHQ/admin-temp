/*
 * @Descripttion: 路由配置
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2023-03-07 09:40:26
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2023-06-18 22:57:07
 */
import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from "vue-router"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import systemConfig from "../../config/index"
import { globalLogin } from "@/utils/index"
import { removeAllPendingRequest } from "@/utils/http"
import BasicLayoutV1 from "@/layouts/BasicLayoutV1.vue"
import { getSystemRouter } from "@/api"
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
            // tabs
            {
                path: "/tabs",
                name: "tabs",
                meta: {
                    title: "标签页",
                    icon: "home-outlined",
                    hidden: true
                },
                component: () => import("@/views/tabs/index.vue"),
                redirect: "/tabs/one",
                children: [
                    {
                        path: "/tabs/one",
                        name: "one",
                        meta: {
                            title: "标签页1",
                            icon: "home-outlined",
                            hidden: true
                        },
                        hideInMenu: true,
                        component: () => import("@/views/tabs/one.vue")
                    },
                    {
                        path: "/tabs/two",
                        name: "two",
                        meta: {
                            title: "标签页2",
                            icon: "home-outlined",
                            hidden: true
                        },
                        hideInMenu: true,
                        component: () => import("@/views/tabs/two.vue")
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
    routes: constantRoutes,
    scrollBehavior() {
        return { top: 0, left: 0 }
    }
})

const whiteList: string[] = ["user", "login", "register", "NotFound"]

const generatorRouterCompMap = (routes: Array<RouteRecordRaw>) => {
    const fileterRoutes = routes.filter((item) => !["any"].includes(item.name as string))
    const obj: Record<string, any> = {}
    const getComp = (arr: Array<RouteRecordRaw>) => {
        arr.forEach((item) => {
            if (item.children?.length) {
                getComp(item.children)
            }
            obj[item.name as string] = item
        })
    }
    getComp(fileterRoutes)
    return obj
}
// 前端路由表
const constantRouterComponents = generatorRouterCompMap(asyncRouterMap[0]?.children as RouteRecordRaw[])

// 根级菜单
const rootRouter: RouteRecordRaw = {
    name: "index",
    path: "/",
    component: BasicLayoutV1,
    redirect: "/dashboard",
    meta: {
        title: "首页"
    },
    children: [
        {
            path: "/:path(.*)*",
            hideInMenu: true,
            name: "any",
            redirect: "/error/404"
        }
    ]
}

const generator = (routerMap: any[], parent?: object | null) => {
    return routerMap.map((item) => {
        const { name, path, icon, component, redirect, isFrame, link, target, btnList, children } = item
        // console.log(item)
        const permission = btnList.map((i: { name: string; perms: string; id: number }) => {
            return {
                name: i.name,
                perms: i.perms
            }
        })
        const currentRouter: any = {
            // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
            path: path || `${(parent && parent.path) || ""}/${path}`,
            // 路由名称，建议唯一
            name: component,
            // 该路由对应页面的 组件 :方案1
            component: constantRouterComponents[item.component || item.key]?.component,
            // 该路由对应页面的 组件 :方案2 (动态加载)
            // component: constantRouterComponents[item.component || item.key] || (() => import(`@/views/${item.component}`)),
            // meta: 页面标题, 菜单图标, 页面权限(供指令权限用)
            meta: {
                title: name,
                icon: icon || undefined,
                hiddenHeaderContent: false,
                target: target || "_self", // _self当前打开 _blank 新标签页中打开
                permission,
                hidden: constantRouterComponents[item.component || item.key]?.meta.hidden || false
            },
            hideInMenu: constantRouterComponents[item.component || item.key]?.hideInMenu
        }
        //
        if (constantRouterComponents[item.component || item.key]?.redirect) {
            currentRouter.redirect = constantRouterComponents[item.component || item.key]?.redirect
        }
        if (redirect) {
            currentRouter.redirect = redirect
        }
        if (isFrame) {
            currentRouter.meta.isFrame = true
            currentRouter.meta.href = link
            currentRouter.meta.target = "_blank"
            currentRouter.component = () => import("@/components/webOpen/index.vue")
        }
        if (children && children.length > 0) {
            // Recursion
            currentRouter.children = generator(children, currentRouter)
        }
        if (currentRouter.component === undefined) {
            console.error(`${path} 未找到路由组件，请检查路由配置`)
        }

        return currentRouter
    })
}

async function initRouters(user: any) {
    // 前端路由
    const permission = asyncRouterMap[0]
    user.setPermission(asyncRouterMap)
    router.addRoute(permission)

    // 后端路由
    // const { data } = await getSystemRouter()
    // console.log("生成的", generator(data))
    // rootRouter.children = [...generator(data), ...rootRouter.children]
    // user.setPermission([rootRouter])
    // router.addRoute(rootRouter)
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
                    localStorage.removeItem("token")
                    next({ name: "login" })
                    NProgress.done()
                }
            }
        }
    } else {
        if (whiteList.includes(to.name as string)) {
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
