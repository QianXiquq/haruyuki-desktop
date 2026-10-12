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
  recallSet: (setting) =>
    ipcRenderer.invoke("haruyuki:recallSet", setting) as ReturnType<HaruyukiApi["recallSet"]>,
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
