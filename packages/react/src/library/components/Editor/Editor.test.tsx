import Editor from './Editor';
import * as React from 'react';
import { act, render } from '@testing-library/react';

describe('React: Tests for the "Editor" component', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should render the editor', async () => {
    await act(async () => render(<Editor nodes={{}} />));

    const editor = document.body.querySelector('.function-junctions-editor');
    expect(editor).not.toBeNull();
  });
});
