// Shared animation timing: short and gently easing out, to keep the app feeling calm
export const transition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] } as const

// When the app opens or reloads: things fade in while drifting a few pixels into place.
// Slower than `transition`, so it reads as a soft arrival rather than a snap.
// `delay` staggers the pieces (sidebar first, then the page).
export const entrance = (delay = 0, from: { x?: number; y?: number } = { y: 6 }) => ({
  initial: { opacity: 0, ...from },
  animate: { opacity: 1, x: 0, y: 0 },
  transition: { duration: 0.6, delay, ease: transition.ease },
})

// A simple fade in and out, for things that appear and disappear
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition,
}
