export type SubmissionResult = { ok: true; success: boolean } | { ok: false; message: string };

export const SUBMISSION_TIMEOUT_MS = 5000;

/**
 * Evaluate the user's code in a dedicated Web Worker (never on the main thread)
 * and resolve with the result. The worker is terminated after `timeoutMs`, so an
 * infinite loop cannot freeze the page.
 */
export function runSubmission(
	pid: string,
	code: string,
	timeoutMs: number = SUBMISSION_TIMEOUT_MS
): Promise<SubmissionResult> {
	return new Promise((resolve) => {
		const worker = new Worker(new URL("../workers/runSubmission.worker.ts", import.meta.url));
		const finish = (result: SubmissionResult) => {
			clearTimeout(timer);
			worker.terminate();
			resolve(result);
		};
		const timer = setTimeout(
			() => finish({ ok: false, message: `Time limit exceeded (${timeoutMs / 1000}s)` }),
			timeoutMs
		);
		worker.onmessage = (e: MessageEvent<SubmissionResult>) => finish(e.data);
		worker.onerror = (e) => finish({ ok: false, message: e.message || "Error running your code" });
		worker.postMessage({ pid, code });
	});
}
