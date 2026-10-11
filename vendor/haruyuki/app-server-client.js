// src/types/app-server-info.ts
function isAppServerInfoResponseMessage(message) {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const candidate = message;
  const capabilities = candidate.capabilities;
  if (!capabilities || typeof capabilities !== "object" || Array.isArray(capabilities)) {
    return false;
  }
  const capabilityRecord = capabilities;
  return candidate.type === "app_server_info_response" && typeof candidate.request_id === "string" && candidate.request_id.length > 0 && candidate.success === true && (candidate.backend === "local" || candidate.backend === "api") && typeof candidate.letta_code_version === "string" && typeof candidate.protocol_version === "number" && Number.isInteger(candidate.protocol_version) && typeof capabilityRecord.agent_management === "boolean" && typeof capabilityRecord.conversation_management === "boolean" && typeof capabilityRecord.memory_management === "boolean" && typeof capabilityRecord.runtime_start === "boolean" && (capabilityRecord.agent_free_conversations === undefined || typeof capabilityRecord.agent_free_conversations === "boolean") && (capabilityRecord.launch_subagent === undefined || typeof capabilityRecord.launch_subagent === "boolean") && (capabilityRecord.runtime_workspace_sandbox === undefined || typeof capabilityRecord.runtime_workspace_sandbox === "boolean") && (capabilityRecord.runtime_external_tools_update === undefined || typeof capabilityRecord.runtime_external_tools_update === "boolean") && (capabilityRecord.structured_outputs === undefined || typeof capabilityRecord.structured_outputs === "boolean") && typeof capabilityRecord.split_channels === "boolean";
}

// src/app-server-client.ts
var DEFAULT_REQUEST_TIMEOUT_MS = 30000;
var WEBSOCKET_OPEN_STATE = 1;
function getGlobalWebSocket() {
  return globalThis.WebSocket;
}
function normalizeBaseUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol === "http:")
    parsed.protocol = "ws:";
  if (parsed.protocol === "https:")
    parsed.protocol = "wss:";
  if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
    throw new Error(`Unsupported app-server URL protocol: ${parsed.protocol}`);
  }
  if (!parsed.pathname || parsed.pathname === "/") {
    parsed.pathname = "/ws";
  }
  return parsed;
}
function resolveAppServerUrl(url) {
  const parsed = normalizeBaseUrl(url);
  parsed.searchParams.delete("channel");
  return parsed.toString();
}
function resolveAppServerChannelUrl(url, _channel) {
  return resolveAppServerUrl(url);
}
function attachSocketListener(socket, type, listener) {
  if (socket.addEventListener && socket.removeEventListener) {
    socket.addEventListener(type, listener);
    return () => socket.removeEventListener?.(type, listener);
  }
  if (socket.on) {
    socket.on(type, listener);
    return () => socket.off?.(type, listener);
  }
  throw new Error("WebSocket implementation does not support event listeners");
}
function onceSocketEvent(socket, type, listener) {
  if (socket.once) {
    socket.once(type, listener);
    return () => socket.off?.(type, listener);
  }
  let detach = () => {};
  detach = attachSocketListener(socket, type, (event) => {
    detach();
    listener(event);
  });
  return detach;
}
function waitForSocketOpen(socket) {
  if (socket.readyState === WEBSOCKET_OPEN_STATE) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    let detachOpen = () => {};
    let detachError = () => {};
    const cleanup = () => {
      detachOpen();
      detachError();
    };
    detachOpen = onceSocketEvent(socket, "open", () => {
      cleanup();
      resolve();
    });
    detachError = onceSocketEvent(socket, "error", (event) => {
      cleanup();
      reject(new Error(`App-server WebSocket failed to open: ${String(event)}`));
    });
  });
}
function rawEventData(event) {
  if (event && typeof event === "object" && "data" in event) {
    return event.data;
  }
  return event;
}
function messageDataToString(data) {
  const raw = rawEventData(data);
  if (typeof raw === "string")
    return raw;
  if (raw instanceof ArrayBuffer) {
    return new TextDecoder().decode(raw);
  }
  if (raw instanceof Uint8Array) {
    return new TextDecoder().decode(raw);
  }
  if (ArrayBuffer.isView(raw)) {
    return new TextDecoder().decode(new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength));
  }
  return String(raw);
}
function parseProtocolMessage(event) {
  return JSON.parse(messageDataToString(event));
}
function appServerSocketOptions(authToken) {
  if (authToken === undefined) {
    return;
  }
  const token = authToken.trim();
  if (!token) {
    throw new Error("app-server auth token must not be empty");
  }
  return { headers: { Authorization: `Bearer ${token}` } };
}

class AppServerClient {
  socket;
  control;
  stream;
  requestTimeoutMs;
  pending = new Map;
  messageHandlers = new Set;
  sendHandlers = new Set;
  disconnectHandlers = new Set;
  explicitlyClosed = false;
  disconnectNotified = false;
  nextRequestNumber = 0;
  constructor(options) {
    const WebSocket = options.WebSocket ?? getGlobalWebSocket();
    if (!WebSocket) {
      throw new Error("No WebSocket implementation available");
    }
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const socketOptions = appServerSocketOptions(options.authToken);
    this.socket = new WebSocket(resolveAppServerUrl(options.url), socketOptions);
    this.control = this.socket;
    this.stream = this.socket;
    attachSocketListener(this.socket, "message", (event) => {
      this.handleMessage(event, "control");
    });
    attachSocketListener(this.socket, "close", (event) => {
      this.handleDisconnect("control", event);
    });
  }
  async connect() {
    await waitForSocketOpen(this.socket);
    return this;
  }
  close() {
    if (this.explicitlyClosed)
      return;
    this.explicitlyClosed = true;
    this.rejectAllPending("App-server client closed");
    this.socket.close();
  }
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }
  onSend(handler) {
    this.sendHandlers.add(handler);
    return () => this.sendHandlers.delete(handler);
  }
  onDisconnect(handler) {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }
  nextRequestId(prefix = "req") {
    this.nextRequestNumber += 1;
    return `${prefix}-${this.nextRequestNumber}`;
  }
  send(command) {
    this.writeCommand(command);
  }
  writeCommand(command) {
    for (const handler of this.sendHandlers) {
      handler(command);
    }
    this.socket.send(JSON.stringify(command));
  }
  sendRaw(command) {
    this.writeCommand(command);
  }
  requestRaw(command, options) {
    const timeoutMs = options.timeoutMs ?? this.requestTimeoutMs;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(command.request_id);
        reject(new Error(`Timed out waiting for ${command.request_id}`));
      }, timeoutMs);
      this.pending.set(command.request_id, {
        resolve: (message) => resolve(message),
        reject,
        predicate: options.predicate,
        timeout
      });
      try {
        this.sendRaw(command);
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(command.request_id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  request(commandOrType, bodyOrOptions = {}, maybeOptions = {}) {
    const isTypeRequest = typeof commandOrType === "string";
    const command = isTypeRequest ? {
      type: commandOrType,
      request_id: bodyOrOptions.request_id ?? this.nextRequestId(commandOrType),
      ...bodyOrOptions
    } : commandOrType;
    const options = isTypeRequest ? maybeOptions : bodyOrOptions;
    const timeoutMs = options.timeoutMs ?? this.requestTimeoutMs;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(command.request_id);
        reject(new Error(`Timed out waiting for ${command.request_id}`));
      }, timeoutMs);
      this.pending.set(command.request_id, {
        resolve: (message) => resolve(message),
        reject,
        predicate: options.predicate,
        timeout
      });
      try {
        this.send(command);
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(command.request_id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  info(options = {}) {
    return this.request({
      type: "app_server_info",
      request_id: this.nextRequestId("app-server-info")
    }, {
      ...options,
      predicate: isAppServerInfoResponseMessage
    });
  }
  stopMonitor(command, options = {}) {
    return this.request({
      type: "monitor_stop",
      ...command,
      request_id: command.request_id ?? this.nextRequestId("monitor-stop")
    }, {
      ...options,
      predicate: (message) => message.type === "monitor_stop_response" && message.process_id === command.process_id && message.runtime.agent_id === command.runtime.agent_id && message.runtime.conversation_id === command.runtime.conversation_id
    });
  }
  launchSubagent(command, options = {}) {
    return this.request({
      ...command,
      type: "launch_subagent",
      request_id: command.request_id ?? this.nextRequestId("launch-subagent")
    }, {
      ...options,
      predicate: (message) => message.type === "launch_subagent_response"
    });
  }
  runtimeStart(command, options = {}) {
    return this.request({
      type: "runtime_start",
      request_id: command.request_id ?? this.nextRequestId("runtime-start"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "runtime_start_response"
    });
  }
  runtimeExternalToolsUpdate(command, options = {}) {
    return this.request({
      type: "runtime_external_tools_update",
      request_id: command.request_id ?? this.nextRequestId("runtime-external-tools"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "runtime_external_tools_update_response"
    });
  }
  sync(command, options = {}) {
    return this.request({
      type: "sync",
      request_id: command.request_id ?? this.nextRequestId("sync"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "sync_response"
    });
  }
  abort(command, options = {}) {
    return this.request({
      type: "abort_message",
      request_id: command.request_id ?? this.nextRequestId("abort"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "abort_message_response"
    });
  }
  resumeQueue(command, options = {}) {
    return this.request({
      type: "resume_queue",
      request_id: command.request_id ?? this.nextRequestId("resume-queue"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "resume_queue_response"
    });
  }
  conversationList(command = {}, options = {}) {
    return this.request({
      type: "conversation_list",
      request_id: command.request_id ?? this.nextRequestId("conversation-list"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "conversation_list_response"
    });
  }
  onExternalToolCall(handler) {
    return this.onMessage((message, channel) => {
      if (channel !== "control" || message.type !== "external_tool_call_request") {
        return;
      }
      Promise.resolve(handler(message)).then((result) => {
        this.send({
          type: "external_tool_call_response",
          request_id: message.request_id,
          result
        });
      }).catch((error) => {
        this.send({
          type: "external_tool_call_response",
          request_id: message.request_id,
          error: error instanceof Error ? error.message : String(error)
        });
      });
    });
  }
  input(command) {
    this.send({ type: "input", ...command });
  }
  submitInput(command, options = {}) {
    return this.request({
      type: "input",
      request_id: command.request_id ?? this.nextRequestId("input"),
      ...command
    }, {
      ...options,
      predicate: (message) => message.type === "input_accepted"
    });
  }
  handleMessage(event, channel) {
    const message = parseProtocolMessage(event);
    for (const handler of this.messageHandlers) {
      handler(message, channel);
    }
    const requestId = message && typeof message === "object" && "request_id" in message ? message.request_id : undefined;
    if (channel !== "control" || typeof requestId !== "string") {
      return;
    }
    const pending = this.pending.get(requestId);
    if (!pending || pending.predicate && !pending.predicate(message)) {
      return;
    }
    clearTimeout(pending.timeout);
    this.pending.delete(requestId);
    pending.resolve(message);
  }
  rejectAllPending(reason) {
    for (const [requestId, pending] of this.pending) {
      clearTimeout(pending.timeout);
      this.pending.delete(requestId);
      pending.reject(new Error(reason));
    }
  }
  handleDisconnect(channel, event) {
    this.rejectAllPending("App-server socket closed");
    if (this.explicitlyClosed || this.disconnectNotified)
      return;
    this.disconnectNotified = true;
    for (const handler of this.disconnectHandlers) {
      handler({ channel, event });
    }
  }
}
function createAppServerClient(options) {
  return new AppServerClient(options);
}
export {
  AppServerClient,
  createAppServerClient,
  isAppServerInfoResponseMessage,
  resolveAppServerChannelUrl,
  resolveAppServerUrl
};

//# debugId=26CFACDDF747D79C64756E2164756E21
