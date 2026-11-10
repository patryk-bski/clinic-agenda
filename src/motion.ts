// Shared animation timing: short and gently easing out, to keep the app feeling calm
export const transition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] } as const

// A simple fade in and out, for things that appear and disappear
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition,
}
