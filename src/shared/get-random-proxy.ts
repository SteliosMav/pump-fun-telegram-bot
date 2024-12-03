const PROXY_LIST = [
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

export function getRandomProxy() {
  const proxyList = PROXY_LIST;
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}
