import * as functions from "firebase-functions";
import next from "next";
import path from "path";

const dev = process.env.NODE_ENV !== "production";

// Note: The `dir` path is relative from the `functions/lib` folder (where the compiled .js file will be)
// to the root of your Next.js project.
// If your `functions` folder is at the root of your Next.js project,
// `../` points to the `functions` folder from `functions/lib`. We need `../../` to get to the project root.
const app = next({
  dev,
  conf: { distDir: ".next" }, // Tells Next.js where to find the build output
  dir: path.resolve(__dirname, "../../"), // Corrected path to Next.js project root
});

const handle = app.getRequestHandler();

export const nextServer = functions.https.onRequest((request: functions.https.Request, response: any) => { // Changed response type to any
  console.log("File: " + request.originalUrl); // optional: log the original URL
  return app.prepare().then(() => handle(request, response));
});
