import { contextBridge, ipcRenderer } from "electron";
import type { HaruyukiApi, HaruyukiEvent, ServerStatus } from "@/shared/ipc-contract";

function subscribe<T>(channel: string, handler: (payload: T) => void): () => void {
  const listener = (_event: unknown, payload: T): void => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api: HaruyukiApi = {
  getStatus: () => ipcRenderer.invoke("haruyuki:getStatus") as Promise<ServerStatus>,
  listAgents: () => ipcRenderer.invoke("haruyuki:listAgents") as ReturnType<HaruyukiApi["listAgents"]>,
  listConversations: (agentId) =>
    ipcRenderer.invoke("haruyuki:listConversations", agentId) as ReturnType<
      HaruyukiApi["listConversations"]
    >,
  searchConversations: (agentId, query) =>
    ipcRenderer.invoke("haruyuki:searchConversations", agentId, query) as ReturnType<
      HaruyukiApi["searchConversations"]
    >,
  loadConversation: (conversationId) =>
    ipcRenderer.invoke("haruyuki:loadConversation", conversationId) as ReturnType<
      HaruyukiApi["loadConversation"]
    >,
  startRuntime: (agentId, mode, conversationId) =>
    ipcRenderer.invoke("haruyuki:startRuntime", agentId, mode, conversationId) as ReturnType<
      HaruyukiApi["startRuntime"]
    >,
  sendMessage: (text) => ipcRenderer.invoke("haruyuki:sendMessage", text) as Promise<void>,
  respondApproval: (requestId, decision) =>
    ipcRenderer.invoke("haruyuki:respondApproval", requestId, decision) as Promise<void>,
  interrupt: () => ipcRenderer.invoke("haruyuki:interrupt") as Promise<void>,
  recallStatus: () =>
    ipcRenderer.invoke("haruyuki:recallStatus") as ReturnType<HaruyukiApi["recallStatus"]>,
  recallBuild: () =>
    ipcRenderer.invoke("haruyuki:recallBuild") as ReturnType<HaruyukiApi["recallBuild"]>,
  recallProbe: (query) =>
    ipcRenderer.invoke("haruyuki:recallProbe", query) as ReturnType<HaruyukiApi["recallProbe"]>,
  recallSet: (setting) =>
    ipcRenderer.invoke("haruyuki:recallSet", setting) as ReturnType<HaruyukiApi["recallSet"]>,
  listMemory: (agentId) =>
    ipcRenderer.invoke("haruyuki:listMemory", agentId) as ReturnType<HaruyukiApi["listMemory"]>,
  readMemoryFile: (agentId, path) =>
    ipcRenderer.invoke("haruyuki:readMemoryFile", agentId, path) as ReturnType<
      HaruyukiApi["readMemoryFile"]
    >,
  writeMemoryFile: (agentId, path, content, commitMessage) =>
    ipcRenderer.invoke("haruyuki:writeMemoryFile", agentId, path, content, commitMessage) as ReturnType<
      HaruyukiApi["writeMemoryFile"]
    >,
  deleteMemoryFile: (agentId, path, commitMessage) =>
    ipcRenderer.invoke("haruyuki:deleteMemoryFile", agentId, path, commitMessage) as ReturnType<
      HaruyukiApi["deleteMemoryFile"]
    >,
  memoryHistory: (agentId, path, limit) =>
    ipcRenderer.invoke("haruyuki:memoryHistory", agentId, path, limit) as ReturnType<
      HaruyukiApi["memoryHistory"]
    >,
  deleteConversation: (conversationId) =>
    ipcRenderer.invoke("haruyuki:deleteConversation", conversationId) as ReturnType<
      HaruyukiApi["deleteConversation"]
    >,
  conversationTokens: (conversationId) =>
    ipcRenderer.invoke("haruyuki:conversationTokens", conversationId) as ReturnType<
      HaruyukiApi["conversationTokens"]
    >,
  conversationModel: (conversationId) =>
    ipcRenderer.invoke("haruyuki:conversationModel", conversationId) as ReturnType<
      HaruyukiApi["conversationModel"]
    >,
  conversationTitle: (conversationId) =>
    ipcRenderer.invoke("haruyuki:conversationTitle", conversationId) as ReturnType<
      HaruyukiApi["conversationTitle"]
    >,
  createAgent: (name) =>
    ipcRenderer.invoke("haruyuki:createAgent", name) as ReturnType<HaruyukiApi["createAgent"]>,
  renameConversation: (conversationId, summary) =>
    ipcRenderer.invoke("haruyuki:renameConversation", conversationId, summary) as ReturnType<
      HaruyukiApi["renameConversation"]
    >,
  listModels: () => ipcRenderer.invoke("haruyuki:listModels") as ReturnType<HaruyukiApi["listModels"]>,
  setModel: (modelId) =>
    ipcRenderer.invoke("haruyuki:setModel", modelId) as ReturnType<HaruyukiApi["setModel"]>,
  getWorkingDirectory: () =>
    ipcRenderer.invoke("haruyuki:getWorkingDirectory") as ReturnType<
      HaruyukiApi["getWorkingDirectory"]
    >,
  setWorkingDirectory: (path, applyToAll) =>
    ipcRenderer.invoke("haruyuki:setWorkingDirectory", path, applyToAll) as ReturnType<
      HaruyukiApi["setWorkingDirectory"]
    >,
  listDirectory: (path) =>
    ipcRenderer.invoke("haruyuki:listDirectory", path) as ReturnType<HaruyukiApi["listDirectory"]>,
  restartServer: () =>
    ipcRenderer.invoke("haruyuki:restartServer") as ReturnType<HaruyukiApi["restartServer"]>,
  onStatus: (handler) => subscribe<ServerStatus>("haruyuki:status", handler),
  onEvent: (handler) => subscribe<HaruyukiEvent>("haruyuki:event", handler),
};

contextBridge.exposeInMainWorld("haruyuki", api);
