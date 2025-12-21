import { v4 as uuidv4 } from 'uuid';

// 小地图配置
export const miniMapOptions = {
    showEdge: true,
    headerTitle: '',
    isShowCloseIcon: true,
    width: 203,
    height: 150,
    isShowHeader: false,
}


// 节点初始化数据
export const defaultOutput = {
    start: {        
        // 输入变量
        customVariables: [
            {
                id: uuidv4(),
                key: '',
                type: 'String',
                desc: '',
                properties: [],
                expanded: true,
                disabled: false,
            }
        ],
        // 预置变量
        preset: [
            {
                id: uuidv4(),
                key: 'query',
                type: 'String',
                desc: '用户的query',
                properties: [],
                expanded: true,
                disabled: true
            }
        ],
        condition:[
            {
                title:'条件1'
            },
            {
                title:'条件2'
            },
            {
                title:'条件3'
            },
            {
                title:'条件4'
            },
            {
                title:'条件5'
            },
            {
                title:'条件6'
            }
        ]

    },
    end: {
        outputMode: 'text',
        outputParams: [],
    },
    llm: {
        maxTokens: 1024,
        temperature: 0.7,
        topP: 1,
        systemMessage: '',
        prompt: '',
        outputParams: [
            {
                id: uuidv4(),
                key: "text",
                type: "String",
                desc: '文本输出',
                dataType:'String',
                properties: [],
                expanded: false
            }
        ],
    },
    http: {
        method: 'GET',
        url: '',
        headers: [],
        outputParams: [
            {
                id: "default_result",
                key: "result",
                type: "String",
                desc: "输出结果",
                properties: [],
                expanded: true,
            },
        ],
    }
}


// 画布初始化数据
export const defaultGraphData = {
    nodes: [
        createNodeOptions({
            type: 'start',
            x: 700,
            y: 40,
            text: '开始节点',
            
        }, {
            title: '开始节点',
            anchors: ['right'],
            showDebug: false,
            showMore: false,
            showNodeMenu: false,
            moreMenu: [],
            description:"123",
        }),

        // createNodeOptions({
        //     type: 'end',
        //     x: 600,
        //     y: 60,
        //     text: '结束节点',
        // }, {
        //     title: '结束节点',
        //     anchors: ['left'],
        //     showDebug: false,
        //     showMore: false,
        //     showNodeMenu: false,
        //     moreMenu: [],
        // }),
    ],
    edges: [

    ],
};

/**
 * 创建节点配置
 * @param {*} options 节点配置
 * @param {*} properties 业务数据，节点属性
 * @returns 节点配置
 */
export function createNodeOptions(options = {}, properties = {}) {
    const nodeOptions = {
        id: uuidv4(),
        x: 0,
        y: 0,
        text: '',
        type: '',
        ...options,
        properties: {
            description: '',
            anchors: ['left', 'right'],
            showDebug: true,
            showMore: true,
            showNodeMenu: false,
            width: 240,
            height: 58,
            icon: '',
            title: '',
            moreMenu: [
                {
                    key: 'on-copy',
                    icon: 'CopyOutlined',
                    text: '复制',
                    disabled: false,
                    color: '#333'
                },
                {
                    key: 'on-delete',
                    icon: 'DeleteOutlined',
                    text: '删除',
                    disabled: false,
                    color: 'red'
                }
            ],
            config: defaultOutput[options.type] || {},
            ...properties,
        }
    }
    return nodeOptions;
}

