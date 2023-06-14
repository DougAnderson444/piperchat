<script>var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-ignore
import { publishMessage, startLibp2p, connectToMultiaddr } from '../p2p/libp2p';
import { multiaddr } from '@multiformats/multiaddr';
import { onMount } from 'svelte';
export let serverMultiaddr;
let myPeerId;
let connectButton;
let publish;
let multiaddrs = [];
let libp2p;
let messageInput;
onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    libp2p = yield startLibp2p(serverMultiaddr ? [serverMultiaddr] : null);
    // @ts-ignore
    window.libp2p = libp2p;
    myPeerId = libp2p.peerId.toString();
    libp2p.addEventListener('peer:connect', peerConnected);
    libp2p.addEventListener('connection:open', connectionOpened);
    // @ts-ignore
    libp2p.services.pubsub.addEventListener('message', handleMessage);
    autoScroller();
    enterListener();
}));
$: if (connectButton)
    setupConnector(connectButton);
$: if (publish)
    setupPublisher(publish);
// peerConnected(event) callback sets list of peers in browser
function peerConnected(event) {
    const peerId = event.detail;
}
function connectionOpened(event) {
    const { remoteAddr } = event.detail;
    //  add remoteAddr into multiaddr only if unique
    const multiaddr = remoteAddr.toString();
    // replace above code with Svelte, usign multiaddrs[] array
    if (multiaddrs.includes(multiaddr))
        return;
    multiaddrs = [...multiaddrs, multiaddr];
}
// handle messages using libp2p.services.pubsub.addEventListener('message', messageCB)
function handleMessage(evt) {
    console.log('handleMessage', evt.detail);
    const { topic, from, data } = evt.detail;
    const msg = new TextDecoder().decode(data);
    console.log(`${topic}: ${msg}`);
    // Append signed messages, otherwise discard
    if (evt.detail.type === 'signed') {
        // append to existing inner #messages div
        const messages = document.querySelector('#messages');
        const message = document.createElement('div');
        const peerId = from.toString().slice(-4);
        // if from == myPeerId, then align right. otherwise, align left using Tailwindcss classes
        // get last 4 of peerId from `from` :
        message.classList.add('flex', 'items-center', 'mb-2');
        let who = 'them';
        if (from.toString() == myPeerId) {
            who = 'me';
            message.classList.add('flex-row-reverse');
        }
        const messagePeerId = document.createElement('div');
        messagePeerId.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'w-12', 'h-12', 'm-2', 'text-neutral-700', who == 'them' ? 'bg-blue-100' : 'bg-green-100', 'rounded-full');
        messagePeerId.textContent = peerId;
        message.appendChild(messagePeerId);
        const messageText = document.createElement('div');
        messageText.classList.add('flex', 'flex-col', 'items-start', 'justify-center', 'w-2/3', 'h-auto', 'px-4', 'py-2', 'text-neutral-700', who == 'them' ? 'bg-blue-100' : 'bg-green-100', 'rounded-lg');
        messageText.textContent = msg;
        message.appendChild(messageText);
        messages.appendChild(message);
    }
}
// setupPublisher(element) callback
function setupPublisher(element) {
    element.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        // get message from input element
        const message = document.querySelector('#message').value;
        // publish message to topic
        yield publishMessage(
        // @ts-ignore
        window.libp2p)(message);
        messageInput.value = ''; // clear the input
    }));
}
function enterListener() {
    // Enter input listener on #message, click #publish button
    document.querySelector('#message').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            document.querySelector('#publish').click();
        }
    });
}
function autoScroller() {
    const scrollingElement = document.getElementById('messages');
    const config = { childList: true };
    const callback = function (mutationsList) {
        for (let mutation of mutationsList) {
            if (scrollingElement && mutation.type === 'childList') {
                scrollingElement.scrollTo(0, scrollingElement.scrollHeight);
            }
        }
    };
    const observer = new MutationObserver(callback);
    // @ts-ignore
    observer.observe(scrollingElement, config);
}
function setupConnector(element) {
    // get from multiaddr input element
    element.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        let maddr = document.querySelector('#multiaddr').value;
        const connection = yield connectToMultiaddr(
        // @ts-ignore
        window.libp2p)(multiaddr(maddr));
        console.log('connection: ', connection);
    }));
}
</script>

<div class="flex flex-col p-2 w-full h-screen text-neutral-800">
	<div class="inline text-5xl">
		<span class="font-extrabold text-green-700 drop-shadow-[0_10px_10px_rgba(255,255,255,0.25)]">
			PeerPiper
		</span>
		<span
			class="bg-gradient-to-b from-amber-400 to-red-600 bg-clip-text font-extrabold text-transparent
		drop-shadow-[0px_0px_4px_rgba(255,255,255,0.75)]"
		>
			is Hot!
		</span>
		<span class="font-light drop-shadow-[0px_0px_8px_rgba(255,255,255,0.75)]">🔥🌶️</span>
	</div>

	<!-- Show my peer id -->
	<div class="border rounded-lg p-2 my-1 bg-neutral-100 break-all">
		My peerid: {myPeerId ? myPeerId : 'loading...'}
	</div>

	<div class="flex w-full">
		<label for="name">WebRTC Multiaddr:</label>
		<input
			type="text"
			id="multiaddr"
			placeholder="/ip6/2607:fea8:fec0:7337:c801:d716:2390:f790/udp/9090/webrtc-direct/certhash/uEiCGy2PnRK-KmkckQRvSlyoZtptV3jF2tMOCX2NhXsfTig/p2p/12D3KooWQDZeK4DUxiksnvvDuhSx6csd7XzVT1GGWw7fPKyp9nBJ"
			bind:value={serverMultiaddr}
			class="border border-neutral-400 w-full p-2 m-2 rounded select-auto"
		/>
		<!-- button -->
		<button
			bind:this={connectButton}
			id="connect"
			class="p-2 m-2 rounded bg-green-500 text-white shadow-lg hover:bg-green-700"
		>
			Connect
		</button>
	</div>

	<!-- Connected to #peers -->
	<div id="multiaddrs" class="flex flex-col w-full h-28 overflow-scroll">
		{#each multiaddrs as multiaddr}
			<li class="text-neutral-700 text-sm px-2 py-1 list-none bg-transparent">
				{multiaddr}
			</li>
		{/each}
	</div>

	<!-- Circuit relay, with copy-to-clipboard button -->
	<div class="flex w-full select-none">
		<label for="name">C<span class="italic">ircuit Relay</span> Multiaddr:</label>
		<!-- wrap long text around in a new line -->
		<input
			type="text"
			id="circuit"
			class="border border-neutral-400 w-full p-2 m-2 rounded select-auto break-all"
		/>
		<!-- button -->
		<button id="copy" class="p-2 m-2 rounded bg-blue-500 text-white shadow-lg hover:bg-blue-700">
			Copy
		</button>
	</div>

	<!-- Chat element, with chat inner div always scrolled to the bottom -->
	<div
		id="messages"
		class="flex flex-col bg-neutral-100 w-full h-full border rounded overflow-y-scroll"
	>
		<div id="anchor" />
	</div>
	<!-- Chat input -->
	<div class="flex w-full">
		<input
			bind:this={messageInput}
			type="text"
			id="message"
			placeholder="Type a message"
			class="border border-neutral-400 w-full p-2 m-2 rounded select-auto"
		/>
		<!-- button -->
		<button
			bind:this={publish}
			id="publish"
			class="p-2 m-2 rounded bg-green-500 text-white shadow-lg hover:bg-green-700"
		>
			Send
		</button>

		<!-- button -->
		<button id="clear" class="p-2 m-2 rounded bg-blue-500 text-white shadow-lg hover:bg-blue-700">
			Clear
		</button>
	</div>
</div>

<style>.m-2 {
    margin: 0.5rem
}
.my-1 {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem
}
.mb-2 {
    margin-bottom: 0.5rem
}
.inline {
    display: inline
}
.flex {
    display: flex
}
.h-12 {
    height: 3rem
}
.h-28 {
    height: 7rem
}
.h-auto {
    height: auto
}
.h-full {
    height: 100%
}
.h-screen {
    height: 100vh
}
.w-12 {
    width: 3rem
}
.w-2\/3 {
    width: 66.666667%
}
.w-full {
    width: 100%
}
.select-none {
    -webkit-user-select: none;
       -moz-user-select: none;
            user-select: none
}
.select-auto {
    -webkit-user-select: auto;
       -moz-user-select: auto;
            user-select: auto
}
.list-none {
    list-style-type: none
}
.flex-row-reverse {
    flex-direction: row-reverse
}
.flex-col {
    flex-direction: column
}
.items-start {
    align-items: flex-start
}
.items-center {
    align-items: center
}
.justify-center {
    justify-content: center
}
.overflow-scroll {
    overflow: scroll
}
.overflow-y-scroll {
    overflow-y: scroll
}
.break-all {
    word-break: break-all
}
.rounded {
    border-radius: 0.25rem
}
.rounded-full {
    border-radius: 9999px
}
.rounded-lg {
    border-radius: 0.5rem
}
.border {
    border-width: 1px
}
.border-neutral-400 {
    --tw-border-opacity: 1;
    border-color: rgb(163 163 163 / var(--tw-border-opacity))
}
.bg-blue-100 {
    --tw-bg-opacity: 1;
    background-color: rgb(219 234 254 / var(--tw-bg-opacity))
}
.bg-blue-500 {
    --tw-bg-opacity: 1;
    background-color: rgb(59 130 246 / var(--tw-bg-opacity))
}
.bg-green-100 {
    --tw-bg-opacity: 1;
    background-color: rgb(220 252 231 / var(--tw-bg-opacity))
}
.bg-green-500 {
    --tw-bg-opacity: 1;
    background-color: rgb(34 197 94 / var(--tw-bg-opacity))
}
.bg-neutral-100 {
    --tw-bg-opacity: 1;
    background-color: rgb(245 245 245 / var(--tw-bg-opacity))
}
.bg-transparent {
    background-color: transparent
}
.bg-gradient-to-b {
    background-image: linear-gradient(to bottom, var(--tw-gradient-stops))
}
.from-amber-400 {
    --tw-gradient-from: #fbbf24 var(--tw-gradient-from-position);
    --tw-gradient-to: rgb(251 191 36 / 0) var(--tw-gradient-to-position);
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to)
}
.to-red-600 {
    --tw-gradient-to: #dc2626 var(--tw-gradient-to-position)
}
.bg-clip-text {
    -webkit-background-clip: text;
            background-clip: text
}
.p-2 {
    padding: 0.5rem
}
.px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem
}
.px-4 {
    padding-left: 1rem;
    padding-right: 1rem
}
.py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem
}
.py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem
}
.text-5xl {
    font-size: 3rem;
    line-height: 1
}
.text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem
}
.font-extrabold {
    font-weight: 800
}
.font-light {
    font-weight: 300
}
.italic {
    font-style: italic
}
.text-green-700 {
    --tw-text-opacity: 1;
    color: rgb(21 128 61 / var(--tw-text-opacity))
}
.text-neutral-700 {
    --tw-text-opacity: 1;
    color: rgb(64 64 64 / var(--tw-text-opacity))
}
.text-neutral-800 {
    --tw-text-opacity: 1;
    color: rgb(38 38 38 / var(--tw-text-opacity))
}
.text-transparent {
    color: transparent
}
.text-white {
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity))
}
.shadow-lg {
    --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}
.drop-shadow-\[0_10px_10px_rgba\(255\2c 255\2c 255\2c 0\.25\)\] {
    --tw-drop-shadow: drop-shadow(0 10px 10px rgba(255,255,255,0.25));
    filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)
}
.drop-shadow-\[0px_0px_4px_rgba\(255\2c 255\2c 255\2c 0\.75\)\] {
    --tw-drop-shadow: drop-shadow(0px 0px 4px rgba(255,255,255,0.75));
    filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)
}
.drop-shadow-\[0px_0px_8px_rgba\(255\2c 255\2c 255\2c 0\.75\)\] {
    --tw-drop-shadow: drop-shadow(0px 0px 8px rgba(255,255,255,0.75));
    filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)
}
.filter {
    filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)
}
.hover\:bg-blue-700:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(29 78 216 / var(--tw-bg-opacity))
}
.hover\:bg-green-700:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(21 128 61 / var(--tw-bg-opacity))
}</style>
