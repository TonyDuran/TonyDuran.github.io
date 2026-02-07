<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{ theme: string }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId: number | null = null

// Theme-driven color palettes (avoids parsing CSS variable rgba strings)
const palette = computed(() => {
  if (props.theme === 'light') {
    return {
      primary: [0, 122, 138],     // deep teal — visible on warm cream
      secondary: [184, 51, 106],   // warm rose-magenta
      bg: [253, 240, 213],         // warm cream (#fdf0d5)
      trailAlpha: 0.07,
    }
  }
  return {
    primary: [0, 255, 255],
    secondary: [255, 0, 255],
    bg: [10, 14, 39],
    trailAlpha: 0.045,
  }
})

// --- Shape system ---
interface GeoShape {
  z: number           // depth: 0 = vanishing point, 1 = at viewer
  zSpeed: number      // base speed
  angle: number       // direction from vanishing point (radians)
  angleDrift: number  // slow angular drift (rad/s)
  rotation: number    // shape's own spin (radians)
  rotSpeed: number    // spin speed (rad/s)
  tiltX: number       // 3D tumble angle around X axis
  tiltY: number       // 3D tumble angle around Y axis
  tiltXSpeed: number
  tiltYSpeed: number
  sides: number
  baseRadius: number  // size at z=1
  colorIdx: number    // 0 = primary, 1 = secondary
}

const SHAPE_COUNT = 18
const VP_X = 0.65   // vanishing point — off-center right
const VP_Y = 0.42   // slightly above center

let shapes: GeoShape[] = []

function spawnShape(partial?: Partial<GeoShape>): GeoShape {
  return {
    z: partial?.z ?? Math.random() * 0.15,
    zSpeed: 0.06 + Math.random() * 0.08,
    angle: Math.random() * Math.PI * 2,
    angleDrift: (Math.random() - 0.5) * 0.05,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.4,
    tiltX: Math.random() * Math.PI * 2,
    tiltY: Math.random() * Math.PI * 2,
    tiltXSpeed: (Math.random() - 0.5) * 0.25,
    tiltYSpeed: (Math.random() - 0.5) * 0.25,
    sides: 3 + Math.floor(Math.random() * 6), // 3-8
    baseRadius: 50 + Math.random() * 120,
    colorIdx: Math.random() > 0.5 ? 1 : 0,
    ...partial,
  }
}

function initShapes() {
  shapes = Array.from({ length: SHAPE_COUNT }, () =>
    spawnShape({ z: Math.random() * 0.9 }) // spread across depth initially
  )
}

// --- Drawing ---
function rgba(rgb: number[], a: number): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
}

function drawPoly3D(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, sides: number,
  rotation: number, tiltX: number, tiltY: number,
  color: string, lineWidth: number,
  fill = false,
) {
  const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX)
  const cosY = Math.cos(tiltY), sinY = Math.sin(tiltY)

  ctx.beginPath()
  for (let i = 0; i <= sides; i++) {
    const a = rotation + (Math.PI * 2 * i) / sides
    const px = radius * Math.cos(a)
    const py = radius * Math.sin(a)

    // Rotate around X axis, then Y axis for 3D tumble
    const y1 = py * cosX
    const z1 = py * sinX
    const x1 = px * cosY + z1 * sinY

    if (i === 0) ctx.moveTo(cx + x1, cy + y1)
    else ctx.lineTo(cx + x1, cy + y1)
  }
  ctx.closePath()

  if (fill) {
    ctx.fillStyle = color
    ctx.fill()
  } else {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

function drawGlowShape(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, sides: number,
  rotation: number, tiltX: number, tiltY: number,
  rgb: number[], intensity: number,
) {
  // Faint inner fill for closer shapes — adds depth and solidity
  if (intensity > 0.3) {
    drawPoly3D(ctx, cx, cy, radius, sides, rotation, tiltX, tiltY, rgba(rgb, intensity * 0.04), 0, true)
  }
  // Outer bloom
  drawPoly3D(ctx, cx, cy, radius, sides, rotation, tiltX, tiltY, rgba(rgb, intensity * 0.08), 24)
  // Mid glow
  drawPoly3D(ctx, cx, cy, radius, sides, rotation, tiltX, tiltY, rgba(rgb, intensity * 0.2), 8)
  // Core edge
  drawPoly3D(ctx, cx, cy, radius, sides, rotation, tiltX, tiltY, rgba(rgb, intensity * 0.7), 2)
  // Hot center line
  drawPoly3D(ctx, cx, cy, radius, sides, rotation, tiltX, tiltY, rgba([255, 255, 255], intensity * 0.15), 1)
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) {
  const p = palette.value
  const vpX = VP_X * w
  const vpY = VP_Y * h
  const maxSpread = Math.sqrt(w * w + h * h) * 0.7

  // Motion trail: semi-transparent fill instead of full clear
  ctx.fillStyle = rgba(p.bg, p.trailAlpha)
  ctx.fillRect(0, 0, w, h)

  // Sort shapes by depth so far shapes draw first (painter's order)
  const sorted = [...shapes].sort((a, b) => a.z - b.z)

  for (const s of sorted) {
    // Update with perspective acceleration — shapes speed up as they approach
    s.z += s.zSpeed * (1 + s.z * 2) * dt
    s.angle += s.angleDrift * dt
    s.rotation += s.rotSpeed * dt
    s.tiltX += s.tiltXSpeed * dt
    s.tiltY += s.tiltYSpeed * dt

    // Respawn when past viewer
    if (s.z > 1.3) {
      Object.assign(s, spawnShape({ z: -0.05 }))
      continue
    }

    // Skip if not yet "visible"
    if (s.z < 0) continue

    // Project to screen
    const spread = s.z * maxSpread
    const screenX = vpX + Math.cos(s.angle) * spread
    const screenY = vpY + Math.sin(s.angle) * spread
    const size = s.baseRadius * s.z * (Math.min(w, h) / 900)

    // Intensity ramps up with depth: faint far away, bright close
    const intensity = Math.min(1, s.z * s.z * 1.5)

    // Don't draw if too tiny or off screen by a lot
    if (size < 2) continue

    const rgb = s.colorIdx === 0 ? p.primary : p.secondary
    drawGlowShape(ctx, screenX, screenY, size, s.sides, s.rotation, s.tiltX, s.tiltY, rgb, intensity)
  }
}

// --- Canvas lifecycle ---
function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

let lastTime = 0

function animate(now: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (!lastTime) lastTime = now
  const dt = Math.min((now - lastTime) / 1000, 0.1) // cap dt to avoid jumps
  lastTime = now

  draw(ctx, canvas.width, canvas.height, dt)
  animId = requestAnimationFrame(animate)
}

// Clear trail buffer on theme switch so old colors don't linger
watch(() => props.theme, () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
})

onMounted(() => {
  initShapes()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId !== null) cancelAnimationFrame(animId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <canvas ref="canvasRef" class="spiral-background"></canvas>
</template>

<style scoped>
.spiral-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
