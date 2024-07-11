// types.ts
export interface GeoJSONPolygon {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: null;
}