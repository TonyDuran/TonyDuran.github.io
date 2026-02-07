import { ref, onMounted, onUnmounted } from 'vue'
import { useMouse, useRafFn, useMediaQuery } from '@vueuse/core'

export function useDroneCursor() {
  const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })
  const isMobile = useMediaQuery('(max-width: 768px)')

  const droneX = ref(0)
  const droneY = ref(0)
  const innerAngle = ref(0)
  const outerAngle = ref(0)
  const isLocked = ref(false)

  const lerpFactor = 0.08
  const innerRadius = 50
  const outerRadius = 120
  const innerSpeed = 0.65   // rad/s (slowed ~15%)
  const outerSpeed = -0.35  // slower, opposite direction

  let lastTime = performance.now()

  const { pause } = useRafFn(() => {
    const now = performance.now()
    const dt = (now - lastTime) / 1000
    lastTime = now

    if (!isLocked.value) {
      droneX.value += (mouseX.value - droneX.value) * lerpFactor
      droneY.value += (mouseY.value - droneY.value) * lerpFactor
    }

    innerAngle.value += innerSpeed * dt
    outerAngle.value += outerSpeed * dt
  })

  function lock() {
    isLocked.value = true
  }

  function unlock() {
    isLocked.value = false
  }

  function onDocumentClick(e: MouseEvent) {
    if (isMobile.value) return

    if (isLocked.value) {
      const target = e.target as HTMLElement
      // Don't interfere with orbit item clicks (links, nav buttons)
      if (target.closest('.orbit-item') || target.closest('.orbit-link')) {
        return
      }

      // Shift+click anywhere → unlock
      if (e.shiftKey) {
        unlock()
        return
      }

      // Only unlock if clicking inside the orbit circle
      const dx = e.clientX - droneX.value
      const dy = e.clientY - droneY.value
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= outerRadius + 15) {
        unlock()
      }
      // Otherwise: stay pinned, don't follow
    } else {
      lock()
    }
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick, true)
  })

  onUnmounted(() => {
    pause()
    document.removeEventListener('click', onDocumentClick, true)
  })

  function getInnerOrbitPosition(index: number, total: number) {
    const angleOffset = (2 * Math.PI * index) / total
    const angle = innerAngle.value + angleOffset
    return {
      x: Math.cos(angle) * innerRadius,
      y: Math.sin(angle) * innerRadius,
    }
  }

  function getOuterOrbitPosition(index: number, total: number) {
    const angleOffset = (2 * Math.PI * index) / total
    const angle = outerAngle.value + angleOffset
    return {
      x: Math.cos(angle) * outerRadius,
      y: Math.sin(angle) * outerRadius,
    }
  }

  return {
    droneX,
    droneY,
    isMobile,
    isLocked,
    getInnerOrbitPosition,
    getOuterOrbitPosition,
  }
}
