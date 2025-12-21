
export class ReverseConnectionPolicy {
    static pluginName = 'reverseConnectionPolicy';

    constructor({ lf }) {
        this.lf = lf;
        this.bindEvents();
    }

    bindEvents() {
        // 监听连线创建
        this.lf.on('edge:add', ({ data }) => {
            setTimeout(() => this.checkAndReverseConnection(data), 50);
        });

        // 监听连线端点调整
        this.lf.on('edge:exchange-node', ({ data }) => {
            setTimeout(() => {
                const edgeModel = this.lf.getEdgeModelById(data.id);
                if (edgeModel) {
                    this.checkAndReverseConnection(edgeModel.getData());
                }
            }, 50);
        });
    }


    checkAndReverseConnection(edgeData) {
        const { sourceNodeId, targetNodeId, id } = edgeData;
        const sourceNode = this.lf.getNodeModelById(sourceNodeId);
        const targetNode = this.lf.getNodeModelById(targetNodeId);

        if (!sourceNode || !targetNode) return;

        

        // 判断是否需要反转
        const shouldReverse = (targetNode.type === 'start') ||
            (sourceNode.type === 'end');

        if (shouldReverse) {
            console.log(`检测到需要反转的连线 ${id}:`, {
                源节点类型: sourceNode.type,
                目标节点类型: targetNode.type
            });

            this.reverseEdgeDirection(edgeData);
        }
    }

    reverseEdgeDirection(edgeData) {
        const {
            id,
            type,
            sourceNodeId,
            targetNodeId,
            sourceAnchorId,
            targetAnchorId
        } = edgeData;

        console.log('开始反转连线:', id);

        // 先隐藏原连线
        const edgeModel = this.lf.getEdgeModelById(id);
        if (edgeModel) {
            edgeModel.setElementState(0); // 隐藏
        }

        // 延迟后重新创建
        setTimeout(() => {
            this.recreateEdge(edgeData);

            // 如果有隐藏的原连线，删除它
            if (edgeModel) {
                this.lf.deleteEdge(id);
            }
        }, 50);
    }


    recreateEdge(edgeData) {
        const {
            id, type, text, properties,
            sourceNodeId, targetNodeId,
            sourceAnchorId, targetAnchorId
        } = edgeData;

        const newEdgeData = {
            // id: `reversed_${id}_${Date.now()}`,
            id: id,
            type: type || 'polyline',
            sourceNodeId: targetNodeId,
            targetNodeId: sourceNodeId,
            sourceAnchorId: targetAnchorId,
            targetAnchorId: sourceAnchorId,
            text,
            properties: properties || {}
        };

        this.lf.addEdge(newEdgeData);
    }
}
