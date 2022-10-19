<script lang="ts">
  import type { SvelteComponentDev } from 'svelte/internal';
  import type { Point } from 'core/index';

  import type { InputSocket, OutputSocket } from 'core/components/Sockets';
  import type { NodeControlButtons } from 'core/components/NodeButton';

  import NodeButton from '../NodeButton/NodeButton.svelte';
  import Socket from '../Socket/Socket.svelte';
  import type { SvelteEditor } from '../Editor';

  export let title: string;
  export let id: string;

  export let inputs: Record<string, InputSocket<any>> | undefined;
  export let outputs: Record<string, OutputSocket<any>> | undefined;
  export let color: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let style: string | undefined = undefined;

  export let component: typeof SvelteComponentDev;
  export let coordinates: Point;

  export let nodeControlButtons: NodeControlButtons | boolean;

  export let deletable: boolean | undefined = undefined;
  export let cloneable: boolean | undefined = undefined;

  export let selected = false;

  export let store: Record<string, unknown> | undefined;

  export let editor: SvelteEditor;
</script>

<div
  class={`function-junctions-node ${selected ? 'function-junctions-node-selected' : ''} ${
    className ?? ''
  }`}
  style={`${style ? `${style};` : ''} transform: translate(${coordinates.x}px, ${coordinates.y}px)`}
  on:click
  on:mousedown
  on:touchstart
  on:contextmenu
>
  {#if cloneable ?? ((typeof nodeControlButtons === 'boolean' && nodeControlButtons) || (typeof nodeControlButtons === 'object' && nodeControlButtons.clone))}
    <div class="function-junctions-node-header">
      <NodeButton
        text="Clone"
        on:click={() => editor.cloneNode(id, { x: coordinates.x + 50, y: coordinates.y + 50 })}
      />
    </div>
  {/if}
  <div
    class="function-junctions-node-title"
    style={`background: ${color ?? 'linear-gradient(#228cfd, #007aff)'}`}
  >
    {title}
  </div>
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
            socketType={outputs[key].type}
            disabled={outputs[key].disabled}
            {editor}
          />
        {/each}
      </div>
    {/if}
    <div class="function-junctions-node-content">
      <svelte:component
        this={component}
        {title}
        {id}
        {editor}
        bind:store
        bind:inputs
        bind:outputs
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
            socketType={inputs[key].type}
            color={inputs[key].color}
            disabled={inputs[key].disabled}
            {editor}
          />
        {/each}
      </div>
    {/if}
  </div>
  {#if deletable ?? ((typeof nodeControlButtons === 'boolean' && nodeControlButtons) || (typeof nodeControlButtons === 'object' && nodeControlButtons.delete))}
    <div class="function-junctions-node-footer">
      <NodeButton text="Delete" color="rgb(255, 59, 48)" on:click={() => editor.deleteNode(id)} />
    </div>
  {/if}
</div>
