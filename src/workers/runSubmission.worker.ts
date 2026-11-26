/* Runs a user's submitted code against a problem's handler inside a Web Worker.
 *
 * A worker has no DOM, no localStorage/sessionStorage and no access to the page's
 * variables. Network and storage APIs that remain reachable from a worker
 * (fetch, XHR, WebSocket, IndexedDB, importScripts, ...) are removed before the
 * user's code is evaluated, so submitted code cannot read the Firebase auth
 * token persisted in IndexedDB or send it anywhere. The parent also terminates
 * the worker if it does not answer in time (see runSubmission.ts).
 */
import { problems } from "@/utils/problems";

const ctx = self as any;

const BLOCKED = [
	"fetch",
	"XMLHttpRequest",
	"WebSocket",
	"EventSource",
	"indexedDB",
	"IDBFactory",
	"caches",
	"importScripts",
	"BroadcastChannel",
	"navigator",
	"Worker",
	"SharedWorker",
	"postMessage",
];

function lockDown() {
	const post = ctx.postMessage.bind(ctx);
	for (const name of BLOCKED) {
		// Properties live on self or on a prototype in its chain; shadow them on
		// self and remove them from every prototype that defines them.
		let obj: any = ctx;
		while (obj && obj !== Object.prototype) {
			try {
				delete obj[name];
			} catch {}
			try {
				Object.defineProperty(obj, name, { value: undefined, configurable: false, writable: false });
			} catch {}
			obj = Object.getPrototypeOf(obj);
		}
	}
	return post;
}

ctx.onmessage = (event: MessageEvent<{ pid: string; code: string }>) => {
	const { pid, code } = event.data;
	const post = lockDown();
	try {
		const problem = problems[pid];
		if (!problem || typeof problem.handlerFunction !== "function") {
			post({ ok: false, message: "Unknown problem" });
			return;
		}
		const fn = new Function(`return ${code}`)();
		const success = problem.handlerFunction(fn);
		post({ ok: true, success: !!success });
	} catch (error: any) {
		post({ ok: false, message: String(error?.message ?? error) });
	}
};
