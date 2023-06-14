import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        serverMultiaddr: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ChatProps = typeof __propDef.props;
export type ChatEvents = typeof __propDef.events;
export type ChatSlots = typeof __propDef.slots;
export default class Chat extends SvelteComponentTyped<ChatProps, ChatEvents, ChatSlots> {
}
export {};
