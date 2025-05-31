import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { base, rootstock, rootstockTestnet, flowTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, rootstock, rootstockTestnet, flowTestnet],
  connectors: [
    injected(), // Solo MetaMask/Injected wallets
  ],
  transports: {
    [base.id]: http(),
    [rootstock.id]: http(),
    [rootstockTestnet.id]: http(),
    [flowTestnet.id]: http(),
  },
  ssr: true,
  // storage: undefined, // Comentado para permitir persistencia de wallet
});
