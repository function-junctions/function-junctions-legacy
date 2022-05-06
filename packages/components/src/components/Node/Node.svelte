<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';
  import { Point } from '../../types';

  import { InputSocket, OutputSocket } from '../Socket';
  import { InputSockets, OutputSockets } from '../Sockets';

  export let title: string;
  export let inputs: InputSockets<Record<string, InputSocket<any>>> | undefined;
  export let outputs: OutputSockets<Record<string, OutputSocket<any>>> | undefined;
    
  export let component: typeof SvelteComponentDev;
  export let coordinates: Point;

</script>

<div class="function-junction-node">
  <div class="function-junction-node-title">{title}</div>
  <div class="function-junction-node-content">
    <div class="function-junction-node-inputs">
  
    </div>
    <div class="function-junction-node-content">
      <svelte:component this={component} {inputs} {outputs} />
    </div>
    <div class="function-junction-node-outputs">
  
    </div>
  </div>
</div>