import { workspaceState } from '../../src';
import { EmptyState, Footer, Header, Panel } from '../shared/Shell';

export function Editor() {
  return <div className="application" data-workspace-state={workspaceState.status}>
    <Header app="editor"/>
    <div className="mode-bar" aria-label="Chế độ dự kiến"><span className="mode-placeholder">Setup</span><span className="mode-placeholder">Animate</span><p>Khung workspace · Các tính năng sẽ được bổ sung ở bước tiếp theo</p></div>
    <main className="editor-workspace" aria-label="Editor">
      <Panel title="Cấu trúc / Ảnh" className="structure-panel"><EmptyState title="Chưa có đối tượng" kind="folder"/></Panel>
      <section className="canvas-area" aria-label="Vùng làm việc"><span className="canvas-label">VÙNG LÀM VIỆC</span><EmptyState title="Chưa mở project" description="Không gian cho chuyển động của bạn" large/><span className="canvas-origin" aria-hidden="true">+</span></section>
      <Panel title="Thuộc tính" className="inspector-panel"><EmptyState title="Chưa chọn đối tượng" kind="file"/></Panel>
      <Panel title="Chuyển động" className="motion-panel"><EmptyState title="Chưa có chuyển động" kind="motion"/></Panel>
    </main>
    <Footer/>
  </div>;
}
