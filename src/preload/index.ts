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
  startRuntime: (agentId) => ipcRenderer.invoke("haruyuki:startRuntime", agentId) as ReturnType<HaruyukiApi["startRuntime"]>,
  sendMessage: (text) => ipcRenderer.invoke("haruyuki:sendMessage", text) as Promise<void>,
  respondApproval: (requestId, decision) =>
    ipcRenderer.invoke("haruyuki:respondApproval", requestId, decision) as Promise<void>,
  interrupt: () => ipcRenderer.invoke("haruyuki:interrupt") as Promise<void>,
  onStatus: (handler) => subscribe<ServerStatus>("haruyuki:status", handler),
  onEvent: (handler) => subscribe<HaruyukiEvent>("haruyuki:event", handler),
};

contextBridge.exposeInMainWorld("haruyuki", api);
