import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

export default function BlenderModel({ path, onLoad }) {
  const { scene } = useGLTF(path)

  useEffect(() => {
    if (onLoad) onLoad(scene)
  }, [scene, onLoad])

  return <primitive object={scene} />
}
