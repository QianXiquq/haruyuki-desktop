import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("找不到 #root 挂载点");

// 刻意不使用 StrictMode：它会二次挂载 effect，导致重复连接 app-server。
createRoot(container).render(<App />);
