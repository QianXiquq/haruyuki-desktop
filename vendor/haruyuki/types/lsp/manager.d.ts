/**
 * LSP Manager - Orchestrates multiple LSP servers and maintains diagnostics
 */
import type { Diagnostic } from "./types.js";
/**
 * Global LSP Manager singleton
 * Manages LSP servers and aggregates diagnostics
 */
export declare class LSPManager {
    private static instance;
    private servers;
    private diagnostics;
    private openDocuments;
    private serverDefinitions;
    private enabled;
    private constructor();
    static getInstance(): LSPManager;
    /**
     * Initialize LSP system for a project
     */
    initialize(projectRoot: string): Promise<void>;
    /**
     * Get or start LSP server for a file
     */
    private getOrStartServer;
    /**
     * Notify LSP that a file was opened or touched
     */
    touchFile(filePath: string, changed: boolean): Promise<void>;
    /**
     * Update diagnostics for a file
     */
    private updateDiagnostics;
    /**
     * Get diagnostics for a specific file
     */
    getDiagnostics(filePath?: string): Diagnostic[];
    /**
     * Get language ID for a file
     */
    private getLanguageId;
    /**
     * Shutdown all LSP servers
     */
    shutdown(): Promise<void>;
}
export declare const lspManager: LSPManager;
//# sourceMappingURL=manager.d.ts.map