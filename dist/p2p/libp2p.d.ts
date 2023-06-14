import type { Message } from '@libp2p/interface-pubsub';
import type { Multiaddr } from '@multiformats/multiaddr';
import type { Libp2p } from 'libp2p';
export declare function startLibp2p(bootstrapNodes?: string[]): Promise<Libp2p<{
    pubsub: import("@libp2p/interface-pubsub").PubSub<import("@chainsafe/libp2p-gossipsub").GossipsubEvents>;
    dht: import("@libp2p/kad-dht").DualKadDHT;
    identify: import("libp2p/dist/src/identify/identify").DefaultIdentifyService;
}>>;
export declare const setWebRTCRelayAddress: (maddrs: Multiaddr[], peerId: string) => void;
export declare function setCircuit(value: string): void;
export declare function copyToClipboard(element: HTMLButtonElement): void;
export declare function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array>;
export declare const connectToMultiaddr: (libp2p: Libp2p) => (multiaddr: Multiaddr) => Promise<import("@libp2p/interface-connection/dist/src").Connection>;
export declare const publishMessage: (libp2p: Libp2p) => (message: string) => Promise<void>;
