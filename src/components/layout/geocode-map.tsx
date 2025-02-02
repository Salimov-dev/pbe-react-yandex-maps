import { Map, Placemark, useYMaps } from "@pbe/react-yandex-maps";
import { useState } from "react";
import { Flex, Typography } from "antd";
import styled from "styled-components";
import { IGeocodeResult } from "yandex-maps";

type CoordinatesType = Array<number>;

interface IMapClickEvent {
  get: (key: string) => CoordinatesType;
}

interface IAddress {
  location: string;
  route: string;
}

const CardWithGeocodeMap = styled(Flex)`
  width: 100%;
  height: 700px;
  gap: 6px;
`;

const MapWithGeocode = styled(Map)`
  width: 75%;
  border: 1px solid black;
  border-radius: 10px;
  overflow: hidden;
`;

const LocationInfoCard = styled(Flex)`
  width: 25%;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
  border-radius: 10px;
`;

const AddressWithCoordinates = styled(Flex)`
  flex-direction: column;
`;

const EmptyAddressMessage = styled(Typography.Title)`
  width: 100%;
  text-align: center;
`;

const CENTER = [59.94077030138753, 30.31197058944388];
const ZOOM = 12;

const GeocodeMap = () => {
  const [coordinates, setCoordinates] = useState<CoordinatesType | null>(null);
  const [address, setAddress] = useState<IAddress | null>(null);

  const formattedCoordinates = coordinates
    ? `${coordinates[0]?.toFixed(6)}, ${coordinates[1]?.toFixed(6)}`
    : null;

  const ymaps = useYMaps(["geocode"]);

  const handleClickMap = (e: IMapClickEvent) => {
    const coords = e.get("coords");

    if (coords) {
      setCoordinates(coords);
    }

    ymaps
      ?.geocode(coords)
      .then((result) => {
        const foundAddress = handleGeoResult(result);

        if (foundAddress) setAddress(foundAddress);
      })
      .catch((error: unknown) => {
        console.log("Ошибка геокодирования", error);
        setAddress(null);
      });
  };

  function handleGeoResult(result: IGeocodeResult) {
    const firstGeoObject = result.geoObjects.get(0);

    if (firstGeoObject) {
      const properties = firstGeoObject.properties;

      const location = String(properties.get("description", {}));
      const route = String(properties.get("name", {}));

      const foundAddress = {
        location,
        route
      };

      return foundAddress;
    }
  }

  return (
    <CardWithGeocodeMap>
      <LocationInfoCard>
        {address ? (
          <AddressWithCoordinates>
            <Typography.Text>{`Локация: ${address?.location}`}</Typography.Text>
            <Typography.Text> {`Адрес: ${address?.route}`}</Typography.Text>
            <Typography.Text>
              {`Координаты: ${formattedCoordinates}`}
            </Typography.Text>
          </AddressWithCoordinates>
        ) : (
          <EmptyAddressMessage>Выберите точку на карте</EmptyAddressMessage>
        )}
      </LocationInfoCard>

      <MapWithGeocode
        defaultState={{
          center: CENTER,
          zoom: ZOOM
        }}
        onClick={(e: IMapClickEvent) => handleClickMap(e)}
      >
        {coordinates && <Placemark geometry={coordinates} />}
      </MapWithGeocode>
    </CardWithGeocodeMap>
  );
};

export default GeocodeMap;
