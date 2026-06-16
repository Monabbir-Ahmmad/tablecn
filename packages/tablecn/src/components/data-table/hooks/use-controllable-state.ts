"use client"

import * as React from "react"

/**
 * State that is uncontrolled by default but becomes controlled when a value is
 * supplied. Either way `onChange` fires, so consumers can observe a change
 * without taking over ownership. Returns the same tuple shape as `useState` so
 * existing `Dispatch<SetStateAction<T>>` consumers keep working.
 */
export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (next) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(value) : next
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange, value]
  )

  return [value, setValue]
}
