import { createConfig, http } from "wagmi";
import { sepolia, localhost } from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia, localhost],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [localhost.id]: http("http://127.0.0.1:8545"),
  },
});
