<template>
  <svg ref="canvas" class="w-full h-full overflow-visible" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  workflow: Object,
})

const canvas = ref(null)
const SVG_NS = 'http://www.w3.org/2000/svg'
const NODE_WIDTH = 180
const NODE_HEIGHT = 80

watch(() => props.workflow, (workflow) => {
  if (workflow) {
    const nodes = workflow.type === 'n8n' ? parseN8n(workflow) : parseMake(workflow)
    const edges = buildEdges(nodes)
    renderWorkflow(nodes, edges)
  }
}, { immediate: true })

const renderWorkflow = (nodes, edges) => {
  if (!canvas.value) return
  canvas.value.innerHTML = ''

  const rootGroup = document.createElementNS(SVG_NS, 'g')
  canvas.value.appendChild(rootGroup)

  const nodeMap = new Map(nodes.map(node => [node.id, node]))

  const defs = document.createElementNS(SVG_NS, 'defs')
  defs.innerHTML = `
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="5" stdDeviation="10" flood-color="#52525b" flood-opacity="0.1" />
    </filter>
  `
  rootGroup.appendChild(defs)

  const edgeGroup = document.createElementNS(SVG_NS, 'g')
  const nodeGroup = document.createElementNS(SVG_NS, 'g')
  rootGroup.appendChild(edgeGroup)
  rootGroup.appendChild(nodeGroup)

  for (const node of nodes) {
    const group = document.createElementNS(SVG_NS, 'g')
    group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`)
    group.setAttribute('class', 'node-group-pro')

    const { color, iconPath } = getNodeStyle(node.type)

    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('width', NODE_WIDTH)
    rect.setAttribute('height', NODE_HEIGHT)
    rect.setAttribute('rx', 28)
    rect.setAttribute('class', 'node-body-pro')
    rect.style.fill = color
    rect.setAttribute('filter', 'url(#shadow)')
    group.appendChild(rect)

    const icon = document.createElementNS(SVG_NS, 'svg')
    icon.setAttribute('x', 22)
    icon.setAttribute('y', (NODE_HEIGHT - 28) / 2)
    icon.setAttribute('width', 28)
    icon.setAttribute('height', 28)
    icon.setAttribute('viewBox', '0 0 24 24')
    icon.innerHTML = `<path d="${iconPath}" fill="white"/>`
    group.appendChild(icon)

    const foreignObject = document.createElementNS(SVG_NS, 'foreignObject')
    foreignObject.setAttribute('x', 65)
    foreignObject.setAttribute('y', 0)
    foreignObject.setAttribute('width', 100)
    foreignObject.setAttribute('height', NODE_HEIGHT)

    const textDiv = document.createElement('div')
    textDiv.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
    textDiv.setAttribute('class', 'node-label-wrapper')
    textDiv.innerText = node.label
    foreignObject.appendChild(textDiv)

    group.appendChild(foreignObject)
    nodeGroup.appendChild(group)
  }

  for (const edge of edges) {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)
    if (!source || !target) continue

    const x1 = source.position.x + NODE_WIDTH
    const y1 = source.position.y + NODE_HEIGHT / 2
    const x2 = target.position.x
    const y2 = target.position.y + NODE_HEIGHT / 2

    const path = document.createElementNS(SVG_NS, 'path')
    const d = `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`
    path.setAttribute('d', d)
    path.setAttribute('class', 'edge-path-pro')
    path.setAttribute('stroke', '#cbd5e1')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('fill', 'none')
    edgeGroup.appendChild(path)
  }

  fitCanvasToContent(nodes, rootGroup)
  setupPanAndZoom(rootGroup)
}

const fitCanvasToContent = (nodes, group) => {
  if (!canvas.value || nodes.length === 0) return
  const padding = 100
  const xs = nodes.map(n => n.position.x)
  const ys = nodes.map(n => n.position.y)
  const xMin = Math.min(...xs) - padding
  const xMax = Math.max(...xs) + NODE_WIDTH + padding
  const yMin = Math.min(...ys) - padding
  const yMax = Math.max(...ys) + NODE_HEIGHT + padding
  canvas.value.setAttribute('viewBox', `${xMin} ${yMin} ${xMax - xMin} ${yMax - yMin}`)
}

const setupPanAndZoom = (group) => {
  let isPanning = false
  let startX = 0
  let startY = 0
  let panX = 0
  let panY = 0

  const onMouseDown = (e) => {
    isPanning = true
    startX = e.clientX
    startY = e.clientY
  }

  const onMouseMove = (e) => {
    if (!isPanning) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    group.setAttribute('transform', `translate(${panX + dx}, ${panY + dy})`)
  }

  const onMouseUp = (e) => {
    if (!isPanning) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    panX += dx
    panY += dy
    isPanning = false
  }

  canvas.value.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const getNodeStyle = (type) => {
  const styles = {
    http: { color: '#4f46e5', iconPath: 'M3 12l18 0M3 6l18 0M3 18l18 0' },
    function: { color: '#10b981', iconPath: 'M5 13l4 4L19 7' },
    delay: { color: '#f59e0b', iconPath: 'M12 6v6l4 2' },
    webhook: { color: '#ec4899', iconPath: 'M4 4h16v16H4z' },
    default: { color: '#6b7280', iconPath: 'M12 2l4 20-4-4-4 4z' },
  }
  return styles[type] || styles.default
}

const parseN8n = (workflow) => {
  const nodes = workflow.nodes || []
  return nodes.map((n, i) => ({
    id: n.id || `node-${i}`,
    type: n.type || 'default',
    label: n.name || n.type || `Node ${i + 1}`,
    position: n.position || { x: i * 250, y: 0 },
    connections: (workflow.connections[n.name] || []).map(c => ({
      source: n.id || `node-${i}`,
      target: c.node,
    })),
  }))
}

const parseMake = (workflow) => {
  const nodes = workflow.modules || []
  return nodes.map((n, i) => ({
    id: n.id,
    type: n.type || 'default',
    label: n.name || n.module || `Node ${i + 1}`,
    position: n.position || { x: i * 250, y: 0 },
    connections: (n.connections || []).map(c => ({
      source: n.id,
      target: c.target,
    })),
  }))
}

const buildEdges = (nodes) => {
  const edges = []
  for (const node of nodes) {
    for (const conn of node.connections || []) {
      edges.push({ source: conn.source, target: conn.target })
    }
  }
  return edges
}
</script>

<style scoped>
.node-group-pro {
  opacity: 1;
  transition: none !important;
  transform: none !important;
  animation: none !important;
}

.node-body-pro {
  stroke: rgba(0, 0, 0, 0.02);
  stroke-width: 1px;
}

.node-label-wrapper {
  color: white;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  line-height: 1.3;
  word-break: break-word;
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 5px;
}

.edge-path-pro {
  pointer-events: none;
}
</style>
