// https://github.com/visgl/react-map-gl/blob/7.0-release/examples/controls/src/pin.tsx
import * as React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;
type PinProps = {
  icon?: any;
  place_id?: string;
  selected_id?: string;
};

function Pin(props: PinProps) {
  const selected: boolean =
    props.place_id !== null && props.selected_id !== null
      ? props.place_id === props.selected_id
      : false;
  return (
    // <svg height={30} viewBox="0 0 24 24" style={{ cursor: "pointer", fill: selected ? "#20d000" : "#d00", stroke: "#000000", strokeWidth: 2 }}>
    //   <path d={ICON} />
    // </svg>
    <LocationOnIcon
      htmlColor={selected ? "#6cbe4f" : "#f15a2b"}
      sx={{ cursor: "pointer", fontSize: 42 }}
    />
  );
}

export default React.memo(Pin);
