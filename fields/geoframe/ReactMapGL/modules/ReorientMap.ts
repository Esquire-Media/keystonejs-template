export default function ReorientMap(mapRef: any) {
  mapRef.current.resetNorth();
  mapRef.current.resetNorthPitch();
}