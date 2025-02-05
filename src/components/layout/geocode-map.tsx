import { Map, Panorama, Placemark, useYMaps } from "@pbe/react-yandex-maps";
import { useEffect, useState } from "react";
import { Button, Divider, Flex, Table, TableProps, Typography } from "antd";
import styled from "styled-components";
import { IGeocodeResult } from "yandex-maps";
import { FrownOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

type CoordinatesType = Array<number>;

interface IMapClickEvent {
  get: (key: string) => CoordinatesType;
}

interface IAddress {
  location: string;
  route: string;
}

interface ISavedObject {
  id: string;
  address: IAddress | null;
  coordinates: CoordinatesType | null;
}

const CardWithGeocodeMap = styled(Flex)`
  width: 100%;
  flex-direction: column;
`;

const CardWithMapWrapper = styled(Flex)`
  height: 400px;
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
  padding: 6px;
`;

const AddressWithCoordinates = styled(Flex)`
  flex-direction: column;
`;

const InfoWithPanoramaWrapper = styled(Flex)`
  width: 100%;
  height: 100%;
`;

const EmptyAddressMessage = styled(Typography.Title)`
  width: 100%;
  text-align: center;
`;

const PanoramaStyled = styled(Panorama)`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
`;

const NoPanoramaWrapper = styled(Flex)`
  border-radius: 10px;
  border: 1px solid grey;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #999;
  font-size: 16px;
  text-align: center;
`;

const MapObjectsDisplay = styled(Map)`
  border-radius: 10px;
  border: 1px solid grey;
  overflow: hidden;
  width: 100%;
  height: 400px;
`;

const CENTER = [59.94077030138753, 30.31197058944388];
const ZOOM = 12;

const GeocodeMap = () => {
  const [coordinates, setCoordinates] = useState<CoordinatesType | null>(null);
  const [address, setAddress] = useState<IAddress | null>(null);
  const [hasPanorama, setHasPanorama] = useState<boolean>(false);
  const [objectArray, setObjectArray] = useState<ISavedObject[]>([]);

  const formattedCoordinates = coordinates
    ? `${coordinates[0]?.toFixed(6)}, ${coordinates[1]?.toFixed(6)}`
    : null;

  const ymaps = useYMaps(["geocode"]);

  const handleClickMap = (e: IMapClickEvent) => {
    const coords = e.get("coords");

    if (coords) {
      setCoordinates(coords);
    }

    ymaps?.panorama
      .locate(coords)
      .then((panorama) => {
        setHasPanorama(!!panorama.length);
      })
      .catch((error) => {
        console.log("Ошибка при поиске панорамы", error);
        setHasPanorama(false);
      });

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

  const handleSaveObject = () => {
    const localStorageObjects = localStorage.getItem("objects");

    const objectArray = localStorageObjects
      ? JSON.parse(localStorageObjects)
      : [];

    const newObject = {
      id: uuidv4(),
      address,
      coordinates
    };

    objectArray.push(newObject);

    localStorage.setItem("objects", JSON.stringify(objectArray));

    setObjectArray(objectArray);
  };

  // Таблица объектов

  const loadSavedObjects = () => {
    const localStorageObjects = localStorage.getItem("objects");

    if (localStorageObjects) {
      const parsedObjects = JSON.parse(localStorageObjects).map(
        (item: ISavedObject) => ({
          ...item,
          key: item.id
        })
      );

      setObjectArray(parsedObjects);
    } else {
      setObjectArray([]);
    }
  };

  useEffect(() => {
    loadSavedObjects();
  }, []);

  const columns: TableProps["columns"] = [
    {
      title: "Локация",
      dataIndex: ["address", "location"],
      key: "address.location"
    },
    {
      title: "Адрес",
      dataIndex: ["address", "route"],
      key: "address.route"
    },
    {
      title: "Координаты",
      dataIndex: "coordinates",
      key: "coordinates",
      render: (coords: number[]) => `${coords[0]}, ${coords[1]}`
    }
  ];

  return (
    <CardWithGeocodeMap>
      <CardWithMapWrapper>
        <LocationInfoCard>
          {address ? (
            <InfoWithPanoramaWrapper vertical>
              <AddressWithCoordinates>
                <Typography.Text>{`Локация: ${address?.location}`}</Typography.Text>
                <Typography.Text> {`Адрес: ${address?.route}`}</Typography.Text>
                <Typography.Text>
                  {`Координаты: ${formattedCoordinates}`}
                </Typography.Text>
              </AddressWithCoordinates>
              <Divider />
              {hasPanorama && coordinates ? (
                <PanoramaStyled
                  key={coordinates?.join(",")}
                  defaultPoint={coordinates ?? undefined}
                />
              ) : (
                <NoPanoramaWrapper vertical>
                  <FrownOutlined style={{ fontSize: "100px" }} />
                  <Typography.Title>Панорама не найдена</Typography.Title>
                </NoPanoramaWrapper>
              )}
              <Button
                type="primary"
                style={{ margin: "6px 0" }}
                onClick={handleSaveObject}
              >
                Сохранить
              </Button>
            </InfoWithPanoramaWrapper>
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
      </CardWithMapWrapper>
      <Table columns={columns} dataSource={objectArray} />
      <MapObjectsDisplay
        defaultState={{
          center: CENTER,
          zoom: ZOOM
        }}
        onClick={(e: IMapClickEvent) => handleClickMap(e)}
      >
        {objectArray.map(
          (obj) =>
            obj.coordinates && (
              <Placemark
                key={obj.id}
                geometry={obj.coordinates}
                properties={{
                  balloonContent: `<strong>${obj?.address?.location}</strong><br/>${obj?.address?.route}`
                }}
              />
            )
        )}
      </MapObjectsDisplay>
    </CardWithGeocodeMap>
  );
};

export default GeocodeMap;
