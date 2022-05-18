<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';
  import { Point } from '../../types';

  import './Node.scss';

  import { InputSocket, OutputSocket } from '../Socket';
  import { InputSockets, OutputSockets } from '../Sockets';

  import Socket from '../Socket/Socket.svelte';
  
  export let title: string;
  export let id: string;

  export let inputs: InputSockets<Record<string, InputSocket<any>>> | undefined;
  export let outputs: OutputSockets<Record<string, OutputSocket<any>>> | undefined;
  export let color: string | undefined = undefined;

  export let component: typeof SvelteComponentDev;
  export let coordinates: Point;

  export let selected = false;
</script>

<div
  class={`function-junction-node ${selected ? 'function-junction-node-selected' : ''}`}
  style={`transform: translate(${coordinates.x}px, ${coordinates.y}px)`}
  on:click
  on:mousedown
  on:contextmenu
>
  <div class="function-junction-node-title" style={`background: ${color ?? 'linear-gradient(#228cfd, #007aff)'}`}>{title}</div>
  <div class="function-junction-node-content">
    {#if outputs}
      <div class="function-junction-node-outputs">
        {#each Object.keys(outputs) as key}
          <Socket
            title={key}
            type="output"
            id={key}
            nodeId={id}
            color={outputs[key].color}
          />
        {/each}
      </div>
    {/if}
    <div class="function-junction-node-content">
      <svelte:component this={component} {inputs} {outputs} />
    </div>
    {#if inputs}
      <div class="function-junction-node-inputs">
        {#each Object.keys(inputs) as key}
          <Socket
            title={key}
            type="input"
            id={key}
            nodeId={id}
            color={inputs[key].color}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>