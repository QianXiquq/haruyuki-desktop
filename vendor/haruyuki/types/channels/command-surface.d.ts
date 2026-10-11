/**
 * Pure channel slash-command surface: the command list, parsing, help text,
 * and unknown-command messaging shared by every channel host.
 *
 * This module must stay free of host-local dependencies (plugin registry,
 * adapters, feedback handlers) so external channel hosts — e.g. Letta Cloud's
 * Slack gateway — can render the exact same command surface as
 * `haruyuki server --channel`. Command execution stays host-injected via
 * `ChannelSlashCommandHandlers`.
 *
 * Hosts with commands beyond the shared surface (e.g. Cloud's `/agent`,
 * `/config`, `/convo`) declare them via `ChannelSlashCommandSurfaceOptions`
 * so listing, help, and unknown-command rendering include them first-class.
 */
import type { ChannelModelPickerData, InboundChannelMessage } from "./types";
export type ChannelSlashCommandKind = "direct" | "agent-scoped";
export type ParsedChannelSlashCommand = {
    name: string;
    args: string;
    raw: string;
};
export type ChannelSlashCommandDefinition = {
    name: string;
    aliases?: string[];
    kind: ChannelSlashCommandKind;
    summary: string;
};
/**
 * Host-extra command surface options. External channel hosts (e.g. Letta
 * Cloud's Slack gateway with `/agent`, `/config`, `/convo`) pass their extra
 * definitions here so listing, help text, and unknown-command rendering
 * include them without any host-side merging.
 *
 * Semantics:
 * - Extras never override the shared surface: an extra whose name collides
 *   (case-insensitively) with a shared command name or alias, a Slack
 *   mention-only command name (`detach`, `new`), or an earlier extra is
 *   dropped, and extra aliases that collide are filtered.
 *   Shared-wins keeps hosts upgrade-safe when the shared surface later
 *   absorbs a command a host had been providing as an extra.
 * - Ordering is stable: shared commands first, in their fixed order, then the
 *   surviving extras in the order the host provided them. Help output renders
 *   extras in a labeled section (`extraCommandsLabel`).
 * - Omitting the options (or passing no extras) keeps every rendered string
 *   byte-identical to the extras-free surface.
 *
 * Parsing needs no extras hook: `parseChannelSlashCommand` /
 * `parseChannelBangCommand` already accept any command-shaped token so hosts
 * can dispatch extras (and render unknown-command replies) from the parsed
 * name.
 */
export type ChannelSlashCommandSurfaceOptions = {
    /** Host-specific command definitions appended after the shared surface. */
    extraCommands?: readonly ChannelSlashCommandDefinition[];
    /**
     * Section label for extras in help output, e.g. "Cloud-only commands".
     * Defaults to "Host commands".
     */
    extraCommandsLabel?: string;
};
export type ChannelSlashCommandHandlerResult = {
    handled: boolean;
    text?: string;
    modelPicker?: ChannelModelPickerData;
};
export type ChannelSlashCommandHandlers = {
    cancel?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    chat?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    detach?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    model?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    newConversation?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    pause?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    reflection?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    reload?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
    resume?: (command: ParsedChannelSlashCommand, msg: InboundChannelMessage) => Promise<ChannelSlashCommandHandlerResult>;
};
/** Resolves a channel id (e.g. "slack") to its human display name. */
export type ChannelDisplayNameResolver = (channelId: string) => string;
/**
 * Default display-name resolver: first-party channel display names, falling
 * back to the raw channel id. Hosts with a richer registry (e.g. user-installed
 * channel plugins) should inject their own resolver.
 */
export declare function defaultChannelDisplayName(channelId: string): string;
export declare function listChannelSlashCommands(options?: ChannelSlashCommandSurfaceOptions): ChannelSlashCommandDefinition[];
export declare function parseChannelSlashCommand(text: string): ParsedChannelSlashCommand | null;
export declare function parseChannelBangCommand(text: string): ParsedChannelSlashCommand | null;
export declare function isSupportedSlackMentionCommand(commandName: string): boolean;
export declare function buildChannelHelpMessage(channelId: string, resolveDisplayName?: ChannelDisplayNameResolver, options?: ChannelSlashCommandSurfaceOptions): string;
export declare function buildUnsupportedChannelCommandMessage(channelId: string, command: ParsedChannelSlashCommand, resolveDisplayName?: ChannelDisplayNameResolver, options?: ChannelSlashCommandSurfaceOptions): string;
//# sourceMappingURL=command-surface.d.ts.map