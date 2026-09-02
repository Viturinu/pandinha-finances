import * as React from "react"

const MOBILE_BREAKPOINT = 768

const consultaDeTelaMobile = () =>
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

export function useIsMobile() {
  return React.useSyncExternalStore(
    (aoMudar) => {
      const consulta = consultaDeTelaMobile()
      consulta.addEventListener("change", aoMudar)

      return () => consulta.removeEventListener("change", aoMudar)
    },
    () => consultaDeTelaMobile().matches,
    () => false
  )
}
