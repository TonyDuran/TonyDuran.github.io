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

// --- Character parts for proper limb animation ---
interface CharParts {
  group: THREE.Group
  leftArm: THREE.Group
  rightArm: THREE.Group
  leftLeg: THREE.Group
  rightLeg: THREE.Group
}

let builder: CharParts
let gorilla: CharParts

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

// --- Particles (sparks / debris) ---
interface Particle {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  life: number
  maxLife: number
}

const particles: Particle[] = []
const MAX_PARTICLES = 80

// --- Shockwaves (expanding ground rings) ---
interface Shockwave {
  ring: THREE.Mesh
  life: number
  maxLife: number
}

const shockwaves: Shockwave[] = []

// --- Ambient floating data motes ---
interface DataMote {
  mesh: THREE.Mesh
  speed: number
}

const dataMotes: DataMote[] = []
const MOTE_COUNT = 40

// --- Camera shake ---
let cameraShakeTimer = 0
let cameraShakeIntensity = 0

// --- Materials ---
const neonCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff })
const neonMagenta = new THREE.MeshBasicMaterial({ color: 0xff00ff })
const neonYellow = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })
const edgeMagenta = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.6 })

// Building colors
const builtColor = new THREE.Color(0x1a4a5a) // teal-tinted — "lit up"
const darkColor = new THREE.Color(0x0a0e18)  // near-black — "broken/dark"

// --- Add wireframe edges to all meshes in a group ---
function addWireframes(group: THREE.Object3D, lineMat: THREE.LineBasicMaterial) {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const wireGeo = new THREE.EdgesGeometry(child.geometry)
      const wire = new THREE.LineSegments(wireGeo, lineMat.clone())
      child.add(wire)
      ;(child.material as THREE.MeshBasicMaterial).transparent = true
      ;(child.material as THREE.MeshBasicMaterial).opacity = 0.3
    }
  })
}

// --- Build a low-poly blocky humanoid (builder) with limb pivots ---
function createBuilder(): CharParts {
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

  // Left arm — pivot at shoulder
  const leftArmPivot = new THREE.Group()
  leftArmPivot.position.set(-0.65, 2.1, 0)
  const leftArm = new THREE.Mesh(armGeo, neonCyan.clone())
  leftArm.position.set(0, -0.4, 0)
  leftArmPivot.add(leftArm)
  g.add(leftArmPivot)

  // Right arm — pivot at shoulder
  const rightArmPivot = new THREE.Group()
  rightArmPivot.position.set(0.65, 2.1, 0)
  const rightArm = new THREE.Mesh(armGeo, neonCyan.clone())
  rightArm.position.set(0, -0.4, 0)
  rightArmPivot.add(rightArm)
  g.add(rightArmPivot)

  const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3)

  // Left leg — pivot at hip
  const leftLegPivot = new THREE.Group()
  leftLegPivot.position.set(-0.22, 1.0, 0)
  const leftLeg = new THREE.Mesh(legGeo, neonCyan.clone())
  leftLeg.position.set(0, -0.4, 0)
  leftLegPivot.add(leftLeg)
  g.add(leftLegPivot)

  // Right leg — pivot at hip
  const rightLegPivot = new THREE.Group()
  rightLegPivot.position.set(0.22, 1.0, 0)
  const rightLeg = new THREE.Mesh(legGeo, neonCyan.clone())
  rightLeg.position.set(0, -0.4, 0)
  rightLegPivot.add(rightLeg)
  g.add(rightLegPivot)

  addWireframes(g, edgeMat)
  g.scale.setScalar(0.8)

  return {
    group: g,
    leftArm: leftArmPivot,
    rightArm: rightArmPivot,
    leftLeg: leftLegPivot,
    rightLeg: rightLegPivot,
  }
}

// --- Build a low-poly blocky gorilla (breaker) with limb pivots ---
function createGorilla(): CharParts {
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
  const fistGeo = new THREE.BoxGeometry(0.45, 0.35, 0.45)

  // Left arm — pivot at shoulder (arm + fist as children)
  const leftArmPivot = new THREE.Group()
  leftArmPivot.position.set(-1.05, 2.3, 0)
  const leftArm = new THREE.Mesh(armGeo, neonMagenta.clone())
  leftArm.position.set(0, -0.7, 0)
  leftArmPivot.add(leftArm)
  const leftFist = new THREE.Mesh(fistGeo, neonMagenta.clone())
  leftFist.position.set(0, -1.2, 0)
  leftArmPivot.add(leftFist)
  g.add(leftArmPivot)

  // Right arm — pivot at shoulder (arm + fist as children)
  const rightArmPivot = new THREE.Group()
  rightArmPivot.position.set(1.05, 2.3, 0)
  const rightArm = new THREE.Mesh(armGeo, neonMagenta.clone())
  rightArm.position.set(0, -0.7, 0)
  rightArmPivot.add(rightArm)
  const rightFist = new THREE.Mesh(fistGeo, neonMagenta.clone())
  rightFist.position.set(0, -1.2, 0)
  rightArmPivot.add(rightFist)
  g.add(rightArmPivot)

  const legGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4)

  // Left leg — pivot at hip
  const leftLegPivot = new THREE.Group()
  leftLegPivot.position.set(-0.35, 1.0, 0)
  const leftLeg = new THREE.Mesh(legGeo, neonMagenta.clone())
  leftLeg.position.set(0, -0.3, 0)
  leftLegPivot.add(leftLeg)
  g.add(leftLegPivot)

  // Right leg — pivot at hip
  const rightLegPivot = new THREE.Group()
  rightLegPivot.position.set(0.35, 1.0, 0)
  const rightLeg = new THREE.Mesh(legGeo, neonMagenta.clone())
  rightLeg.position.set(0, -0.3, 0)
  rightLegPivot.add(rightLeg)
  g.add(rightLegPivot)

  addWireframes(g, edgeMagenta)
  g.scale.setScalar(0.8)

  return {
    group: g,
    leftArm: leftArmPivot,
    rightArm: rightArmPivot,
    leftLeg: leftLegPivot,
    rightLeg: rightLegPivot,
  }
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

  const wire = b.mainMesh.children.find(c => c instanceof THREE.LineSegments) as THREE.LineSegments | undefined
  if (wire) {
    const wMat = wire.material as THREE.LineBasicMaterial
    wMat.color.setHex(lit ? 0x00ffff : 0x1a1f3a)
    wMat.opacity = lit ? 0.6 : 0.15
  }

  b.mainMesh.children.forEach(c => {
    if (c instanceof THREE.Mesh && c !== b.mainMesh && c.geometry.type === 'PlaneGeometry') {
      const wm = c.material as THREE.MeshBasicMaterial
      wm.opacity = lit ? 0.8 : 0
    }
  })
}

// --- Particle effects ---
function spawnParticles(position: THREE.Vector3, color: number, count: number, spread: number) {
  const actualCount = Math.min(count, MAX_PARTICLES - particles.length)
  for (let i = 0; i < actualCount; i++) {
    const size = 0.06 + Math.random() * 0.08
    const geo = new THREE.BoxGeometry(size, size, size)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(position)
    mesh.position.x += (Math.random() - 0.5) * 0.5
    mesh.position.z += (Math.random() - 0.5) * 0.5
    scene.add(mesh)

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * spread * 2,
      Math.random() * spread * 3,
      (Math.random() - 0.5) * spread * 2
    )
    particles.push({ mesh, velocity, life: 0, maxLife: 0.6 + Math.random() * 0.6 })
  }
}

function updateParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life += dt
    p.velocity.y -= 12 * dt // gravity
    p.mesh.position.add(p.velocity.clone().multiplyScalar(dt))
    p.mesh.rotation.x += dt * 3
    p.mesh.rotation.z += dt * 2
    const alpha = 1 - (p.life / p.maxLife)
    ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha

    if (p.life >= p.maxLife) {
      scene.remove(p.mesh)
      p.mesh.geometry.dispose()
      ;(p.mesh.material as THREE.MeshBasicMaterial).dispose()
      particles.splice(i, 1)
    }
  }
}

// --- Shockwave rings ---
function spawnShockwave(position: THREE.Vector3, color: number) {
  const geo = new THREE.RingGeometry(0.2, 0.5, 32)
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  })
  const ring = new THREE.Mesh(geo, mat)
  ring.position.set(position.x, 0.05, position.z)
  ring.rotation.x = -Math.PI / 2
  scene.add(ring)
  shockwaves.push({ ring, life: 0, maxLife: 0.8 })
}

function updateShockwaves(dt: number) {
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i]
    sw.life += dt
    const t = sw.life / sw.maxLife
    const scale = 1 + t * 12
    sw.ring.scale.set(scale, scale, 1)
    ;(sw.ring.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t * t)

    if (sw.life >= sw.maxLife) {
      scene.remove(sw.ring)
      sw.ring.geometry.dispose()
      ;(sw.ring.material as THREE.MeshBasicMaterial).dispose()
      shockwaves.splice(i, 1)
    }
  }
}

// --- Ambient floating data motes ---
function initDataMotes() {
  const range = GRID_SIZE * SPACING / 2
  for (let i = 0; i < MOTE_COUNT; i++) {
    const size = 0.03 + Math.random() * 0.04
    const geo = new THREE.BoxGeometry(size, size, size)
    const isCyan = Math.random() > 0.5
    const mat = new THREE.MeshBasicMaterial({
      color: isCyan ? 0x00ffff : 0xff00ff,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.4,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(
      (Math.random() - 0.5) * range * 2,
      Math.random() * 15,
      (Math.random() - 0.5) * range * 2,
    )
    scene.add(mesh)
    dataMotes.push({ mesh, speed: 0.3 + Math.random() * 0.5 })
  }
}

function updateDataMotes(dt: number) {
  const range = GRID_SIZE * SPACING / 2
  for (const m of dataMotes) {
    m.mesh.position.y += m.speed * dt
    m.mesh.rotation.x += dt * 0.5
    m.mesh.rotation.z += dt * 0.3

    if (m.mesh.position.y > 15) {
      m.mesh.position.y = -1
      m.mesh.position.x = (Math.random() - 0.5) * range * 2
      m.mesh.position.z = (Math.random() - 0.5) * range * 2
    }
  }
}

// --- Camera shake ---
function triggerCameraShake(intensity: number) {
  cameraShakeTimer = 0.4
  cameraShakeIntensity = intensity
}

// --- Gorilla state machine ---
type GorillaPhase = 'walking' | 'jumping' | 'landing' | 'idle'
let gorillaPhase: GorillaPhase = 'idle'
let gorillaTarget: Building | null = null
let gorillaJumpTimer = 0
const JUMP_DURATION = 0.6
const JUMP_HEIGHT = 5

// --- Animation ---
let builderWaitTimer = 0
let gorillaWaitTimer = 2

// Resets all limbs to resting pose
function resetLimbs(char: CharParts) {
  char.leftArm.rotation.x = 0
  char.rightArm.rotation.x = 0
  char.leftLeg.rotation.x = 0
  char.rightLeg.rotation.x = 0
}

function updateScene(dt: number) {
  const time = clock.getElapsedTime()

  // --- Animate Builder ---
  if (builderWaitTimer > 0) {
    builderWaitTimer -= dt
    resetLimbs(builder)
  } else {
    const toBuild = buildings.filter(b => b.state === 'rubble' || b.state === 'building')
    if (toBuild.length === 0) {
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
      const dx = tx - builder.group.position.x
      const dz = tz - builder.group.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist > 0.3) {
        // Walking — animate legs and arms
        const speed = 3
        builder.group.position.x += (dx / dist) * speed * dt
        builder.group.position.z += (dz / dist) * speed * dt
        builder.group.lookAt(new THREE.Vector3(tx, 0, tz))
        builder.group.position.y = Math.abs(Math.sin(time * 8)) * 0.15

        builder.leftLeg.rotation.x = Math.sin(time * 8) * 0.5
        builder.rightLeg.rotation.x = Math.sin(time * 8 + Math.PI) * 0.5
        builder.leftArm.rotation.x = Math.sin(time * 8 + Math.PI) * 0.35
        builder.rightArm.rotation.x = Math.sin(time * 8) * 0.35
      } else {
        // Building — hammer animation on right arm
        target.currentHeight = Math.min(target.currentHeight + dt * 1.5, target.targetHeight)

        const progress = target.currentHeight / target.targetHeight
        const mat = target.mainMesh.material as THREE.MeshStandardMaterial
        mat.color.lerpColors(darkColor, builtColor, progress)

        builder.rightArm.rotation.x = Math.sin(time * 12) * 0.6
        builder.leftArm.rotation.x = -0.2 // holding steady
        builder.leftLeg.rotation.x = 0
        builder.rightLeg.rotation.x = 0
        builder.group.position.y = 0

        if (target.currentHeight >= target.targetHeight) {
          target.state = 'standing'
          target.stateTimer = 0
          setBuildingLit(target, true)
          builderWaitTimer = 0.5

          // Sparks on completion
          const buildPos = new THREE.Vector3(
            (target.gridX - GRID_SIZE / 2) * SPACING,
            target.currentHeight * 0.6,
            (target.gridZ - GRID_SIZE / 2) * SPACING,
          )
          spawnParticles(buildPos, 0x00ffff, 10, 1.2)
        }
      }
    } else {
      resetLimbs(builder)
    }
  }

  // --- Animate Gorilla (jump on buildings) ---
  if (gorillaWaitTimer > 0) {
    gorillaWaitTimer -= dt
    gorilla.group.position.y = 0

    // Idle chest pound
    gorilla.leftArm.rotation.x = Math.abs(Math.sin(time * 6)) * 0.5
    gorilla.rightArm.rotation.x = Math.abs(Math.sin(time * 6 + Math.PI * 0.5)) * 0.5
    gorilla.leftLeg.rotation.x = 0
    gorilla.rightLeg.rotation.x = 0
  } else if (gorillaPhase === 'idle') {
    const candidates = buildings.filter(b => b.state === 'standing' && b.stateTimer > 2.5)
    if (candidates.length > 0) {
      gorillaTarget = candidates[Math.floor(Math.random() * candidates.length)]
      gorillaPhase = 'walking'
    } else {
      // Idle — chest pound
      gorilla.group.position.y = 0
      gorilla.leftArm.rotation.x = Math.abs(Math.sin(time * 6)) * 0.5
      gorilla.rightArm.rotation.x = Math.abs(Math.sin(time * 6 + Math.PI * 0.5)) * 0.5
      gorilla.leftLeg.rotation.x = 0
      gorilla.rightLeg.rotation.x = 0
    }
  } else if (gorillaPhase === 'walking' && gorillaTarget) {
    const tx = (gorillaTarget.gridX - GRID_SIZE / 2) * SPACING
    const tz = (gorillaTarget.gridZ - GRID_SIZE / 2) * SPACING
    const dx = tx - gorilla.group.position.x
    const dz = tz - gorilla.group.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist > 0.5) {
      // Heavy walk — wide arm swing, body sway
      const speed = 2.5
      gorilla.group.position.x += (dx / dist) * speed * dt
      gorilla.group.position.z += (dz / dist) * speed * dt
      gorilla.group.lookAt(new THREE.Vector3(tx, 0, tz))
      gorilla.group.position.y = Math.abs(Math.sin(time * 5)) * 0.2
      gorilla.group.rotation.z = Math.sin(time * 4) * 0.05

      gorilla.leftLeg.rotation.x = Math.sin(time * 5) * 0.35
      gorilla.rightLeg.rotation.x = Math.sin(time * 5 + Math.PI) * 0.35
      gorilla.leftArm.rotation.x = Math.sin(time * 5 + Math.PI) * 0.5
      gorilla.rightArm.rotation.x = Math.sin(time * 5) * 0.5
    } else {
      // Arrived at target — begin jump
      gorillaPhase = 'jumping'
      gorillaJumpTimer = 0
      gorilla.group.rotation.z = 0
    }
  } else if (gorillaPhase === 'jumping' && gorillaTarget) {
    gorillaJumpTimer += dt
    const t = Math.min(gorillaJumpTimer / JUMP_DURATION, 1)

    // Parabolic arc
    const jumpY = JUMP_HEIGHT * 4 * t * (1 - t)
    const landingY = gorillaTarget.currentHeight * 0.8
    gorilla.group.position.y = jumpY + (t > 0.5 ? (t - 0.5) * 2 * landingY : 0)

    // Arms up, legs tucked during jump
    gorilla.leftArm.rotation.x = -2.0
    gorilla.rightArm.rotation.x = -2.0
    gorilla.leftLeg.rotation.x = -0.5
    gorilla.rightLeg.rotation.x = -0.5

    if (t >= 1) {
      gorillaPhase = 'landing'
      gorillaJumpTimer = 0
    }
  } else if (gorillaPhase === 'landing' && gorillaTarget) {
    // SLAM! Building goes dark
    gorillaTarget.state = 'rubble'
    gorillaTarget.currentHeight = Math.max(gorillaTarget.targetHeight * 0.3, 1)
    setBuildingLit(gorillaTarget, false)

    // Arms slam down
    gorilla.leftArm.rotation.x = 0.8
    gorilla.rightArm.rotation.x = 0.8
    gorilla.leftLeg.rotation.x = 0
    gorilla.rightLeg.rotation.x = 0

    gorilla.group.position.y = gorillaTarget.currentHeight * 0.5

    // Impact effects
    const impactPos = new THREE.Vector3(
      gorilla.group.position.x,
      0,
      gorilla.group.position.z,
    )
    spawnParticles(impactPos, 0xff00ff, 12, 1.5)
    spawnShockwave(impactPos, 0xff00ff)
    triggerCameraShake(0.3)

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

  // --- Update effects ---
  updateParticles(dt)
  updateShockwaves(dt)
  updateDataMotes(dt)

  // --- Camera: slow orbit + shake ---
  const camAngle = time * 0.08
  const camRadius = 20
  camera.position.x = Math.cos(camAngle) * camRadius
  camera.position.z = Math.sin(camAngle) * camRadius
  camera.position.y = 10 + Math.sin(time * 0.15) * 2

  if (cameraShakeTimer > 0) {
    cameraShakeTimer -= dt
    const shakeFactor = cameraShakeIntensity * (cameraShakeTimer / 0.4)
    camera.position.x += (Math.random() - 0.5) * shakeFactor
    camera.position.y += (Math.random() - 0.5) * shakeFactor * 0.5
    camera.position.z += (Math.random() - 0.5) * shakeFactor
  }

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
  builder = createBuilder()
  builder.group.position.set(-5, 0, 0)
  scene.add(builder.group)

  gorilla = createGorilla()
  gorilla.group.position.set(5, 0, 0)
  scene.add(gorilla.group)

  // Ambient data motes
  initDataMotes()
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

  // Clean up particles
  for (const p of particles) {
    scene.remove(p.mesh)
    p.mesh.geometry.dispose()
    ;(p.mesh.material as THREE.MeshBasicMaterial).dispose()
  }
  particles.length = 0

  // Clean up shockwaves
  for (const sw of shockwaves) {
    scene.remove(sw.ring)
    sw.ring.geometry.dispose()
    ;(sw.ring.material as THREE.MeshBasicMaterial).dispose()
  }
  shockwaves.length = 0

  // Clean up data motes
  for (const m of dataMotes) {
    scene.remove(m.mesh)
    m.mesh.geometry.dispose()
    ;(m.mesh.material as THREE.MeshBasicMaterial).dispose()
  }
  dataMotes.length = 0

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
