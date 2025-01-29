import { Map } from "@pbe/react-yandex-maps";
import styled from "styled-components";

const MapStyled = styled(Map)`
  width: 100%;
  height: 700px;
`;

const CENTER = [59.94077030138753, 30.31197058944388];
const ZOOM = 12;

const GeocodeMap = () => {
  const handleClickMap = () => {
    console.log("click map");
  };
  return (
    <MapStyled
      defaultState={{
        center: CENTER,
        zoom: ZOOM,
      }}
      onClick={handleClickMap}
    />
  );
};

export default GeocodeMap;
