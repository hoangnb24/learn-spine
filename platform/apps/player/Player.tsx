import { workspaceState } from '../../src';
import { EmptyState, Footer, Header } from '../shared/Shell';

export function Player() {
  return <div className="application player" data-workspace-state={workspaceState.status}>
    <Header app="player"/>
    <main className="player-workspace" aria-label="Player"><span className="canvas-label">PLAYER</span><EmptyState title="Chưa mở project" description="Vùng xem riêng cho project của bạn" large/></main>
    <Footer player/>
  </div>;
}
