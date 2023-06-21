<template>
    <div class="table-container">
        <!-- 搜索 -->
        <div class="search-warp"></div>
        <!-- 操作 -->
        <div class="handle-warp">
            <div class="handle-left">
                <slot name="operating"></slot>
            </div>
            <div class="handle-right">
                <a-tooltip placement="top">
                    <template #title>
                        <span>{{ state.isRefresh ? "刷新中..." : "刷 新" }}</span>
                    </template>
                    <a-button type="text" @click="refresh">
                        <template #icon>
                            <redo-outlined :class="{ 'icon-refresh': state.isRefresh }" />
                        </template>
                    </a-button>
                </a-tooltip>
                <a-tooltip placement="top">
                    <template #title>
                        <span>密度</span>
                    </template>
                    <a-popover placement="bottom" trigger="click">
                        <template #content>
                            <a-radio-group v-model:value="state.tableSize">
                                <a-radio :style="state.radioStyle" value="default">默认</a-radio>
                                <a-radio :style="state.radioStyle" value="middle">中等</a-radio>
                                <a-radio :style="state.radioStyle" value="small">紧凑</a-radio>
                            </a-radio-group>
                        </template>
                        <a-button type="text">
                            <template #icon><column-height-outlined /></template>
                        </a-button>
                    </a-popover>
                </a-tooltip>
                <a-tooltip placement="top">
                    <template #title>
                        <span>列设置</span>
                    </template>
                    <a-popover placement="bottom" trigger="click">
                        <template #content>
                            <a-checkbox-group v-model:value="state.columnsChecked" @change="handleColumnsChange">
                                <a-row :gutter="[0, 16]">
                                    <a-col :span="24" v-for="item in columnsCheckboxList" :key="item.dataIndex">
                                        <a-checkbox :value="item.dataIndex">{{ item.title }}</a-checkbox>
                                    </a-col>
                                </a-row>
                            </a-checkbox-group>
                        </template>
                        <template #title>
                            <div class="columns-checked-title">
                                <span><a-checkbox v-model:checked="state.columnsCheckedAll" :indeterminate="state.indeterminate" @change="handleColumnsCheckAll">列展示</a-checkbox> </span>
                                <a-button type="link" @click="initColumns">重置</a-button>
                            </div>
                        </template>
                        <a-button type="text">
                            <template #icon><setting-outlined /></template>
                        </a-button>
                    </a-popover>
                </a-tooltip>
                <a-tooltip placement="top">
                    <template #title>
                        <span>全 屏</span>
                    </template>
                    <a-button type="text" @click="handleFullscreen">
                        <template #icon><fullscreen-outlined /></template>
                    </a-button>
                </a-tooltip>
                <a-tooltip placement="top">
                    <template #title>
                        <span>打 印</span>
                    </template>
                    <a-button type="text" @click="print">
                        <template #icon><printer-outlined /></template>
                    </a-button>
                </a-tooltip>
            </div>
        </div>
        <a-alert :message="`已选择: ${state.selectedRows.length}`" type="info" show-icon v-if="state.selectedRows.length" />
        <div class="table-warp">
            <a-table class="table" :dataSource="dataSource" :columns="state._columns" :row-selection="rowSelection" bordered :pagination="pagination" :loading="state.loading" :size="state.tableSize">
                <template #bodyCell="{ column, text, record, index }">
                    <slot name="bodyCell" :column="column" :text="text" :record="record" :index="index" />
                </template>
            </a-table>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, nextTick } from "vue"
import { RedoOutlined, PrinterOutlined, SettingOutlined, FullscreenOutlined, ColumnHeightOutlined } from "@ant-design/icons-vue"
import printHtml from "@/utils/print"
const props = defineProps({
    dataSource: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        default: () => []
    },
    loadData: {
        type: Promise
    },
    columnsLocalKey: {
        type: String
    },
    fullscreenDom: {
        type: String
    },
    tableSize: {
        type: String,
        default: "default"
    }
})

const pagination = reactive({
    hideOnSinglePage: false,
    total: 0,
    current: 1,
    showQuickJumper: true,
    showLessItems: true,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "30", "40"],
    showTotal: (total) => `共 ${total} 条`
})
const state = reactive({
    selectedRows: [],
    loading: false,
    isRefresh: false,
    columnsCheckedAll: false,
    indeterminate: true,
    columnsChecked: [],
    _columns: [],
    radioStyle: {
        display: "flex",
        height: "30px",
        lineHeight: "30px"
    },
    parameter: {}
})

const columnsCheckboxList = computed(() => {
    return props.columns.map((item) => {
        return {
            ...item,
            _checked: item.checked !== undefined ? item.checked : true
        }
    })
})

watch(
    () => state.columnsChecked,
    (val) => {
        state.indeterminate = !!val.length && val.length < columnsCheckboxList.value.length
        state.columnsCheckedAll = val.length === columnsCheckboxList.value.length
    }
)

function handleColumnsChange(v) {
    state._columns = props.columns.reduce((arr, item) => {
        if (v.includes(item.dataIndex)) {
            item.checked = true
            arr.push(item)
        }
        return arr
    }, [])
}

function handleColumnsCheckAll(e) {
    state.columnsChecked = props.columns
        .map((i) => {
            return e.target.checked ? i.dataIndex : null
        })
        .filter((i) => i)
    handleColumnsChange(state.columnsChecked)
}

function initColumns() {
    const { columns, checked } = columnsCheckboxList.value.reduce(
        (obj, i) => {
            if (i._checked) {
                obj.columns.push(i)
                obj.checked.push(i.dataIndex)
            }
            return obj
        },
        { columns: [], checked: [] }
    )
    state._columns = columns
    state.columnsChecked = checked
}

const rowSelection = ref({
    checkStrictly: false,
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows)
        state.selectedRows = selectedRows
    }
})

function handleLoadData() {
    state.loading = true
}

function refresh() {
    state.isRefresh = true
    handleLoadData()
}

function print() {
    printHtml(".table")
}

// 全屏
function handleFullscreen() {
    if (isFullScreen()) {
        exitFullscreen()
    } else {
        const el = document.querySelector(".ant-layout-content")
        launchIntoFullscreen(el)
    }
}
// 全屏
function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
    }
}
// 退出全屏
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
    }
}
// 判断当前是否全屏
function isFullScreen() {
    return !!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.webkitFullScreen || document.msFullScreen)
}

function getTableList() {
    if (Object.prototype.toString.call(props.loadData) !== "[object Promise]") return
    state.loading = true
    const { filters, sorter } = state.parameter
    const parameter = {
        pageSize: pagination.pageSize,
        pageNo: pagination.current,
        ...filters,
        ...sorter
    }

    // 数据加载
    props
        .loadData(parameter)
        .then((res) => {
            const { code, data } = res
            if (Number.parseInt(code) === 0) {
                const { list, pageNo, pageSize, total } = data || {}
                // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
                if (list.length === 0 && pageNo > 1) {
                    pagination.current--
                    getTableList()
                    return
                }
                state.dataSource = list
                pagination.current = pageNo
                pagination.pageSize = pageSize
                pagination.total = total
            } else {
                // 错误处理
            }
        })
        .finally(() => {
            nextTick(() => {
                state.loading = false
            })
        })
}

onMounted(() => {
    initColumns()
    state.tableSize = props.tableSize
    getTableList()
})
</script>

<style lang="less" scoped>
@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.handle-warp {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0;

    .icon-refresh {
        animation: rotate 1s ease-in-out infinite;
    }
}

.columns-checked-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-warp {
    margin-top: 12px;
}
</style>
