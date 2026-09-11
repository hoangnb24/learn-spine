import { StrictMode, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './Editor';
import { editorRuntime } from './runtime';
import { editorRegistration, getToolDownload, subscribeToolDownload } from './webmcp';
function App() {
  useSyncExternalStore(editorRuntime.subscribe, editorRuntime.getVersion, editorRuntime.getVersion);
  const download = useSyncExternalStore(subscribeToolDownload, getToolDownload, getToolDownload);
  const [status, setStatus] = useState('Đang kết nối tools');
  useEffect(() => {
    let active = true;
    void editorRegistration.then(result => {
      if (active) setStatus(result.ok ? 'Tools sẵn sàng qua WebMCP' : 'WebMCP chưa khả dụng');
    });
    return () => { active = false; };
  }, []);
  return <><Editor agentStatus={status}/>{download && <aside aria-label="Kết quả từ tools" style={{position:'fixed',right:16,bottom:36,padding:12,background:'#172832',color:'white',zIndex:20}}><a href={download.url} download={download.filename}>{download.revision !== editorRuntime.session?.inspect().revision ? 'Bản cũ · ' : ''}Tải kết quả bản {download.revision}</a></aside>}</>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
