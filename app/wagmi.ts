import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  rootstock,
  rootstockTestnet
} from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base, rootstock, rootstockTestnet],
  connectors: [
    injected(), // Solo MetaMask/Injected wallets
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [rootstock.id]: http(),
    [rootstockTestnet.id]: http(),
  },
  ssr: true,
  storage: undefined, // Desactivar almacenamiento automático
}); 