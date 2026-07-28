/**
 * Agent Compaction Extension
 * ──────────────────────────
 * Wrapper tool that makes /compact callable by the agent as a tool.
 *
 * Install:
 *   1. Add to settings.json `packages`:
 *        "npm:@steimbyte/pi-agent-compact"
 *   2. No further config needed.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "compact_context",
		label: "Compact Context",
		description:
			"Trigger context compaction to summarize older messages and free up context window. " +
			"Use when context is filling up, old work is no longer needed, or you want breathing room for new tasks. " +
			"The summary preserves goals, decisions, and file operations.",
		promptSnippet: "Summarize context and free up token budget",
		promptGuidelines: [
			"Use compact_context when the conversation is getting long and older messages are no longer relevant.",
			"Use compact_context proactively when you anticipate needing more context space.",
			"Use compact_context after completing a major task phase to consolidate history.",
		],
		parameters: Type.Object({
			customInstructions: Type.Optional(
				Type.String({
					description:
						"Optional guidance for what to preserve in the summary. " +
						"E.g., 'Focus on API design', 'Keep all file paths', 'Preserve error patterns'",
				})
			),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const customInstructions = params.customInstructions;
			const startTime = Date.now();

			return new Promise((resolve) => {
				ctx.compact({
					customInstructions,
					onComplete: () => {
						const elapsed = Date.now() - startTime;
						resolve({
							content: [{ type: "text", text: `✓ Compaction completed in ${(elapsed / 1000).toFixed(1)}s` }],
							details: { elapsedMs: elapsed },
						});
					},
					onError: (error) => {
						resolve({
							content: [{ type: "text", text: `✗ Compaction failed: ${error.message}` }],
							details: { error: error.message },
							isError: true,
						});
					},
				});
			});
		},
	});
}
