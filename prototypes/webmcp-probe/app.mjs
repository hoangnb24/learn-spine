import { createProbe, schemas } from './state.mjs';
const el = id => document.getElementById(id);
const events = [];
const probe = createProbe(event => {
  events.push({ at: new Date().toISOString(), ...event });
  if (events.length > 100) events.shift();
  const current = probe.state();
  el('value').textContent = current.value;
  el('revision').textContent = `Revision ${current.revision}`;
  el('outcome').textContent = event.result.ok ? `Đã thực hiện ${event.name}.` : `Không sửa trạng thái: ${event.result.error.code}`;
  el('log').textContent = JSON.stringify(events, null, 2);
});
const request = () => ({ expectedRevision: probe.state().revision, requestId: crypto.randomUUID() });
el('set').onclick = () => probe.call('probe_set', { ...request(), value: el('next').value === '' ? NaN : Number(el('next').value) }, { source: 'ui-handler' });
el('undo').onclick = () => probe.call('probe_undo', request(), { source: 'ui-handler' });
el('invalid').onclick = () => probe.call('probe_set', { ...request(), value: 'invalid' }, { source: 'ui-handler' });
el('cancel').onclick = async () => {
  const controller = new AbortController();
  const pending = probe.call('probe_set', { ...request(), value: 99, delayMs: 1000 }, { source: 'ui-handler', signal: controller.signal });
  controller.abort();
  await pending;
};

const connection = {
  userAgent: navigator.userAgent,
  secureContext: window.isSecureContext,
  documentModelContext: typeof document.modelContext?.registerTool === 'function',
  navigatorModelContext: typeof navigator.modelContext?.registerTool === 'function',
  registeredTools: [], registrationErrors: [],
  agentInvocation: 'not-yet-observed',
};
const surface = connection.documentModelContext ? 'document.modelContext' : connection.navigatorModelContext ? 'navigator.modelContext' : null;
connection.surface = surface;
const context = surface === 'document.modelContext' ? document.modelContext : surface ? navigator.modelContext : null;
el('native-cancel').onclick = async () => {
  if (typeof context?.getTools !== 'function' || typeof context?.executeTool !== 'function') {
    el('outcome').textContent = 'Trình duyệt chưa có API gọi/hủy tại trang.';
    return;
  }
  const controller = new AbortController();
  let timer;
  try {
    const registered = (await context.getTools()).find(tool => tool.name === 'probe_set');
    const pending = context.executeTool(registered, { ...request(), value: 99, delayMs: 1000 }, { signal: controller.signal });
    timer = setTimeout(() => controller.abort(), 100);
    await pending;
    el('outcome').textContent = controller.signal.aborted
      ? 'Đã yêu cầu hủy nhưng API vẫn trả kết quả. Kiểm tra nhật ký và trạng thái; chưa đạt kiểm tra hủy.'
      : 'Lệnh kết thúc trước khi yêu cầu hủy; chưa chứng minh khả năng hủy.';
  } catch (error) {
    el('outcome').textContent = `Kết quả gọi/hủy qua API trình duyệt: ${error.name}: ${error.message}`;
  } finally { clearTimeout(timer); }
};
el('environment').textContent = navigator.userAgent;
const showConnection = () => { el('connection').textContent = JSON.stringify(connection, null, 2); };
if (context) {
  for (const [name, inputSchema] of Object.entries(schemas)) {
    try {
      await context.registerTool({
        name,
        description: name === 'probe_read' ? 'Read the local probe value, revision and undo availability. No external data.' : name === 'probe_set' ? 'Set the local disposable probe integer from -100 to 100. Read current revision first. Undo is available. Optional delayMs allows testing cancellation.' : 'Undo the most recent local probe change. Read current revision first.',
        inputSchema,
        annotations: { readOnlyHint: name === 'probe_read' },
        execute: async (input, options) => {
          connection.agentInvocation = 'registered-callback-observed; verify caller log separately';
          showConnection();
          const result = await probe.call(name, input, { signal: options?.signal, source: `registered-tool:${surface}` });
          // Structured MCP content also works on earlier navigator implementations.
          return { content: [{ type: 'text', text: JSON.stringify(result) }], isError: !result.ok };
        },
      });
      connection.registeredTools.push(name);
    } catch (error) { connection.registrationErrors.push({ name, message: String(error) }); }
  }
}
el('status').textContent = connection.registeredTools.length === 3 ? 'Đã đăng ký 3 công cụ. Cần agent khám phá và gọi để xác nhận kết nối.' : 'Chưa đăng ký đủ công cụ WebMCP trong môi trường này.';
showConnection();
