<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let animId: number | null = null
let clock: THREE.Clock
let resizeObserver: ResizeObserver | null = null

// --- Character groups ---
let builderGroup: THREE.Group
let gorillaGroup: THREE.Group

// --- City state ---
interface Building {
  mesh: THREE.Group
  mainMesh: THREE.Mesh
  targetHeight: number
  currentHeight: number
  state: 'building' | 'standing' | 'breaking' | 'rubble'
  stateTimer: number
  gridX: number
  gridZ: number
}

const buildings: Building[] = []
const GRID_SIZE = 8
const SPACING = 3

// --- Materials ---
const neonCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff })
const neonMagenta = new THREE.MeshBasicMaterial({ color: 0xff00ff })
const neonYellow = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
const edgeMagenta = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.6 })

// Building colors
const builtColor = new THREE.Color(0x1a4a5a) // teal-tinted — "lit up"
const darkColor = new THREE.Color(0x0a0e18)  // near-black — "broken/dark"

// --- Build a low-poly blocky humanoid (builder) ---
function createBuilder(): THREE.Group {
  const g = new THREE.Group()

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), neonCyan.clone())
  body.position.y = 1.6
  g.add(body)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), neonCyan.clone())
  head.position.y = 2.55
  g.add(head)

  const hat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.15, 0.65), neonYellow.clone())
  hat.position.y = 2.88
  g.add(hat)

  const armGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25)
  const leftArm = new THREE.Mesh(armGeo, neonCyan.clone())
  leftArm.position.set(-0.65, 1.6, 0)
  g.add(leftArm)
  const rightArm = new THREE.Mesh(armGeo, neonCyan.clone())
  rightArm.position.set(0.65, 1.6, 0)
  g.add(rightArm)

  const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3)
  const leftLeg = new THREE.Mesh(legGeo, neonCyan.clone())
  leftLeg.position.set(-0.22, 0.5, 0)
  g.add(leftLeg)
  const rightLeg = new THREE.Mesh(legGeo, neonCyan.clone())
  rightLeg.position.set(0.22, 0.5, 0)
  g.add(rightLeg)

  g.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const wireGeo = new THREE.EdgesGeometry(child.geometry)
      const wire = new THREE.LineSegments(wireGeo, edgeMat.clone())
      child.add(wire)
      ;(child.material as THREE.MeshBasicMaterial).transparent = true
      ;(child.material as THREE.MeshBasicMaterial).opacity = 0.3
    }
  })

  g.scale.setScalar(0.8)
  return g
}

// --- Build a low-poly blocky gorilla (breaker) ---
function createGorilla(): THREE.Group {
  const g = new THREE.Group()

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 0.8), neonMagenta.clone())
  body.position.y = 1.65
  g.add(body)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.6), neonMagenta.clone())
  head.position.y = 2.65
  g.add(head)

  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.35), neonMagenta.clone())
  brow.position.set(0, 2.9, 0.2)
  g.add(brow)

  const armGeo = new THREE.BoxGeometry(0.4, 1.4, 0.4)
  const leftArm = new THREE.Mesh(armGeo, neonMagenta.clone())
  leftArm.position.set(-1.05, 1.3, 0)
  g.add(leftArm)
  const rightArm = new THREE.Mesh(armGeo, neonMagenta.clone())
  rightArm.position.set(1.05, 1.3, 0)
  g.add(rightArm)

  const fistGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45)
  const leftFist = new THREE.Mesh(fistGeo, neonMagenta.clone())
  leftFist.position.set(-1.05, 0.45, 0)
  g.add(leftFist)
  const rightFist = new THREE.Mesh(fistGeo, neonMagenta.clone())
  rightFist.position.set(1.05, 0.45, 0)
  g.add(rightFist)

  const legGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4)
  const leftLeg = new THREE.Mesh(legGeo, neonMagenta.clone())
  leftLeg.position.set(-0.35, 0.4, 0)
  g.add(leftLeg)
  const rightLeg = new THREE.Mesh(legGeo, neonMagenta.clone())
  rightLeg.position.set(0.35, 0.4, 0)
  g.add(rightLeg)

  g.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const wireGeo = new THREE.EdgesGeometry(child.geometry)
      const wire = new THREE.LineSegments(wireGeo, edgeMagenta.clone())
      child.add(wire)
      ;(child.material as THREE.MeshBasicMaterial).transparent = true
      ;(child.material as THREE.MeshBasicMaterial).opacity = 0.3
    }
  })

  g.scale.setScalar(0.8)
  return g
}

// --- Create a building at grid position ---
function createBuilding(gridX: number, gridZ: number): Building {
  const group = new THREE.Group()
  const width = 1.2 + Math.random() * 0.8
  const depth = 1.2 + Math.random() * 0.8
  const targetHeight = 2 + Math.random() * 6

  const geo = new THREE.BoxGeometry(width, 1, depth)
  const mat = new THREE.MeshStandardMaterial({ color: darkColor.clone() })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.y = 0.5
  group.add(mesh)

  const wireGeo = new THREE.EdgesGeometry(geo)
  const wireMat = edgeMat.clone()
  wireMat.opacity = 0.3
  const wire = new THREE.LineSegments(wireGeo, wireMat)
  mesh.add(wire)

  // Windows
  const windowCount = Math.floor(targetHeight * 1.5)
  for (let i = 0; i < windowCount; i++) {
    const winGeo = new THREE.PlaneGeometry(0.15, 0.1)
    const winMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 })
    const win = new THREE.Mesh(winGeo, winMat)

    const side = Math.floor(Math.random() * 4)
    const yPos = 0.3 + Math.random() * 0.4
    const xOff = (Math.random() - 0.5) * width * 0.6

    if (side === 0) { win.position.set(xOff, yPos, depth / 2 + 0.01) }
    else if (side === 1) { win.position.set(xOff, yPos, -depth / 2 - 0.01); win.rotation.y = Math.PI }
    else if (side === 2) { win.position.set(width / 2 + 0.01, yPos, xOff); win.rotation.y = Math.PI / 2 }
    else { win.position.set(-width / 2 - 0.01, yPos, xOff); win.rotation.y = -Math.PI / 2 }

    mesh.add(win)
  }

  const worldX = (gridX - GRID_SIZE / 2) * SPACING
  const worldZ = (gridZ - GRID_SIZE / 2) * SPACING
  group.position.set(worldX, 0, worldZ)

  scene.add(group)

  return {
    mesh: group,
    mainMesh: mesh,
    targetHeight,
    currentHeight: 0.1,
    state: 'building',
    stateTimer: 0,
    gridX,
    gridZ,
  }
}

// Set building color and window glow based on state
function setBuildingLit(b: Building, lit: boolean) {
  const mat = b.mainMesh.material as THREE.MeshStandardMaterial
  mat.color.copy(lit ? builtColor : darkColor)

  // Find wire edges and set opacity
  const wire = b.mainMesh.children.find(c => c instanceof THREE.LineSegments) as THREE.LineSegments | undefined
  if (wire) {
    const wMat = wire.material as THREE.LineBasicMaterial
    wMat.color.setHex(lit ? 0x00ffff : 0x1a1f3a)
    wMat.opacity = lit ? 0.6 : 0.15
  }

  // Windows glow when lit
  b.mainMesh.children.forEach(c => {
    if (c instanceof THREE.Mesh && c !== b.mainMesh && c.geometry.type === 'PlaneGeometry') {
      const wm = c.material as THREE.MeshBasicMaterial
      wm.opacity = lit ? 0.8 : 0
    }
  })
}

// --- Gorilla state machine ---
type GorillaPhase = 'walking' | 'jumping' | 'landing' | 'idle'
let gorillaPhase: GorillaPhase = 'idle'
let gorillaTarget: Building | null = null
let gorillaJumpTimer = 0
const JUMP_DURATION = 0.6
const JUMP_HEIGHT = 4

// --- Animation ---
let builderWaitTimer = 0
let gorillaWaitTimer = 2

function updateScene(dt: number) {
  const time = clock.getElapsedTime()

  // --- Animate Builder ---
  if (builderWaitTimer > 0) {
    builderWaitTimer -= dt
  } else {
    const toBuild = buildings.filter(b => b.state === 'rubble' || b.state === 'building')
    if (toBuild.length === 0) {
      // All standing — pick one to make rubble
      const candidates = buildings.filter(b => b.state === 'standing')
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        pick.state = 'rubble'
        pick.currentHeight = 0.1
        setBuildingLit(pick, false)
      }
    }

    const target = buildings.find(b => b.state === 'building') || buildings.find(b => b.state === 'rubble')
    if (target) {
      if (target.state === 'rubble') {
        target.state = 'building'
        target.currentHeight = 0.1
      }

      const tx = (target.gridX - GRID_SIZE / 2) * SPACING - 1.5
      const tz = (target.gridZ - GRID_SIZE / 2) * SPACING
      const dx = tx - builderGroup.position.x
      const dz = tz - builderGroup.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist > 0.3) {
        const speed = 3
        builderGroup.position.x += (dx / dist) * speed * dt
        builderGroup.position.z += (dz / dist) * speed * dt
        builderGroup.lookAt(new THREE.Vector3(tx, 0, tz))
        builderGroup.position.y = Math.abs(Math.sin(time * 8)) * 0.15
      } else {
        target.currentHeight = Math.min(target.currentHeight + dt * 1.5, target.targetHeight)

        // Gradually light up the building as it's built
        const progress = target.currentHeight / target.targetHeight
        const mat = target.mainMesh.material as THREE.MeshStandardMaterial
        mat.color.lerpColors(darkColor, builtColor, progress)

        if (target.currentHeight >= target.targetHeight) {
          target.state = 'standing'
          target.stateTimer = 0
          setBuildingLit(target, true)
          builderWaitTimer = 0.5
        }
        builderGroup.children[4].rotation.x = Math.sin(time * 12) * 0.5
      }
    }
  }

  // --- Animate Gorilla (jump on buildings) ---
  if (gorillaWaitTimer > 0) {
    gorillaWaitTimer -= dt
    gorillaGroup.position.y = 0
  } else if (gorillaPhase === 'idle') {
    // Find a standing building to target
    const candidates = buildings.filter(b => b.state === 'standing' && b.stateTimer > 2.5)
    if (candidates.length > 0) {
      gorillaTarget = candidates[Math.floor(Math.random() * candidates.length)]
      gorillaPhase = 'walking'
    } else {
      // Idle animation — pound chest
      gorillaGroup.position.y = 0
      gorillaGroup.children[3].rotation.x = Math.sin(time * 6) * 0.3
      gorillaGroup.children[4].rotation.x = Math.sin(time * 6 + Math.PI) * 0.3
    }
  } else if (gorillaPhase === 'walking' && gorillaTarget) {
    const tx = (gorillaTarget.gridX - GRID_SIZE / 2) * SPACING
    const tz = (gorillaTarget.gridZ - GRID_SIZE / 2) * SPACING
    const dx = tx - gorillaGroup.position.x
    const dz = tz - gorillaGroup.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist > 0.5) {
      const speed = 2.5
      gorillaGroup.position.x += (dx / dist) * speed * dt
      gorillaGroup.position.z += (dz / dist) * speed * dt
      gorillaGroup.lookAt(new THREE.Vector3(tx, 0, tz))
      gorillaGroup.position.y = Math.abs(Math.sin(time * 5)) * 0.2
      gorillaGroup.rotation.z = Math.sin(time * 4) * 0.05
    } else {
      // Arrived — start jump
      gorillaPhase = 'jumping'
      gorillaJumpTimer = 0
      gorillaGroup.rotation.z = 0
    }
  } else if (gorillaPhase === 'jumping' && gorillaTarget) {
    gorillaJumpTimer += dt
    const t = Math.min(gorillaJumpTimer / JUMP_DURATION, 1)

    // Parabolic arc: up then down
    const jumpY = JUMP_HEIGHT * 4 * t * (1 - t)
    const landingY = gorillaTarget.currentHeight * 0.8
    gorillaGroup.position.y = jumpY + (t > 0.5 ? (t - 0.5) * 2 * landingY : 0)

    // Arms up during jump
    gorillaGroup.children[3].rotation.x = -1.5
    gorillaGroup.children[4].rotation.x = -1.5

    if (t >= 1) {
      gorillaPhase = 'landing'
      gorillaJumpTimer = 0
    }
  } else if (gorillaPhase === 'landing' && gorillaTarget) {
    // Slam! Building goes dark
    gorillaTarget.state = 'rubble'
    gorillaTarget.currentHeight = Math.max(gorillaTarget.targetHeight * 0.3, 1)
    setBuildingLit(gorillaTarget, false)

    // Arms slam down
    gorillaGroup.children[3].rotation.x = 0.8
    gorillaGroup.children[4].rotation.x = 0.8

    gorillaGroup.position.y = gorillaTarget.currentHeight * 0.5
    gorillaTarget = null
    gorillaPhase = 'idle'
    gorillaWaitTimer = 2
  }

  // --- Update building visuals ---
  for (const b of buildings) {
    if (b.state === 'standing') {
      b.stateTimer += dt
    }
    b.mainMesh.scale.y = Math.max(b.currentHeight, 0.1)
    b.mainMesh.position.y = b.mainMesh.scale.y * 0.5
  }

  // Slow camera orbit
  const camAngle = time * 0.08
  const camRadius = 20
  camera.position.x = Math.cos(camAngle) * camRadius
  camera.position.z = Math.sin(camAngle) * camRadius
  camera.position.y = 10 + Math.sin(time * 0.15) * 2
  camera.lookAt(0, 2, 0)
}

function initScene() {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x050510, 0.025)

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(15, 10, 15)
  camera.lookAt(0, 2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x050510)
  container.appendChild(renderer.domElement)

  clock = new THREE.Clock()

  // Lighting
  const ambient = new THREE.AmbientLight(0x222244, 0.5)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0x00ffff, 0.3)
  dirLight.position.set(5, 10, 5)
  scene.add(dirLight)

  const pointMagenta = new THREE.PointLight(0xff00ff, 0.6, 30)
  pointMagenta.position.set(-8, 6, -8)
  scene.add(pointMagenta)

  const pointCyan = new THREE.PointLight(0x00ffff, 0.6, 30)
  pointCyan.position.set(8, 6, 8)
  scene.add(pointCyan)

  // Ground grid
  const gridHelper = new THREE.GridHelper(GRID_SIZE * SPACING, GRID_SIZE * 2, 0x00ffff, 0x1a1f3a)
  ;(gridHelper.material as THREE.Material).transparent = true
  ;(gridHelper.material as THREE.Material).opacity = 0.3
  scene.add(gridHelper)

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(GRID_SIZE * SPACING, GRID_SIZE * SPACING)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0e27, transparent: true, opacity: 0.8 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.01
  scene.add(ground)

  // Generate buildings
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      if (x >= 3 && x <= 4 && z >= 3 && z <= 4) continue
      if (Math.random() > 0.6) continue
      buildings.push(createBuilding(x, z))
    }
  }

  // Characters
  builderGroup = createBuilder()
  builderGroup.position.set(-5, 0, 0)
  scene.add(builderGroup)

  gorillaGroup = createGorilla()
  gorillaGroup.position.set(5, 0, 0)
  scene.add(gorillaGroup)
}

function animate() {
  if (!renderer) return
  const dt = Math.min(clock.getDelta(), 0.1)
  updateScene(dt)
  renderer.render(scene, camera)
  animId = requestAnimationFrame(animate)
}

function onResize() {
  const container = containerRef.value
  if (!container || !renderer) return
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', onResize)

  // ResizeObserver detects container size changes (e.g. fullscreen toggle via CSS)
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      onResize()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (animId !== null) cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (renderer) {
    renderer.dispose()
    const container = containerRef.value
    if (container && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
    renderer = null
  }
})
</script>

<template>
  <div ref="containerRef" class="cyber-city-container"></div>
</template>

<style scoped>
.cyber-city-container {
  width: 100%;
  height: 100%;
}
</style>
