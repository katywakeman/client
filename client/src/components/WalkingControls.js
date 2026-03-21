import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib'

export function SafePointerLockControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    const controls = new PointerLockControlsImpl(camera, gl.domElement)
    controlsRef.current = controls

    const handleClick = () => {
      try { controls.lock() } catch {}
    }

    gl.domElement.addEventListener('click', handleClick)

    return () => {
      gl.domElement.removeEventListener('click', handleClick)
      try { controls.unlock() } catch {}
      controls.dispose()
    }
  }, [camera, gl])

  return null
}

export function WalkingControls() {
  const keys = useRef({ w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, space: false })
  const velocity = useRef({ x: 0, y: 0, z: 0 })
  const onGround = useRef(true)

  useFrame((state) => {
    const speed = 0.1
    const gravity = -0.02
    const jumpForce = 0.3
    const groundLevel = 1
    const camera = state.camera
    const direction = new Vector3()

    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    const right = new Vector3()
    right.crossVectors(camera.up, direction).normalize()

    if (keys.current.w || keys.current.ArrowUp) camera.position.addScaledVector(direction, speed)
    if (keys.current.s || keys.current.ArrowDown) camera.position.addScaledVector(direction, -speed)
    if (keys.current.a || keys.current.ArrowLeft) camera.position.addScaledVector(right, speed)
    if (keys.current.d || keys.current.ArrowRight) camera.position.addScaledVector(right, -speed)

    if (keys.current.space && onGround.current) {
      velocity.current.y = jumpForce
      onGround.current = false
    }

    velocity.current.y += gravity
    camera.position.y += velocity.current.y

    if (camera.position.y <= groundLevel) {
      camera.position.y = groundLevel
      velocity.current.y = 0
      onGround.current = true
    }
  })

  useState(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') { keys.current.space = true; e.preventDefault() }
      else if (e.key in keys.current) keys.current[e.key] = true
    }
    const handleKeyUp = (e) => {
      if (e.key === ' ') keys.current.space = false
      else if (e.key in keys.current) keys.current[e.key] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  })

  return null
}
