
import * as THREE from 'three';

export enum SceneMode {
  TREE = 'TREE',
  SCATTER = 'SCATTER',
  FOCUS = 'FOCUS'
}

export interface AppState {
  mode: SceneMode;
  loading: boolean;
  uiHidden: boolean;
  handDetected: boolean;
  activePhoto: THREE.Object3D | null;
}

export interface ParticleData {
  mesh: THREE.Mesh;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  targetScale: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'BOX' | 'SPHERE' | 'CANE' | 'PHOTO' | 'DUST';
}
