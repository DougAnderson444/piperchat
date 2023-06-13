<script>
	import { Chat } from 'piperchat';
	import { onMount } from 'svelte';

	// if you have a preferred server multiaddr
	let serverMultiaddr =
		'/ip6/2607:fea8:fec0:827c::46cf/udp/9090/webrtc-direct/certhash/uEiChkj8djzx6evVQZFQdQB25z0-Hrf-GIDnxrd_xIoNycQ/p2p/12D3KooWSHFqhRLfUHLHDbipbb5m4RXnp3yjfoNtFUseGrvYCSGN';
</script>

<Chat {serverMultiaddr} />
