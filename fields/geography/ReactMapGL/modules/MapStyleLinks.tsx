import StreetviewIcon from "@mui/icons-material/Streetview";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";

const mapStyles = {
  Streets: {
    link: "mapbox://styles/esqtech/cl8nh2452002p15logaud46pv",
    icon: (color: any, fontSize: any) => <StreetviewIcon color={color} fontSize={fontSize} />,
  },
  Satellite: {
    link: "mapbox://styles/mapbox/satellite-streets-v11",
    icon: (color: any, fontSize: any) => <SatelliteAltIcon color={color} fontSize={fontSize} />,
  }
};

export default mapStyles;