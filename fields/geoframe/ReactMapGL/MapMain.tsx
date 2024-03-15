import "./modules/css/mapbox-gl-draw-v2.css";
import "./modules/css/mapbox-gl-draw.css";
import Map from "react-map-gl";
import React from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "./modules/DrawModes/rectangle-mode";
import CircleMode from "./modules/DrawModes/circle-mode";
import BuildingsMode from "./modules/DrawModes/buildings-mode";
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
    type: "Polygon"
  }
}
type MapMainProps = {
  btnFn?: Function;
  child?: any;
  features?: any;
  initialViewState?: ViewState;
  panel?: boolean;
  setFeatureState?: (v: any) => any;
  setMapRef?: (v: any) => any;
  static?: boolean;
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

const MAPBOX_TOKEN =
  "pk.eyJ1IjoidGp1c3Rzb3VwIiwiYSI6ImNsdHJqcGFiMTBpdjkya3IwZDBuOW14cm8ifQ.p1drJMjOQ_l9UmGvsm0gSQ";

export default function MapMain(props: MapMainProps) {
  /* Map Control */
  const mapRef = React.useRef<any>();
  const [viewState, setViewState] = React.useState<ViewState>(
    props.initialViewState || durham
  );
  const [mapLoading, setMapLoading] = React.useState(true);
  const [mapStyle, setMapStyle] = React.useState<string>(
    "mapbox://styles/esqtech/cl8nh2452002p15logaud46pv"
  );
  const childProps = {
    btnFn: props?.btnFn,
    mapRef,
    mapStyle,
    setMapStyle,
  };

  /* Feature State */
  const [featureState, setFeatureState] = React.useState<MapPolygonFeature[]>([]);
  React.useEffect(() => props.setFeatureState?.(featureState), [featureState]);
  const handleCreate = (e: any) => {
    setFeatureState((state) => [...state, ...e.features]);
  };
  const handleUpdate = (e: any) => {
    setFeatureState((state) => [
      ...state.filter((v) => !e.features.map((f) => f.id).includes(v.id)),
      ...e.features,
    ]);
  };
  const handleDelete = (e: any) => {
    setFeatureState((state) =>
      state.filter((v) => !e.features.map((f) => f.id).includes(v.id))
    );
  };

  return (
    <Map
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      {...viewState}
      // onClick={() => console.log(mapRef.current.getMap())}
      onMove={(evt) => setViewState(evt.viewState)}
      // mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle={mapStyle}
      onLoad={(e: any) => {
        mapRef.current.addControl(
          new MapboxDraw({
            displayControlsDefault: false,
            userProperties: true,
            defaultMode: props.static ? "static" : "simple_select",
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
        if (props.features) {
          mapRef.current
            .getMap()
            ._controls.filter((e: any) =>
              Object.keys(e).includes("getSelected")
            )[0]
            .set(props.features);
        }
        if (props.static) {
          mapRef.current
            .getMap()
            ._controls.filter((e: any) =>
              Object.keys(e).includes("getSelected")
            )[0]
            .changeMode("static");
        }
        mapRef.current.on("draw.create", handleCreate);
        mapRef.current.on("draw.delete", handleDelete);
        mapRef.current.on("draw.update", handleUpdate);

        setMapLoading(false);
        props.setMapRef?.(mapRef);
      }}>
      {!props.child ? null : mapLoading ? null : (
        <props.child {...childProps} />
      )}
    </Map>
  );
}
