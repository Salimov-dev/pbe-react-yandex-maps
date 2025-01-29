import { YMaps } from "@pbe/react-yandex-maps";
import GeocodeMap from "./components/layout/geocode-map";
import config from "./config/config.json";

function App() {
  return (
    <YMaps query={{ apikey: config.YANDEX_API_KEY }}>
      <GeocodeMap />
    </YMaps>
  );
}

export default App;
