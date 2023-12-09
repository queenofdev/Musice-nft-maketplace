import AppContext from "@/context";
import "@/styles/globals.css";
import "typeface-kanit";
import "typeface-open-sans";
import "@fontsource/orbitron";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);
// Prvider key
// 2_BjTsvRbw-HqmukdAS8XLnCMaUrUJIg

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <AppContext>
        <Component {...pageProps} />
      </AppContext>
    </WagmiConfig>
  );
}
