import { PumpFunService } from "../src/pump-fun/pump-fun.service";
import { getRandomProxy } from "../src/shared/get-random-proxy";

async function main() {
  // Config
  const mint = "FUBB2RX5i1Ee29cJoKNBDAsiAGAwHhYehuGSEaTzpump";

  const pumpFunService = new PumpFunService();
  const proxyList = [
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9000",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9001",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9002",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9003",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9004",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9005",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9006",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9007",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9008",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9009",
    "http://geonode_sDRozcIvf5:92553e1a-4edd-4899-b8c9-d7de3b1bcb0f@premium-residential.geonode.com:9010",
  ];
  const invalidProxies: number[] = []; // 7
  let idx = 0;
  for (const proxy of proxyList) {
    console.log("Testing proxy idx: ", idx);
    const coinData = await pumpFunService.getCoinData(mint, proxy, 5);
    if (!coinData) {
      invalidProxies.push(idx);
    }
    if (proxyList.length - 1 === idx) {
      console.log("Invalid proxies: ", invalidProxies);
    }
    idx++;
  }
}
(() => {
  for (let index = 0; index < 3; index++) {
    main();
  }
})();
