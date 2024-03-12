import "./modules/css/mapbox-gl-draw-v2.css";
import "./modules/css/mapbox-gl-draw.css";
import Map from "react-map-gl";
import React from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "./modules/DrawModes/rectangle-mode";
//@ts-ignore
import { DragCircleMode } from "mapbox-gl-draw-circle";
import CircleMode from "./modules/DrawModes/circle-mode";
import BuildingsMode from "./modules/DrawModes/buildings-mode";
import mapStyles from "./modules/MapStyleLinks";
var StaticMode = require("@mapbox/mapbox-gl-draw-static-mode");

// As a reminder, this is how to acquire "draw"
// mapRef.current.getMap()._controls.filter((e: any) => Object.keys(e).includes("getSelected"))[0];

type MapMainProps = {
  btnFn?: Function;
  child?: any;
  features?: any;
  initialViewState?: ViewState;
  panel?: boolean;
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
  "pk.eyJ1IjoidGp1c3Rzb3VwIiwiYSI6ImNsMWR1NzIxODAwejIzYm11Yng4cDBqc2gifQ.LkkdD6N9PvcTVXT7EJxhuA";

export default function MapMain(props: MapMainProps) {
  // Map Control
  const mapRef = React.useRef<any>();
  const [viewState, setViewState] = React.useState<ViewState>(
    props.initialViewState || durham
  );
  const [mapLoading, setMapLoading] = React.useState(true);
  const [mapStyle, setMapStyle] = React.useState<string>(
    mapStyles.Streets.link
  );

  const childProps = {
    btnFn: props?.btnFn,
    mapRef,
    mapStyle,
    setMapStyle,
  };

  return (
    <Map
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      {...viewState}
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
            modes: {
              ...MapboxDraw.modes,
              static: StaticMode,
              draw_circle: CircleMode(),
              drag_circle: DragCircleMode,
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
        setMapLoading(false);
      }}>
      {!props.child ? null : mapLoading ? null : (
        <props.child {...childProps} />
      )}
    </Map>
  );
}
