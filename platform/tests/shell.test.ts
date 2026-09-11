import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Editor } from '../apps/editor/Editor';
import { Player } from '../apps/player/Player';
import { workspaceState } from '../src';

describe('independent empty applications', () => {
  it('renders both entry components without DOM, assets or a live project', () => {
    for (const App of [Editor, Player]) {
      const html = renderToStaticMarkup(createElement(App));
      expect(html).toContain('Chưa mở project');
      expect(html).toContain('data-workspace-state="empty"');
      expect(html).toContain('Mở gói');
      expect(html).not.toContain('<canvas');
    }
    expect(Object.isFrozen(workspaceState)).toBe(true);
  });
  it('keeps editor panels out of the independent player', () => {
    const editor = renderToStaticMarkup(createElement(Editor));
    const player = renderToStaticMarkup(createElement(Player));
    for (const label of ['Cấu trúc / Ảnh', 'Thuộc tính', 'Chuyển động']) {
      expect(editor).toContain(label);
      expect(player).not.toContain(label);
    }
  });
});
