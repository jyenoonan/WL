<!-- src/wwElement.vue -->
<template>
  <div class="n8n-visualizer-container">
    <div v-if="!showCanvas" class="fallback-container">
      <p>{{ statusMessage }}</p>
    </div>
    <svg v-else ref="canvas" class="workflow-canvas"></svg>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';

export default {
  props: {
    content: { type: Object, required: true },
  },
  setup(props) {
    const canvas = ref(null);
    const statusMessage = ref('Initializing...');
    const showCanvas = ref(false);
    let g;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    const renderWorkflow = (workflowData) => {
        if (!canvas.value) return;
        canvas.value.innerHTML = '';

        const { nodes, connections } = workflowData;

        const defs = document.createElementNS(SVG_NS, 'defs');
        defs.innerHTML = `
            <marker id="arrowhead-solid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#E5E7EB"></path></marker>
            <marker id="arrowhead-dashed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9CA3AF"></path></marker>
        `;
        canvas.value.appendChild(defs);

        g = document.createElementNS(SVG_NS, 'g');
        canvas.value.appendChild(g);

        const nodeNameMap = nodes.reduce((acc, node) => {
            acc[node.name] = node;
            return acc;
        }, {});

        renderNodes(nodes, true); // Render stickies first
        renderConnections(connections, nodeNameMap);
        renderNodes(nodes, false); // Render other nodes on top
        
        nextTick(() => {
            fitCanvasToContent(nodes);
            setupPanAndZoom();
        });
    };

    const isSpecialNodeType = (type) => {
        const specialTypes = ['.tool', 'memory', 'lmChat', 'embeddings', 'vectorStore'];
        return specialTypes.some(t => type.includes(t));
    };

    function renderConnections(connections, nodeMap) {
        const connectionsGroup = document.createElementNS(SVG_NS, 'g');
        g.appendChild(connectionsGroup);

        Object.keys(connections).forEach(sourceName => {
            const sourceNode = nodeMap[sourceName];
            if (!sourceNode || sourceNode.type.includes('stickyNote')) return;

            const outputs = connections[sourceName];
            Object.entries(outputs).forEach(([outputType, outputConnections]) => {
                if (!Array.isArray(outputConnections)) return;
                outputConnections.forEach(connectionArray => {
                    if (!Array.isArray(connectionArray)) return;
                    connectionArray.forEach(connection => {
                        const targetNode = nodeMap[connection.node];
                        if (!targetNode || targetNode.type.includes('stickyNote')) return;

                        const path = document.createElementNS(SVG_NS, 'path');
                        let d = '';
                        
                        // Check for special connection types (tools, models, etc.)
                        const isSpecialConnection = outputType.startsWith('ai_');

                        if (isSpecialConnection && targetNode.type.includes('.agent')) {
                            // This is a Tool -> Agent connection. Draw it visually from Agent to Tool.
                            const [agent_x_raw, agent_y_raw] = targetNode.position;
                            const [tool_x_raw, tool_y_raw] = sourceNode.position;

                            const agentWidth = 90;
                            const agentHeight = 90;
                            const toolDiameter = 70;

                            const x1 = agent_x_raw + agentWidth / 2; // Start from Agent bottom-center
                            const y1 = agent_y_raw + agentHeight;
                            const x2 = tool_x_raw + toolDiameter / 2; // End at Tool top-center
                            const y2 = tool_y_raw;

                            d = `M ${x1},${y1} L ${x2},${y2}`;
                            path.setAttribute('style', 'stroke: #9CA3AF; stroke-width: 1.5px; fill: none; stroke-dasharray: 4, 4;');
                            path.setAttribute('marker-end', 'url(#arrowhead-dashed)');
                        } else {
                            // Standard main connection
                            const [x1_raw, y1_raw] = sourceNode.position;
                            const [x2_raw, y2_raw] = targetNode.position;
                            
                            const sourceWidth = isSpecialNodeType(sourceNode.type) ? 70 : 90;
                            const sourceHeight = isSpecialNodeType(sourceNode.type) ? 70 : 90;
                            const targetHeight = isSpecialNodeType(targetNode.type) ? 70 : 90;
                            const x1 = x1_raw + sourceWidth;
                            const y1 = y1_raw + sourceHeight / 2;
                            const x2 = x2_raw;
                            const y2 = y2_raw + targetHeight / 2;
                            d = `M ${x1},${y1} L ${x2},${y2}`;
                            path.setAttribute('style', 'stroke: #E5E7EB; stroke-width: 2px; fill: none;');
                            path.setAttribute('marker-end', 'url(#arrowhead-solid)');
                        }

                        path.setAttribute('d', d);
                        connectionsGroup.appendChild(path);
                    });
                });
            });
        });
    }

    function renderNodes(nodes, renderStickies) {
        const nodesGroup = document.createElementNS(SVG_NS, 'g');
        g.appendChild(nodesGroup);

        nodes.forEach(node => {
            const isSticky = node.type.includes('stickyNote');
            if ((renderStickies && !isSticky) || (!renderStickies && isSticky)) return;

            const [x, y] = node.position;
            const nodeGroup = document.createElementNS(SVG_NS, 'g');
            nodeGroup.setAttribute('transform', `translate(${x}, ${y})`);

            if (isSticky) {
                renderStickyNote(node, nodeGroup);
            } else if (isSpecialNodeType(node.type)) {
                renderCircularNode(node, nodeGroup);
            } else {
                renderStandardNode(node, nodeGroup);
            }
            nodesGroup.appendChild(nodeGroup);
        });
    }
    
    function renderStandardNode(node, nodeGroup) {
        const width = 90;
        const height = 90;
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('rx', 16);
        rect.setAttribute('ry', 16);
        rect.setAttribute('style', 'fill: #4B5563; stroke: #E5E7EB; stroke-width: 2px;');
        nodeGroup.appendChild(rect);

        const portLeft = document.createElementNS(SVG_NS, 'circle');
        portLeft.setAttribute('cx', 0);
        portLeft.setAttribute('cy', height / 2);
        portLeft.setAttribute('r', 6);
        portLeft.setAttribute('style', 'fill: #374151; stroke: #E5E7EB; stroke-width: 2px;');
        nodeGroup.appendChild(portLeft);

        const portRight = document.createElementNS(SVG_NS, 'circle');
        portRight.setAttribute('cx', width);
        portRight.setAttribute('cy', height / 2);
        portRight.setAttribute('r', 6);
        portRight.setAttribute('style', 'fill: #374151; stroke: #E5E7EB; stroke-width: 2px;');
        nodeGroup.appendChild(portRight);

        const icon = getIconForNodeType(node.type);
        const iconSize = 48;
        icon.setAttribute('x', (width - iconSize) / 2);
        icon.setAttribute('y', (height - iconSize) / 2);
        icon.setAttribute('width', iconSize);
        icon.setAttribute('height', iconSize);
        nodeGroup.appendChild(icon);

        const primaryText = document.createElementNS(SVG_NS, 'text');
        primaryText.setAttribute('x', width / 2);
        primaryText.setAttribute('y', height + 24);
        primaryText.setAttribute('style', 'font-size: 15px; font-weight: 600; fill: #FFFFFF; text-anchor: middle;');
        primaryText.textContent = node.name;
        nodeGroup.appendChild(primaryText);
        
        const secondaryText = document.createElementNS(SVG_NS, 'text');
        secondaryText.setAttribute('x', width / 2);
        secondaryText.setAttribute('y', height + 42);
        secondaryText.setAttribute('style', 'font-size: 12px; fill: #D1D5DB; text-anchor: middle;');
        secondaryText.textContent = formatSecondaryText(node.type);
        nodeGroup.appendChild(secondaryText);
    }

    function renderCircularNode(node, nodeGroup) {
        const diameter = 70;
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', diameter / 2);
        circle.setAttribute('cy', diameter / 2);
        circle.setAttribute('r', diameter / 2);
        circle.setAttribute('style', 'fill: #4B5563; stroke: #E5E7EB; stroke-width: 2px;');
        nodeGroup.appendChild(circle);

        const portTop = document.createElementNS(SVG_NS, 'circle');
        portTop.setAttribute('cx', diameter / 2);
        portTop.setAttribute('cy', 0);
        portTop.setAttribute('r', 6);
        portTop.setAttribute('style', 'fill: #374151; stroke: #E5E7EB; stroke-width: 2px;');
        nodeGroup.appendChild(portTop);

        const icon = getIconForNodeType(node.type);
        const iconSize = 36;
        icon.setAttribute('x', (diameter - iconSize) / 2);
        icon.setAttribute('y', (diameter - iconSize) / 2);
        icon.setAttribute('width', iconSize);
        icon.setAttribute('height', iconSize);
        nodeGroup.appendChild(icon);

        const primaryText = document.createElementNS(SVG_NS, 'text');
        primaryText.setAttribute('x', diameter / 2);
        primaryText.setAttribute('y', diameter + 22);
        primaryText.setAttribute('style', 'font-size: 15px; font-weight: 600; fill: #FFFFFF; text-anchor: middle;');
        primaryText.textContent = node.name;
        nodeGroup.appendChild(primaryText);
    }

    function renderStickyNote(node, nodeGroup) {
        const { width = 200, height = 100, content = '', color = 1 } = node.parameters || {};
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('rx', 8);
        rect.setAttribute('ry', 8);
        rect.setAttribute('fill', getStickyNoteColor(color));
        rect.setAttribute('fill-opacity', '0.25');
        rect.setAttribute('stroke', getStickyNoteColor(color));
        rect.setAttribute('stroke-width', '1.5');
        rect.setAttribute('stroke-dasharray', '5,5');
        nodeGroup.appendChild(rect);

        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', 15);
        text.setAttribute('y', 25);
        text.setAttribute('style', 'font-size: 14px; font-weight: 600; fill: #FFFFFF;');
        
        const cleanedContent = content.replace(/##\s*/g, '');
        cleanedContent.split('\\n').forEach((line, i) => {
            const tspan = document.createElementNS(SVG_NS, 'tspan');
            tspan.setAttribute('x', 15);
            tspan.setAttribute('dy', i === 0 ? 0 : '1.2em');
            tspan.textContent = line.trim();
            text.appendChild(tspan);
        });
        nodeGroup.appendChild(text);
    }

    function getStickyNoteColor(colorIndex) {
        const colors = { 1: '#fde047', 2: '#f87171', 3: '#fca5a5', 4: '#4ade80', 5: '#60a5fa', 6: '#c084fc', 7: '#5eead4' };
        return colors[colorIndex] || '#9ca3af';
    }

    function formatSecondaryText(type) {
        if (!type) return '';
        const parts = type.split('.').pop().split(/(?=[A-Z])/);
        return parts.join(' ').replace('Lm', '');
    }

    function getIconForNodeType(type) {
        const icon = document.createElementNS(SVG_NS, 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');

        let pathData = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
        let color = '#9CA3AF';

        if (type.includes('Trigger') || type.includes('webhook')) { pathData = 'M13 10V3L4 14h7v7l9-11h-7z'; color = '#C084FC'; }
        else if (type.includes('code') || type.includes('set')) { pathData = 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'; color = '#FBBF24'; }
        else if (type.includes('.tool')) { pathData = 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'; color = '#9CA3AF'; }
        else if (type.includes('agent')) { pathData = 'M9 3.785a2.5 2.5 0 012.292 2.119V7h.045a2.5 2.5 0 012.32 2.124v.001a2.5 2.5 0 01-1.944 2.438V12h.01a2.5 2.5 0 012.49 2.5v.002a2.5 2.5 0 01-4.998.04V14.5a2.5 2.5 0 01-2.5-2.5v-.01a2.5 2.5 0 012.438-1.944h.001a2.5 2.5 0 012.124-2.32V7a2.5 2.5 0 012.119-2.292M12 21a9 9 0 100-18 9 9 0 000 18z'; color = '#60A5FA'; }
        else if (type.includes('gmail')) { pathData = 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'; color = '#F87171'; }
        else if (type.includes('googleSheets')) { pathData = 'M17 17h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zm12-4h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 0h2v2H9v-2zm-4 0h2v2H5v-2zm12-4h2v2h-2V9zm-4 0h2v2h-2V9zm-4 0h2v2H9V9zM5 9h2v2H5V9zm12-4h2v2h-2V5zm-4 0h2v2h-2V5zM9 5h2v2H9V5zM5 5h2v2H5V5z'; color = '#4ADE80'; }
        else if (type.includes('supabase')) { pathData = 'M12 3L2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 18l10 5 10-5'; color = '#34D399'; }
        else if (type.includes('OpenAi') || type.includes('lmChat')) { pathData = 'M21.58 16.09l-1.1-1.8-3.08-5.05-3.09-5.06-1.1-1.8A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.29.78l-1.1 1.8-3.09 5.06-3.08 5.05-1.1 1.8A1.5 1.5 0 002.42 18h19.16a1.5 1.5 0 001.29-1.91zM12 4.1l.83 1.35 3.08 5.05-4.2 2.42-3.91-2.42 3.08-5.05L12 4.1z'; color = '#F472B6'; }

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('style', `stroke: ${color}; stroke-width: 2px; fill: none;`);
        icon.appendChild(path);
        return icon;
    }

    function fitCanvasToContent(nodes) {
        if (!nodes || nodes.length === 0) { canvas.value.setAttribute('viewBox', '-200 -200 400 400'); return; }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            const [x, y] = node.position;
            const nodeParams = node.parameters || {};
            const isSticky = node.type.includes('stickyNote');
            const isSpecial = isSpecialNodeType(node.type);
            const width = isSticky ? nodeParams.width || 200 : (isSpecial ? 70 : 90);
            const height = isSticky ? nodeParams.height || 100 : (isSpecial ? 70 : 90);
            const textHeight = isSticky ? 0 : 40;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height + textHeight);
        });
        if (minX === Infinity) { canvas.value.setAttribute('viewBox', '-200 -200 400 400'); return; }
        const padding = 100;
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const viewBoxX = minX - padding;
        const viewBoxY = minY - padding;
        const viewBoxWidth = contentWidth + (padding * 2);
        const viewBoxHeight = contentHeight + (padding * 2);
        canvas.value.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
    }

    function setupPanAndZoom() {
        if (!canvas.value) return;
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let viewBox = canvas.value.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1000, 1000];
        const getPoint = (evt) => {
            let point = new DOMPoint(evt.clientX, evt.clientY);
            return point.matrixTransform(canvas.value.getScreenCTM().inverse());
        };
        canvas.value.onmousedown = (e) => { isPanning = true; startPoint = getPoint(e); };
        canvas.value.onmousemove = (e) => {
            if (!isPanning) return;
            let endPoint = getPoint(e);
            viewBox[0] += startPoint.x - endPoint.x;
            viewBox[1] += startPoint.y - endPoint.y;
            canvas.value.setAttribute('viewBox', viewBox.join(' '));
        };
        canvas.value.onmouseup = canvas.value.onmouseleave = () => { isPanning = false; };
        canvas.value.onwheel = (e) => {
            e.preventDefault();
            const scale = e.deltaY < 0 ? 1 / 1.03 : 1.03;
            const mousePoint = getPoint(e);
            viewBox[2] *= scale;
            viewBox[3] *= scale;
            viewBox[0] = mousePoint.x - (mousePoint.x - viewBox[0]) * scale;
            viewBox[1] = mousePoint.y - (mousePoint.y - viewBox[1]) * scale;
            canvas.value.setAttribute('viewBox', viewBox.join(' '));
        };
    }
    
    watch(() => props.content.workflowJsonString, (newValue) => {
        if (typeof newValue === 'string' && newValue.trim()) {
            let parsedData;
            try {
                parsedData = JSON.parse(newValue);
                if (parsedData && Array.isArray(parsedData.nodes) && typeof parsedData.connections === 'object') {
                    showCanvas.value = true;
                    nextTick(() => renderWorkflow(parsedData));
                } else {
                    statusMessage.value = 'Data is not a valid workflow object.';
                    showCanvas.value = false;
                }
            } catch (e) {
                statusMessage.value = 'Error: Invalid JSON format.';
                showCanvas.value = false;
            }
        } else {
            statusMessage.value = 'Waiting for data...';
            showCanvas.value = false;
        }
    }, { immediate: true, deep: true });

    return {
        canvas,
        statusMessage,
        showCanvas
    };
  }
};
</script>

<style scoped>
.n8n-visualizer-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: #1f2937;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.fallback-container {
    color: #9ca3af;
    font-family: 'Inter', sans-serif;
}
.workflow-canvas {
  width: 100%;
  height: 100%;
  background-color: #1f2937;
  background-image: radial-gradient(#4b5563 1px, transparent 1px);
  background-size: 24px 24px;
  cursor: grab;
  font-family: 'Inter', sans-serif;
}
.workflow-canvas:active {
  cursor: grabbing;
}
</style>
