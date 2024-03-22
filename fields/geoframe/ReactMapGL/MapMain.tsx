import "./modules/css/mapbox-gl-draw-v2.css";
import "./modules/css/mapbox-gl-draw.css";
import Map from "react-map-gl";
import React from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "./modules/DrawModes/rectangle-mode";
import CircleMode from "./modules/DrawModes/circle-mode";
import BuildingsMode from "./modules/DrawModes/buildings-mode";
import { WrapperProps } from "../wrapper";
import GetCenter from "./modules/GetCenter";
// import mapStyles from "./modules/MapStyleLinks";
var StaticMode = require("@mapbox/mapbox-gl-draw-static-mode");

// As a reminder, this is how to acquire "draw"
// mapRef.current.getMap()._controls.filter((e: any) => Object.keys(e).includes("getSelected"))[0];

export type MapPolygonFeature = {
  id: string;
  type: "Feature";
  properties: any;
  geometry: {
    coordinates: [number, number][];
    type: "Polygon";
  };
};
export type FeatureCollection = {
  type: "FeatureCollection";
  features: MapPolygonFeature[];
};
type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const durham = {
  longitude: -78.90093,
  latitude: 35.99623,
  zoom: 15,
};
function getInitialViewState(value) {
  const center = GetCenter(value)
  return {
    longitude: center[0],
    latitude: center[1],
    zoom: 15
  }
}

export default function MapMain(props: WrapperProps) {
  /* Map Control */
  const mapRef = React.useRef<any>();
  const [viewState, setViewState] = React.useState<ViewState>(props.value ? getInitialViewState(props.value) : durham);
  const [mapLoading, setMapLoading] = React.useState(true);
  const [mapStyle, setMapStyle] = React.useState<string>(
    "mapbox://styles/esqtech/cl8nh2452002p15logaud46pv"
  );

  /* Handle Features */
  const onChange = (e: any) => {
    const featureCollection = e.target._controls
      .filter((e: any) => Object.keys(e).includes("getSelected"))[0]
      .getAll();
    props.onChange?.(
      featureCollection.features.length > 0
        ? JSON.stringify(featureCollection)
        : null
    );
  };

  // "Reset Changes" button clicked => update map
  React.useEffect(() => {
    if (
      mapRef.current &&
      props.value !==
        JSON.stringify(
          mapRef.current
            .getMap()
            ._controls.filter((e: any) =>
              Object.keys(e).includes("getSelected")
            )[0]
            .getAll()
        )
    ) {
      mapRef.current
        .getMap()
        ._controls.filter((e: any) => Object.keys(e).includes("getSelected"))[0]
        .set(
          props.value
            ? (JSON.parse(props.value) as FeatureCollection)
            : { type: "FeatureCollection", features: [] }
        );
    }
  }, [props.value]);

  return (
    <Map
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      initialViewState={viewState}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle={mapStyle}
      onLoad={(e: any) => {
        mapRef.current.addControl(
          new MapboxDraw({
            displayControlsDefault: false,
            userProperties: true,
            defaultMode: "simple_select",
            controls: {
              polygon: true,
              trash: true,
            },
            modes: {
              ...MapboxDraw.modes,
              static: StaticMode,
              draw_circle: CircleMode(),
              draw_rectangle: DrawRectangle,
              buildings: BuildingsMode(mapRef),
            },
          })
        );
        if (props.value) {
          mapRef.current
            .getMap()
            ._controls.filter((e: any) =>
              Object.keys(e).includes("getSelected")
            )[0]
            .set(JSON.parse(props.value) as FeatureCollection);
        }
        mapRef.current.on("draw.create", onChange);
        mapRef.current.on("draw.delete", onChange);
        mapRef.current.on("draw.update", onChange);

        setMapLoading(false);
      }}
    />
  );
}
