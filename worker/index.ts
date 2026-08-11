/** Minimal local Worker entry point required by vinext's Vite runtime. */
import handler from "vinext/server/app-router-entry";

const worker = {
  fetch: handler.fetch,
};

export default worker;
