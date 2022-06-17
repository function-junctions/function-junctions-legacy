<style lang="scss" global>
  @import './Compute.scss';
</style>

<script lang="ts">
  import type { NodeBlueprint } from '../Nodes';
  import { Editor, type EditorState } from '../Editor';
  import RawNode from '../Node/RawNode.svelte';
  import { writable, type Writable } from 'svelte/store';

  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState;

  export let inputs: Record<string, Record<string, Writable<unknown>>> = {};
  export let outputs: Record<string, Record<string, Writable<unknown>>> = {};

  export let instance = new Editor(writable(nodes), state, true, inputs, outputs);

  const { current: currentNodes } = instance.nodes;
  const { nodes: nodesState } = instance.state;
</script>

<div class="function-junctions-compute">
  {#each Object.keys($currentNodes) as key}
    {#if $currentNodes[key] && $nodesState[key]}
      <RawNode
        title={$currentNodes[key].type}
        id={key}
        component={$currentNodes[key].component}
        inputs={$currentNodes[key].inputs}
        outputs={$currentNodes[key].outputs}
        editor={instance}
        bind:store={$nodesState[key].store}
      />
    {/if}
  {/each}
</div>