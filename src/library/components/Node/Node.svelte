<style lang="scss" global>
  @import './Node.scss';
</style>

<script lang="ts">
  import type { SvelteComponentDev } from 'svelte/internal';
  import type { Point } from '../../types';
  import type { Editor } from '../Editor';
  
  import type {
    InputSockets,
    OutputSockets,
    InputSocket,
    OutputSocket,
  } from '../Sockets';

  import Socket from '../Socket/Socket.svelte';
  
  export let title: string;
  export let id: string;

  export let inputs: InputSockets<Record<string, InputSocket<any>>> | undefined;
  export let outputs: OutputSockets<Record<string, OutputSocket<any>>> | undefined;
  export let color: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let style: string | undefined = undefined;

  export let component: typeof SvelteComponentDev;
  export let coordinates: Point;

  export let selected = false;

  export let store: Record<string, unknown> | undefined;

  export let editor: Editor;
</script>

<div
  class={`function-junctions-node ${selected ? 'function-junctions-node-selected' : ''} ${className ?? ''}`}
  style={`${`${style};` ?? ''} transform: translate(${coordinates.x}px, ${coordinates.y}px)`}
  on:click
  on:mousedown
  on:contextmenu
>
  <div class="function-junctions-node-title" style={`background: ${color ?? 'linear-gradient(#228cfd, #007aff)'}`}>{title}</div>
  <div class="function-junctions-node-content">
    {#if outputs}
      <div class="function-junctions-node-outputs">
        {#each Object.keys(outputs) as key}
          <Socket
            title={key}
            type="output"
            id={key}
            nodeId={id}
            color={outputs[key].color}
            {editor}
          />
        {/each}
      </div>
    {/if}
    <div class="function-junctions-node-content">
      <svelte:component
        this={component}
        {inputs}
        {outputs}
        bind:store
      />
    </div>
    {#if inputs}
      <div class="function-junctions-node-inputs">
        {#each Object.keys(inputs) as key}
          <Socket
            title={key}
            type="input"
            id={key}
            nodeId={id}
            color={inputs[key].color}
            {editor}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>