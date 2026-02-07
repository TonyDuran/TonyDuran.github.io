<template>
  <div class="cyberpunk-overlay">
    <div class="scanlines"></div>
    <div class="vignette"></div>
  </div>
</template>

<style scoped>
.cyberpunk-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    var(--scanline-color, rgba(0, 255, 255, 0.03)) 0px,
    var(--scanline-color, rgba(0, 255, 255, 0.03)) 1px,
    transparent 1px,
    transparent 3px
  );
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    var(--vignette-color, rgba(0, 0, 0, 0.5)) 100%
  );
}
</style>
