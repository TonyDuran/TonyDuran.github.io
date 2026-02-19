<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement>()

// ── State ──────────────────────────────────────────────
const BOARD_SIZE = 8
const SQUARE_SIZE = 1
const BOARD_OFFSET = (BOARD_SIZE * SQUARE_SIZE) / 2 - SQUARE_SIZE / 2

const status = ref<'idle' | 'running' | 'success' | 'stuck'>('idle')
const visitedCount = ref(0)
const totalSquares = BOARD_SIZE * BOARD_SIZE

// Board state: -1 = unvisited, 0+ = visit order
const board: number[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(-1))

// Three.js refs
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2
let animFrameId: number
let resizeObs: ResizeObserver

// Board square meshes [row][col]
const squareMeshes: THREE.Mesh[][] = []
// Knight mesh group
let knight: THREE.Group
let knightRow = -1
let knightCol = -1

// Animation state
let isAnimating = false
let tourPath: [number, number][] = []
let tourIndex = 0
let animProgress = 0
const MOVE_DURATION = 0.3 // seconds per hop
const PAUSE_DURATION = 0.1
let animPhase: 'move' | 'pause' = 'move'
let clock: THREE.Clock

// Trail line
let trailLine: THREE.Line
const trailPoints: THREE.Vector3[] = []

// Knight possible moves
const KNIGHT_MOVES = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
]

function inBounds(r: number, c: number) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

// ── Warnsdorff's Algorithm ─────────────────────────────
function solveTour(startRow: number, startCol: number): [number, number][] {
  const visited: boolean[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false))
  const path: [number, number][] = [[startRow, startCol]]
  visited[startRow][startCol] = true

  let cr = startRow, cc = startCol

  for (let step = 1; step < totalSquares; step++) {
    let bestDeg = 9
    let bestMoves: [number, number][] = []

    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = cr + dr, nc = cc + dc
      if (inBounds(nr, nc) && !visited[nr][nc]) {
        // Count onward moves from (nr, nc)
        let deg = 0
        for (const [dr2, dc2] of KNIGHT_MOVES) {
          const nnr = nr + dr2, nnc = nc + dc2
          if (inBounds(nnr, nnc) && !visited[nnr][nnc]) deg++
        }
        if (deg < bestDeg) {
          bestDeg = deg
          bestMoves = [[nr, nc]]
        } else if (deg === bestDeg) {
          bestMoves.push([nr, nc])
        }
      }
    }

    if (bestMoves.length === 0) break // stuck

    // Break ties: prefer move closer to center (improves success rate)
    const center = (BOARD_SIZE - 1) / 2
    bestMoves.sort((a, b) => {
      const distA = Math.abs(a[0] - center) + Math.abs(a[1] - center)
      const distB = Math.abs(b[0] - center) + Math.abs(b[1] - center)
      return distB - distA // prefer edges first (counter-intuitive but helps Warnsdorff)
    })

    const [nr, nc] = bestMoves[0]
    visited[nr][nc] = true
    path.push([nr, nc])
    cr = nr
    cc = nc
  }

  return path
}

// ── Board → World coordinate ───────────────────────────
function boardToWorld(row: number, col: number): THREE.Vector3 {
  return new THREE.Vector3(
    col * SQUARE_SIZE - BOARD_OFFSET,
    0,
    row * SQUARE_SIZE - BOARD_OFFSET
  )
}

// ── Create Knight Mesh ─────────────────────────────────
function createKnight(): THREE.Group {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.6,
    roughness: 0.3,
  })

  // Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 0.15, 16),
    material
  )
  base.position.y = 0.075
  group.add(base)

  // Body column
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.25, 0.5, 12),
    material
  )
  body.position.y = 0.4
  group.add(body)

  // Head (tilted sphere + snout)
  const headGroup = new THREE.Group()
  headGroup.position.y = 0.75

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 10),
    material
  )
  headGroup.add(head)

  // Snout / muzzle
  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.14, 0.25),
    material
  )
  snout.position.set(0, -0.05, 0.2)
  headGroup.add(snout)

  // Ears
  const earGeo = new THREE.ConeGeometry(0.06, 0.15, 4)
  const earL = new THREE.Mesh(earGeo, material)
  earL.position.set(-0.1, 0.18, 0)
  earL.rotation.z = 0.3
  headGroup.add(earL)

  const earR = new THREE.Mesh(earGeo, material)
  earR.position.set(0.1, 0.18, 0)
  earR.rotation.z = -0.3
  headGroup.add(earR)

  headGroup.rotation.x = -0.15
  group.add(headGroup)

  // Eyes (dark)
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
  const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8)
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
  eyeL.position.set(-0.1, 0.78, 0.16)
  group.add(eyeL)
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
  eyeR.position.set(0.1, 0.78, 0.16)
  group.add(eyeR)

  group.castShadow = true
  group.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).castShadow = true
    }
  })

  return group
}

// ── Color a square ─────────────────────────────────────
function colorSquare(row: number, col: number, state: 'default' | 'visited' | 'current') {
  const mesh = squareMeshes[row]?.[col]
  if (!mesh) return
  const mat = mesh.material as THREE.MeshStandardMaterial
  if (state === 'visited') {
    mat.color.set(0x2ecc71)
    mat.emissive.set(0x0a5c2a)
    mat.emissiveIntensity = 0.3
  } else if (state === 'current') {
    mat.color.set(0x27ae60)
    mat.emissive.set(0x1abc54)
    mat.emissiveIntensity = 0.5
  } else {
    const isLight = (row + col) % 2 === 0
    mat.color.set(isLight ? 0xf0d9b5 : 0x3b2716)
    mat.emissive.set(0x000000)
    mat.emissiveIntensity = 0
  }
}

// ── Reset ──────────────────────────────────────────────
function resetBoard() {
  isAnimating = false
  tourPath = []
  tourIndex = 0
  animProgress = 0
  visitedCount.value = 0
  status.value = 'idle'
  knightRow = -1
  knightCol = -1

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = -1
      colorSquare(r, c, 'default')
    }
  }

  if (knight) knight.visible = false

  // Clear trail
  if (trailLine) {
    trailPoints.length = 0
    const geo = trailLine.geometry as THREE.BufferGeometry
    geo.setFromPoints([new THREE.Vector3()])
    geo.attributes.position.needsUpdate = true
  }
}

// ── Handle click ───────────────────────────────────────
function onPointerDown(e: PointerEvent) {
  if (isAnimating) return

  const rect = containerRef.value!.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const allSquares = squareMeshes.flat()
  const intersects = raycaster.intersectObjects(allSquares)

  if (intersects.length > 0) {
    const hit = intersects[0].object as THREE.Mesh
    const row = hit.userData.row as number
    const col = hit.userData.col as number
    startTour(row, col)
  }
}

// ── Start tour from a square ───────────────────────────
function startTour(row: number, col: number) {
  resetBoard()

  tourPath = solveTour(row, col)
  if (tourPath.length === 0) return

  // Place knight at start
  const [sr, sc] = tourPath[0]
  const pos = boardToWorld(sr, sc)
  knight.position.set(pos.x, 0, pos.z)
  knight.visible = true
  knightRow = sr
  knightCol = sc

  // Mark first square
  board[sr][sc] = 0
  colorSquare(sr, sc, 'current')
  visitedCount.value = 1

  // Init trail
  trailPoints.length = 0
  trailPoints.push(new THREE.Vector3(pos.x, 0.06, pos.z))

  tourIndex = 0
  animProgress = 0
  animPhase = 'pause'
  isAnimating = true
  status.value = 'running'
  clock.getDelta() // reset delta
}

// ── Animate tour step ──────────────────────────────────
function updateTourAnimation(dt: number) {
  if (!isAnimating || tourPath.length < 2) return

  animProgress += dt

  if (animPhase === 'pause') {
    if (animProgress >= PAUSE_DURATION) {
      animProgress = 0
      animPhase = 'move'
      tourIndex++

      if (tourIndex >= tourPath.length) {
        // Tour finished
        isAnimating = false
        status.value = tourPath.length === totalSquares ? 'success' : 'stuck'
        return
      }
    }
    return
  }

  // Move phase
  const t = Math.min(animProgress / MOVE_DURATION, 1)
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // easeInOutQuad

  const [fromR, fromC] = tourPath[tourIndex - 1]
  const [toR, toC] = tourPath[tourIndex]
  const fromPos = boardToWorld(fromR, fromC)
  const toPos = boardToWorld(toR, toC)

  // Hop arc
  const hopHeight = 0.6
  const x = fromPos.x + (toPos.x - fromPos.x) * eased
  const z = fromPos.z + (toPos.z - fromPos.z) * eased
  const y = Math.sin(eased * Math.PI) * hopHeight

  knight.position.set(x, y, z)

  // Rotate knight to face movement direction
  const angle = Math.atan2(toPos.x - fromPos.x, toPos.z - fromPos.z)
  knight.rotation.y = angle

  if (t >= 1) {
    // Arrived
    knight.position.set(toPos.x, 0, toPos.z)
    knightRow = toR
    knightCol = toC

    // Mark previous as visited, current as current
    colorSquare(fromR, fromC, 'visited')
    board[toR][toC] = tourIndex
    colorSquare(toR, toC, 'current')
    visitedCount.value = tourIndex + 1

    // Extend trail
    trailPoints.push(new THREE.Vector3(toPos.x, 0.06, toPos.z))
    const geo = trailLine.geometry as THREE.BufferGeometry
    geo.setFromPoints(trailPoints)
    geo.attributes.position.needsUpdate = true

    animProgress = 0
    animPhase = 'pause'

    // Check if we're stuck (last step)
    if (tourIndex === tourPath.length - 1) {
      isAnimating = false
      status.value = tourPath.length === totalSquares ? 'success' : 'stuck'
    }
  }
}

// ── Init Scene ─────────────────────────────────────────
function initScene() {
  const container = containerRef.value!

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x1a1a2e)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  // Scene
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x1a1a2e, 12, 22)

  // Camera — angled overhead
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    50
  )
  camera.position.set(0, 8, 7)
  camera.lookAt(0, 0, 0)

  // Lights
  const ambient = new THREE.AmbientLight(0x404060, 0.6)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
  dirLight.position.set(5, 10, 5)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  dirLight.shadow.camera.near = 1
  dirLight.shadow.camera.far = 25
  dirLight.shadow.camera.left = -6
  dirLight.shadow.camera.right = 6
  dirLight.shadow.camera.top = 6
  dirLight.shadow.camera.bottom = -6
  scene.add(dirLight)

  const pointCyan = new THREE.PointLight(0x00ffff, 0.4, 15)
  pointCyan.position.set(-5, 5, -5)
  scene.add(pointCyan)

  const pointMagenta = new THREE.PointLight(0xff00ff, 0.3, 15)
  pointMagenta.position.set(5, 5, 5)
  scene.add(pointMagenta)

  // Raycaster
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Clock
  clock = new THREE.Clock()

  // ── Build Board ────────────────────────────────────
  const boardGroup = new THREE.Group()

  // Board frame (border)
  const frameGeo = new THREE.BoxGeometry(
    BOARD_SIZE * SQUARE_SIZE + 0.4,
    0.12,
    BOARD_SIZE * SQUARE_SIZE + 0.4
  )
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x2c1810,
    metalness: 0.3,
    roughness: 0.7,
  })
  const frame = new THREE.Mesh(frameGeo, frameMat)
  frame.position.y = -0.07
  frame.receiveShadow = true
  boardGroup.add(frame)

  for (let r = 0; r < BOARD_SIZE; r++) {
    squareMeshes[r] = []
    for (let c = 0; c < BOARD_SIZE; c++) {
      const isLight = (r + c) % 2 === 0
      const mat = new THREE.MeshStandardMaterial({
        color: isLight ? 0xf0d9b5 : 0x3b2716,
        metalness: 0.1,
        roughness: 0.8,
      })
      const geo = new THREE.BoxGeometry(SQUARE_SIZE * 0.98, 0.08, SQUARE_SIZE * 0.98)
      const mesh = new THREE.Mesh(geo, mat)
      const pos = boardToWorld(r, c)
      mesh.position.set(pos.x, 0, pos.z)
      mesh.receiveShadow = true
      mesh.userData = { row: r, col: c }
      boardGroup.add(mesh)
      squareMeshes[r][c] = mesh
    }
  }

  scene.add(boardGroup)

  // ── Coordinate labels ──────────────────────────────
  // (skip for now — kept minimal)

  // ── Knight ─────────────────────────────────────────
  knight = createKnight()
  knight.visible = false
  scene.add(knight)

  // ── Trail line ─────────────────────────────────────
  const trailMat = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    linewidth: 2,
    transparent: true,
    opacity: 0.7,
  })
  const trailGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3()])
  trailLine = new THREE.Line(trailGeo, trailMat)
  scene.add(trailLine)

  // ── Events ─────────────────────────────────────────
  renderer.domElement.addEventListener('pointerdown', onPointerDown)

  // ── Resize ─────────────────────────────────────────
  resizeObs = new ResizeObserver(() => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObs.observe(container)
}

// ── Camera orbit ───────────────────────────────────────
let cameraAngle = 0
const CAMERA_RADIUS = 10.5
const CAMERA_HEIGHT = 8
const CAMERA_SPEED = 0.08 // radians per second

function updateCamera(dt: number) {
  cameraAngle += CAMERA_SPEED * dt
  camera.position.x = Math.sin(cameraAngle) * CAMERA_RADIUS
  camera.position.z = Math.cos(cameraAngle) * CAMERA_RADIUS
  camera.position.y = CAMERA_HEIGHT + Math.sin(cameraAngle * 0.5) * 0.5
  camera.lookAt(0, 0, 0)
}

// ── Animation loop ─────────────────────────────────────
function animate() {
  animFrameId = requestAnimationFrame(animate)
  const dt = clock.getDelta()
  updateCamera(dt)
  updateTourAnimation(dt)
  renderer.render(scene, camera)
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  initScene()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
  renderer.domElement.removeEventListener('pointerdown', onPointerDown)
  if (resizeObs) resizeObs.disconnect()
  renderer.dispose()
  scene.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh
      m.geometry.dispose()
      if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose())
      else m.material.dispose()
    }
  })
})
</script>

<template>
  <div class="knights-tour-wrap">
    <div ref="containerRef" class="scene-canvas" />

    <div class="overlay-ui">
      <div class="status-bar">
        <span class="stat">
          Visited: <strong>{{ visitedCount }}</strong> / {{ totalSquares }}
        </span>
        <span v-if="status === 'idle'" class="hint">Click any square to start</span>
        <span v-else-if="status === 'running'" class="running">Knight is touring...</span>
        <span v-else-if="status === 'success'" class="success-msg">Complete tour!</span>
        <span v-else-if="status === 'stuck'" class="stuck-msg">
          Stuck at {{ visitedCount }} / {{ totalSquares }}
        </span>
      </div>
      <button v-if="status !== 'idle' && !isAnimating" class="reset-btn" @click="resetBoard">
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.knights-tour-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.scene-canvas {
  width: 100%;
  height: 100%;
}

.overlay-ui {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.85rem;
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(0, 255, 204, 0.25);
  border-radius: 6px;
  backdrop-filter: blur(6px);
  pointer-events: auto;
  font-size: 0.82rem;
  color: #ccc;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat strong {
  color: #2ecc71;
}

.hint {
  color: rgba(0, 255, 204, 0.7);
}

.running {
  color: #f1c40f;
}

.success-msg {
  color: #2ecc71;
  font-weight: 600;
}

.stuck-msg {
  color: #e74c3c;
}

.reset-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid rgba(0, 255, 204, 0.4);
  border-radius: 4px;
  background: rgba(0, 255, 204, 0.1);
  color: #00ffcc;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(0, 255, 204, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
}
</style>
