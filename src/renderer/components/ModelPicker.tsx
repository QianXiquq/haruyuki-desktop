import type { ModelCatalog } from "@/shared/ipc-contract";

interface Props {
  catalog: ModelCatalog | null;
  /** 当前生效的 model id。⚠️ 协议读不出来当前模型，所以这只反映**本次运行内我们设过的值**。 */
  currentId: string | null;
  disabled: boolean;
  busy: boolean;
  onSelect: (modelId: string) => void;
}

/** 推理档位的中文说法。`none` 用「默认」更贴近它的实际含义（不指定 effort）。 */
const EFFORT_LABEL: Record<string, string> = {
  none: "默认",
  minimal: "极简",
  low: "低",
  medium: "中",
  high: "高",
  xhigh: "极高",
  max: "最大",
};

/**
 * 模型选择器（`/model` 的 GUI 对应）。
 *
 * ## 一个必须处理的坑：同一个模型有多个档位
 *
 * `list_models` 实测对 deepseek 返回 **7 条，实际只有 2 个模型** —— `id` 里编码了
 * 推理档位（`deepseek-flash-none/low/high/max`），而 `label` 四条**完全一样**。
 *
 * 所以：
 * - 选项的 key 用 `id`，**不能用 label/handle**（会重复、会选错）
 * - 必须把档位显示出来，否则用户看到 4 条 "DeepSeek V4.1 Flash" 无从选择
 *
 * ## 另一个限制：当前模型读不出来
 *
 * `conversation_retrieve` 里没有任何 model 字段（实测为空），协议也没有"读当前模型"
 * 的命令。所以这里显示的"当前"只可能是**本次运行内我们设过的那个** ——
 * 重启应用后会回到未知。这一点在界面上如实说明，不假装知道。
 */
export function ModelPicker({ catalog, currentId, disabled, busy, onSelect }: Props) {
  const options = catalog?.options ?? [];
  const current = options.find((o) => o.id === currentId);

  if (options.length === 0) {
    return (
      <select className="model-select" disabled title="尚未取到模型列表">
        <option>{disabled ? "模型…" : "无可用模型"}</option>
      </select>
    );
  }

  return (
    <select
      className="model-select"
      value={currentId ?? ""}
      disabled={disabled || busy}
      title={
        current
          ? `当前模型：${current.label}（档位 ${EFFORT_LABEL[current.effort ?? ""] ?? "—"}）`
          : "当前模型未知 —— 协议不提供读取；这里只反映本次运行内切换过的模型"
      }
      onChange={(event) => onSelect(event.target.value)}
    >
      {currentId === null ? <option value="">模型（未知）</option> : null}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
          {option.effort ? ` · ${EFFORT_LABEL[option.effort] ?? option.effort}` : ""}
        </option>
      ))}
    </select>
  );
}
