export interface RigState {
  px: number;
  py: number;
  pz: number;
  lx: number;
  ly: number;
  lz: number;
  fov: number;
  progress: number;
}

export type CameraKeyframe = Omit<RigState, 'progress'>;

export function createRigState(): RigState {
  return {
    px: 0,
    py: 0.8,
    pz: 15,
    lx: 0,
    ly: 0.1,
    lz: -0.5,
    fov: 42,
    progress: 0,
  };
}
