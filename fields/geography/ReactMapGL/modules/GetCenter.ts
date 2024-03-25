import { FeatureCollection } from "../MapMain";
import * as turf from "@turf/turf";

export default function GetCenter(
  featureCollection: string | FeatureCollection
): turf.helpers.Position {
  let fCol =
    typeof featureCollection === "string"
      ? JSON.parse(featureCollection)
      : featureCollection;

  const features = turf.points(
    fCol.features.map((feature) => feature.geometry.coordinates).flat(2)
  );

  return turf.center(features).geometry.coordinates;
}
