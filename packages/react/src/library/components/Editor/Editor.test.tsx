import Editor from './Editor';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom';

describe('React: Tests for the "Editor" component', () => {
  it('should render the editor', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      ReactDOM.render(<Editor nodes={{}} />, container);
    });

    const editor = container.querySelector('.function-junctions-editor');
    expect(editor).not.toBeNull();
  });
});
