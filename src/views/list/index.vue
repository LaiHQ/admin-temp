<template>
    <div class="page-view">
        <div class="page-heading">
            <div class="page-title">查询表格</div>
            <div class="page-description">描述信息</div>
            <div class="page-content"></div>
        </div>
        <div class="page-main">
            <a-form ref="formRef" name="advanced_search" class="ant-advanced-search-form" :model="formState" @finish="onFinish">
                <a-row :gutter="24">
                    <template v-for="i in 10" :key="i">
                        <a-col v-show="expand || i <= 3" :span="6">
                            <a-form-item :name="`field-${i}`" :label="`field-${i}`">
                                <a-input v-model:value="formState[`field-${i}`]" placeholder="placeholder"></a-input>
                            </a-form-item>
                        </a-col>
                    </template>
                    <a-col :span="6" style="text-align: left">
                        <a-button type="primary" html-type="submit">查 询</a-button>
                        <a-button style="margin: 0 8px" @click="() => formRef.resetFields()">重 置</a-button>
                        <a style="font-size: 12px" @click="expand = !expand">
                            <template v-if="expand">
                                <UpOutlined />
                            </template>
                            <template v-else>
                                <DownOutlined />
                            </template>
                            {{ expand ? "收起" : "展开" }}
                        </a>
                    </a-col>
                </a-row>
            </a-form>

            <div class="table-warp">
                <my-table :columns="columns" :dataSource="dataSource">
                    <template #operating>
                        <a-button type="primary" @click="handleOpenModal('新建')">
                            <template #icon><plus-outlined /></template>
                            新建
                        </a-button>
                    </template>
                    <template #bodyCell="{ column, index, record }">
                        <template v-if="column.dataIndex === 'operation'">
                            <span>
                                <a @click="handleOpenModal('编辑', record.id)">编辑</a>
                                <a-divider type="vertical" />
                                <a-popconfirm v-if="dataSource.length" title="确定删除?" @confirm="onDelete(index)">
                                    <a>删除</a>
                                </a-popconfirm>

                                <a-divider type="vertical" />
                                <a class="ant-dropdown-link">
                                    更多
                                    <down-outlined />
                                </a>
                            </span>
                        </template>
                    </template>
                </my-table>
            </div>

            <a-modal v-model:visible="modal.visible" :title="modal.title" @ok="handleOk">
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </a-modal>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue"
import { DownOutlined, UpOutlined, PlusOutlined } from "@ant-design/icons-vue"
import type { FormInstance } from "ant-design-vue"
export default defineComponent({
    components: {
        DownOutlined,
        UpOutlined,
        PlusOutlined
    },
    setup() {
        const expand = ref(false)
        const formRef = ref<FormInstance>()
        const formState = reactive({})
        const onFinish = (values: any) => {
            console.log("Received values of form: ", values)
            console.log("formState: ", formState)
        }
        const dataSource = reactive([
            {
                key: "1",
                name: "胡彦斌",
                age: 32,
                address: "西湖区湖底公园1号"
            },
            {
                key: "2",
                name: "胡彦祖",
                age: 42,
                address: "西湖区湖底公园1号"
            }
        ])
        const columns = [
            {
                title: "姓名",
                dataIndex: "name",
                key: "name"
                // checked:false
            },
            {
                title: "年龄",
                dataIndex: "age",
                key: "age"
            },
            {
                title: "住址",
                dataIndex: "address",
                key: "address"
            },
            {
                title: "操作",
                dataIndex: "operation"
            }
        ]

        const modal = reactive({
            visible: false,
            title: ""
        })

        const loadData = () => {
            return new Promise((relove) => {
                relove(dataSource)
            })
        }
        const onDelete = (index) => {
            dataSource.splice(index, 1)
        }

        function handleOpenModal(title) {
            modal.title = title
            modal.visible = true
        }

        function handleOk() {}

        return {
            formRef,
            formState,
            expand,
            onFinish,
            columns,
            dataSource,
            loadData,
            onDelete,
            handleOpenModal,
            handleOk,
            modal
        }
    }
})
</script>

<style lang="less" scoped>
.page-view {
    .page-heading {
        padding: 12px;
    }

    .page-title {
        font-size: 20px;
        color: rgb(0 0 0 / 85%);
        font-weight: 600;
        line-height: 32px;
    }

    .page-description {
        margin: 12px 0;
        font-size: 16px;
    }

    .page-main {
        padding: 12px 24px;
    }
}
</style>
