declare module 'leaflet-velocity' {
  import * as L from 'leaflet';
  
  interface VelocityOptions {
    displayValues?: boolean;
    displayOptions?: {
      velocityType?: string;
      position?: string;
    };
    data: any;
    maxVelocity?: number;
    colorScale?: string[];
    lineWidth?: number;
    particleAge?: number;
    frameRate?: number;
  }

  function velocityLayer(options: VelocityOptions): L.Layer;
  export { velocityLayer };
  export default velocityLayer;
}
