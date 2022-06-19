import InputNode from './components/InputNode/InputNode.svelte';
import OutputNode from './components/OutputNode/OutputNode.svelte';

export const inputNode = {
  outputs: {
    Value: {
      type: '',
    },
  },
  component: InputNode,
  color: 'linear-gradient(#673ab7, #563098)',
};

export const outputNode = {
  inputs: {
    Value: {
      type: '',
    },
  },
  component: OutputNode,
  color: 'linear-gradient(#673ab7, #563098)',
};