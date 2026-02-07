<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface SkillNode {
  id: string
  label: string
  short: string
  color: string
  baseX: number
  baseY: number
  phase: number
  speed: number
  amplitudeX: number
  amplitudeY: number
  href?: string // future: link to a project repo
}

const svgRef = ref<SVGSVGElement | null>(null)
const hoveredNode = ref<string | null>(null)
const draggedNode = ref<string | null>(null)
let animId: number | null = null
let startTime = 0

// --- Drag state ---
const dragDisp: Record<string, { x: number; y: number }> = {}
const stayDisplaced = new Set<string>()
let dragGrabOffset = { x: 0, y: 0 }
let dragStartScreen = { x: 0, y: 0 }
let wasDragged = false
const DRAG_THRESHOLD = 5

// --- Pause state (freeze floating on hover/drag) ---
const nodeTimeOffset: Record<string, number> = {}
const nodePauseStart: Record<string, number> = {}

function pauseNode(nodeId: string, elapsed: number) {
  if (nodePauseStart[nodeId] === undefined) {
    nodePauseStart[nodeId] = elapsed
  }
}

function resumeNode(nodeId: string, elapsed: number) {
  if (nodePauseStart[nodeId] !== undefined) {
    const dur = elapsed - nodePauseStart[nodeId]
    nodeTimeOffset[nodeId] = (nodeTimeOffset[nodeId] ?? 0) + dur
    delete nodePauseStart[nodeId]
  }
}

function getNodeElapsed(nodeId: string, elapsed: number): number {
  let adj = elapsed - (nodeTimeOffset[nodeId] ?? 0)
  if (nodePauseStart[nodeId] !== undefined) {
    adj -= (elapsed - nodePauseStart[nodeId])
  }
  return adj
}

// --- Spring physics state ---
const springOffset: Record<string, { x: number; y: number }> = {}
const SPRING_K = 0.004
const SPRING_DAMP = 0.96

// --- Data (amplitudes increased for more visible movement) ---
const nodes: SkillNode[] = [
  { id: 'python',     label: 'Python',     short: 'Py',  color: '#FFD43B', baseX: 200, baseY: 50,  phase: 0,   speed: 0.8,  amplitudeX: 8,  amplitudeY: 6 },
  { id: 'typescript', label: 'TypeScript', short: 'TS',  color: '#3178C6', baseX: 90,  baseY: 160, phase: 1.2, speed: 0.6,  amplitudeX: 9,  amplitudeY: 7 },
  { id: 'go',         label: 'Go',         short: 'Go',  color: '#00ADD8', baseX: 310, baseY: 155, phase: 2.5, speed: 0.7,  amplitudeX: 7,  amplitudeY: 9 },
  { id: 'javascript', label: 'JavaScript', short: 'JS',  color: '#F7DF1E', baseX: 45,  baseY: 275, phase: 0.8, speed: 0.9,  amplitudeX: 8,  amplitudeY: 6 },
  { id: 'rust',       label: 'Rust',       short: 'Rs',  color: '#CE422B', baseX: 200, baseY: 270, phase: 3.1, speed: 0.5,  amplitudeX: 7,  amplitudeY: 8 },
  { id: 'cpp',        label: 'C++',        short: 'C++', color: '#659AD2', baseX: 345, baseY: 270, phase: 1.8, speed: 0.65, amplitudeX: 6,  amplitudeY: 9 },
  { id: 'java',       label: 'Java',       short: 'Jv',  color: '#ED8B00', baseX: 110, baseY: 385, phase: 2.2, speed: 0.75, amplitudeX: 9,  amplitudeY: 6 },
  { id: 'c',          label: 'C',          short: 'C',   color: '#A8B9CC', baseX: 290, baseY: 385, phase: 0.5, speed: 0.55, amplitudeX: 7,  amplitudeY: 8 },
]

const edges = [
  { from: 'python', to: 'typescript' },
  { from: 'python', to: 'go' },
  { from: 'typescript', to: 'javascript' },
  { from: 'typescript', to: 'rust' },
  { from: 'go', to: 'cpp' },
  { from: 'go', to: 'rust' },
  { from: 'javascript', to: 'java' },
  { from: 'cpp', to: 'c' },
  { from: 'rust', to: 'c' },
]

// Pre-compute adjacency list for spring physics
const adjacency: Record<string, string[]> = {}
for (const n of nodes) adjacency[n.id] = []
for (const e of edges) {
  adjacency[e.from].push(e.to)
  adjacency[e.to].push(e.from)
}

// Animated positions
const positions = ref<Record<string, { x: number; y: number }>>({})
const hasDisplaced = ref(false)

// --- Coordinate conversion: screen → SVG viewBox space ---
function screenToSVG(clientX: number, clientY: number): { x: number; y: number } {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

// --- Natural position at node-local time ---
function calcNaturalPos(n: SkillNode, nodeElapsed: number) {
  const t = nodeElapsed * n.speed + n.phase
  return {
    x: n.baseX + Math.sin(t) * n.amplitudeX + Math.cos(t * 0.7) * n.amplitudeX * 0.5,
    y: n.baseY + Math.cos(t) * n.amplitudeY + Math.sin(t * 0.6) * n.amplitudeY * 0.3,
  }
}

// --- Animation loop ---
function updatePositions(time: number) {
  const elapsed = (time - startTime) / 1000
  const prevPositions = positions.value
  const p: Record<string, { x: number; y: number }> = {}

  for (const n of nodes) {
    // Pause floating when hovered or being dragged
    const shouldPause = hoveredNode.value === n.id || draggedNode.value === n.id
    if (shouldPause) {
      pauseNode(n.id, elapsed)
    } else {
      resumeNode(n.id, elapsed)
    }

    const nodeElapsed = getNodeElapsed(n.id, elapsed)
    const nat = calcNaturalPos(n, nodeElapsed)
    const d = dragDisp[n.id]
    const so = springOffset[n.id] || (springOffset[n.id] = { x: 0, y: 0 })

    // Handle displacement decay
    if (d && draggedNode.value !== n.id) {
      if (stayDisplaced.has(n.id)) {
        // Stay in place
      } else {
        d.x *= 0.94
        d.y *= 0.94
        if (Math.abs(d.x) < 0.3 && Math.abs(d.y) < 0.3) {
          delete dragDisp[n.id]
        }
      }
    }

    // Spring physics: pull toward connected neighbors
    if (draggedNode.value !== n.id) {
      let tugX = 0
      let tugY = 0
      const myX = nat.x + so.x + (d?.x ?? 0)
      const myY = nat.y + so.y + (d?.y ?? 0)
      const neighbors = adjacency[n.id]

      for (const otherId of neighbors) {
        const other = prevPositions[otherId]
        if (!other) continue
        tugX += (other.x - myX) * SPRING_K
        tugY += (other.y - myY) * SPRING_K
      }

      so.x = (so.x + tugX) * SPRING_DAMP
      so.y = (so.y + tugY) * SPRING_DAMP
    }

    p[n.id] = {
      x: nat.x + so.x + (d?.x ?? 0),
      y: nat.y + so.y + (d?.y ?? 0),
    }
  }

  hasDisplaced.value = stayDisplaced.size > 0
  positions.value = p
  animId = requestAnimationFrame(updatePositions)
}

// --- Event handlers ---
function onNodePointerDown(nodeId: string, event: MouseEvent | TouchEvent) {
  event.preventDefault()
  draggedNode.value = nodeId
  hoveredNode.value = nodeId
  wasDragged = false

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  dragStartScreen = { x: clientX, y: clientY }

  const svgPt = screenToSVG(clientX, clientY)
  const currentPos = positions.value[nodeId]
  if (currentPos) {
    dragGrabOffset = { x: svgPt.x - currentPos.x, y: svgPt.y - currentPos.y }
  }
}

function onPointerMove(event: MouseEvent | TouchEvent) {
  if (!draggedNode.value) return

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  const dx = clientX - dragStartScreen.x
  const dy = clientY - dragStartScreen.y
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
    wasDragged = true
  }

  if (!wasDragged) return

  const svgPt = screenToSVG(clientX, clientY)
  const node = nodes.find(n => n.id === draggedNode.value)
  if (!node) return

  const targetX = svgPt.x - dragGrabOffset.x
  const targetY = svgPt.y - dragGrabOffset.y

  const globalElapsed = (performance.now() - startTime) / 1000
  const nodeElapsed = getNodeElapsed(node.id, globalElapsed)
  const nat = calcNaturalPos(node, nodeElapsed)
  const so = springOffset[node.id] || { x: 0, y: 0 }

  dragDisp[draggedNode.value] = {
    x: targetX - nat.x - so.x,
    y: targetY - nat.y - so.y,
  }
}

function onPointerUp(event: MouseEvent | TouchEvent) {
  if (draggedNode.value) {
    if (wasDragged) {
      stayDisplaced.add(draggedNode.value)
    } else {
      const isShift = 'shiftKey' in event && event.shiftKey
      if (isShift) {
        stayDisplaced.clear()
      } else if (stayDisplaced.has(draggedNode.value)) {
        stayDisplaced.delete(draggedNode.value)
      }
    }
  }
  draggedNode.value = null
}

function onNodeMouseLeave(nodeId: string) {
  if (draggedNode.value !== nodeId) hoveredNode.value = null
}

function isEdgeActive(from: string, to: string): boolean {
  const active = hoveredNode.value || draggedNode.value
  return active === from || active === to
}

onMounted(() => {
  startTime = performance.now()
  const init: Record<string, { x: number; y: number }> = {}
  for (const n of nodes) {
    init[n.id] = { x: n.baseX, y: n.baseY }
  }
  positions.value = init
  animId = requestAnimationFrame(updatePositions)

  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchmove', onPointerMove, { passive: false })
  window.addEventListener('touchend', onPointerUp)
})

onUnmounted(() => {
  if (animId !== null) cancelAnimationFrame(animId)
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('touchend', onPointerUp)
})
</script>

<template>
  <div class="skill-graph-wrapper">
    <svg
      ref="svgRef"
      viewBox="0 0 400 440"
      class="skill-graph"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="line-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Edges -->
      <line
        v-for="edge in edges"
        :key="`${edge.from}-${edge.to}`"
        :x1="positions[edge.from]?.x"
        :y1="positions[edge.from]?.y"
        :x2="positions[edge.to]?.x"
        :y2="positions[edge.to]?.y"
        class="edge"
        :class="{ 'edge-active': isEdgeActive(edge.from, edge.to) }"
        filter="url(#line-glow)"
      />

      <!-- Nodes -->
      <g
        v-for="node in nodes"
        :key="node.id"
        class="node-group"
        :class="{
          hovered: hoveredNode === node.id,
          dragging: draggedNode === node.id,
          displaced: stayDisplaced.has(node.id),
        }"
        @mouseenter="hoveredNode = node.id"
        @mouseleave="onNodeMouseLeave(node.id)"
        @mousedown="onNodePointerDown(node.id, $event)"
        @touchstart="onNodePointerDown(node.id, $event)"
      >
        <!-- Outer glow ring -->
        <circle
          :cx="positions[node.id]?.x"
          :cy="positions[node.id]?.y"
          :r="hoveredNode === node.id ? 28 : 20"
          :fill="node.color"
          fill-opacity="0.06"
          :stroke="node.color"
          stroke-width="1"
          stroke-opacity="0.25"
          filter="url(#node-glow)"
          class="node-outer"
        />

        <!-- Core circle -->
        <circle
          :cx="positions[node.id]?.x"
          :cy="positions[node.id]?.y"
          :r="hoveredNode === node.id ? 22 : 16"
          class="node-core"
          :stroke="node.color"
          stroke-width="2"
        />

        <!-- Short label -->
        <text
          :x="positions[node.id]?.x"
          :y="(positions[node.id]?.y ?? 0) + 1"
          text-anchor="middle"
          dominant-baseline="middle"
          :fill="node.color"
          font-size="10"
          font-weight="700"
          class="node-short"
        >{{ node.short }}</text>

        <!-- Full label (on hover or drag) -->
        <text
          v-if="hoveredNode === node.id || draggedNode === node.id"
          :x="positions[node.id]?.x"
          :y="(positions[node.id]?.y ?? 0) + 38"
          text-anchor="middle"
          dominant-baseline="middle"
          :fill="node.color"
          font-size="12"
          font-weight="600"
          class="node-label"
        >{{ node.label }}</text>
      </g>
    </svg>

    <p class="graph-hint">
      <span>drag to rearrange · click to snap back</span>
      <span v-if="hasDisplaced" class="hint-reset"> · shift+click resets all</span>
    </p>
  </div>
</template>

<style scoped>
.skill-graph-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.skill-graph {
  width: 100%;
  height: 100%;
  max-height: 500px;
  font-family: 'Courier New', Consolas, monospace;
  user-select: none;
}

/* Edges */
.edge {
  stroke: var(--accent-primary);
  stroke-width: 1;
  stroke-opacity: 0.15;
  transition: stroke-opacity 0.3s ease, stroke-width 0.3s ease;
}

.edge-active {
  stroke-opacity: 0.5;
  stroke-width: 1.5;
}

/* Nodes */
.node-group {
  cursor: grab;
}

.node-group.dragging {
  cursor: grabbing;
}

.node-group.displaced {
  cursor: pointer;
}

.node-outer,
.node-core {
  transition: r 0.3s ease, fill-opacity 0.3s ease, stroke-opacity 0.3s ease;
}

.node-core {
  fill: var(--bg-primary);
  fill-opacity: 0.9;
}

.node-group.hovered .node-core,
.node-group.dragging .node-core {
  stroke-width: 2.5;
}

.node-short {
  pointer-events: none;
}

.node-label {
  pointer-events: none;
  filter: url(#node-glow);
}

/* Hint text */
.graph-hint {
  text-align: center;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0.75rem 0 0;
  opacity: 0.5;
  font-family: 'Courier New', Consolas, monospace;
  letter-spacing: 0.5px;
}

.hint-reset {
  color: var(--accent-primary);
  opacity: 0.8;
}
</style>
