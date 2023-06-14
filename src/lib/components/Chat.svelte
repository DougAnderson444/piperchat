<script lang="ts">
	// @ts-ignore
	import { publishMessage, startLibp2p, connectToMultiaddr } from '$lib/p2p/libp2p';
	import { multiaddr } from '@multiformats/multiaddr';
	import { onMount } from 'svelte';

	export let serverMultiaddr;

	let myPeerId: string;
	let connectButton: HTMLButtonElement;
	let publish: HTMLButtonElement;
	let multiaddrs: string[] = [];
	let libp2p;
	let messageInput: HTMLInputElement;

	onMount(async () => {
		libp2p = await startLibp2p(serverMultiaddr ? [serverMultiaddr] : null);

		// @ts-ignore
		window.libp2p = libp2p;

		myPeerId = libp2p.peerId.toString();

		libp2p.addEventListener('peer:connect', peerConnected);
		libp2p.addEventListener('connection:open', connectionOpened);

		// @ts-ignore
		libp2p.services.pubsub.addEventListener('message', handleMessage);

		autoScroller();
		enterListener();
	});

	$: if (connectButton) setupConnector(connectButton);

	$: if (publish) setupPublisher(publish);

	// peerConnected(event) callback sets list of peers in browser
	function peerConnected(event: CustomEvent) {
		const peerId = event.detail;
	}

	function connectionOpened(event: CustomEvent) {
		const { remoteAddr } = event.detail;

		//  add remoteAddr into multiaddr only if unique
		const multiaddr = remoteAddr.toString();

		// replace above code with Svelte, usign multiaddrs[] array
		if (multiaddrs.includes(multiaddr)) return;
		multiaddrs = [...multiaddrs, multiaddr];
	}

	// handle messages using libp2p.services.pubsub.addEventListener('message', messageCB)
	function handleMessage(evt: CustomEvent) {
		console.log('handleMessage', evt.detail);

		const { topic, from, data } = evt.detail;
		const msg = new TextDecoder().decode(data);
		console.log(`${topic}: ${msg}`);

		// Append signed messages, otherwise discard
		if (evt.detail.type === 'signed') {
			// append to existing inner #messages div
			const messages = document.querySelector<HTMLDivElement>('#messages')!;
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
			messagePeerId.classList.add(
				'flex',
				'flex-col',
				'items-center',
				'justify-center',
				'w-12',
				'h-12',
				'm-2',
				'text-neutral-700',
				who == 'them' ? 'bg-blue-100' : 'bg-green-100',
				'rounded-full'
			);
			messagePeerId.textContent = peerId;
			message.appendChild(messagePeerId);
			const messageText = document.createElement('div');
			messageText.classList.add(
				'flex',
				'flex-col',
				'items-start',
				'justify-center',
				'w-2/3',
				'h-auto',
				'px-4',
				'py-2',
				'text-neutral-700',
				who == 'them' ? 'bg-blue-100' : 'bg-green-100',
				'rounded-lg'
			);
			messageText.textContent = msg;
			message.appendChild(messageText);
			messages.appendChild(message);
		}
	}

	// setupPublisher(element) callback
	function setupPublisher(element: HTMLButtonElement) {
		element.addEventListener('click', async () => {
			// get message from input element
			const message = document.querySelector<HTMLInputElement>('#message')!.value;

			// publish message to topic
			await publishMessage(
				// @ts-ignore
				window.libp2p
			)(message);

			messageInput.value = ''; // clear the input
		});
	}

	function enterListener() {
		// Enter input listener on #message, click #publish button
		document.querySelector<HTMLInputElement>('#message')!.addEventListener('keyup', (event) => {
			if (event.key === 'Enter') {
				document.querySelector<HTMLButtonElement>('#publish')!.click();
			}
		});
	}
	function autoScroller() {
		const scrollingElement = document.getElementById('messages');

		const config = { childList: true };

		const callback = function (mutationsList: any) {
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
	function setupConnector(element: HTMLButtonElement) {
		// get from multiaddr input element

		element.addEventListener('click', async () => {
			let maddr = document.querySelector<HTMLInputElement>('#multiaddr')!.value;

			const connection = await connectToMultiaddr(
				// @ts-ignore
				window.libp2p
			)(multiaddr(maddr));
			console.log('connection: ', connection);
		});
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

<style lang="postcss">
</style>
