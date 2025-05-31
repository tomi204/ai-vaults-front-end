import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { base, rootstock, rootstockTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, rootstock, rootstockTestnet],
  connectors: [
    injected(), // Solo MetaMask/Injected wallets
  ],
  transports: {
    [base.id]: http(),
    [rootstock.id]: http(),
    [rootstockTestnet.id]: http(),
  },
  ssr: true,
  storage: undefined, // Desactivar almacenamiento automático
});
