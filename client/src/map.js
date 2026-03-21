import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'

import { ADDITION, SUBTRACTION, Evaluator, Operation } from 'three-bvh-csg'

const csgEvaluator = new Evaluator()
const result = csgEvaluator.evaluate(wallMesh, doorMesh, SUBTRACTION)
scene.add(result)

export default function Map() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <BlenderModel path="/BushHouseFloor7.glb" />
          <OrbitControls />
          <Environment preset="sunset" />
        </Suspense>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </Canvas>
    </div>
  )
}