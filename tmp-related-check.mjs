import http from "http";
import fs from "fs";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

const ver = JSON.parse(await get("http://127.0.0.1:9333/json/version"));
const ws = new WebSocket(ver.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const msgId = ++id;
  pending.set(msgId, { resolve, reject });
  ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
});
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const waiter = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) waiter.reject(new Error(JSON.stringify(msg.error)));
    else waiter.resolve(msg.result);
  }
};
await new Promise((resolve) => { ws.onopen = resolve; });
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
async function measure(width, url, scroll) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: width < 800 }, sessionId);
  await send("Page.navigate", { url }, sessionId);
  await new Promise((resolve) => setTimeout(resolve, 2200));
  const measured = await send("Runtime.evaluate", {
    expression: `(() => {
      const grid = document.querySelector(${JSON.stringify(scroll)});
      if (!grid) return { missing: true };
      const head = grid.previousElementSibling;
      (head || grid).scrollIntoView({ block: 'start' });
      window.scrollBy(0, -70);
      const cs = getComputedStyle(grid);
      const kids = [...grid.children].slice(0, 4).map((el) => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), x: Math.round(r.x), y: Math.round(r.y) };
      });
      return { width, cols: cs.gridTemplateColumns, count: grid.children.length, kids };
    })()`,
    returnByValue: true,
  }, sessionId);
  console.log(url, width, JSON.stringify(measured.result.value));
  await new Promise((resolve) => setTimeout(resolve, 250));
  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  const name = url.includes("olimini") ? `oli-related-${width}.png` : `oli-cat-${width}.png`;
  const out = process.env.TEMP + "\\" + name;
  fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
}

await measure(390, "http://127.0.0.1:3002/olimini", ".om-related__grid");
await measure(390, "http://127.0.0.1:3002/products", "main > div:last-child");
await measure(1280, "http://127.0.0.1:3002/olimini", ".om-related__grid");
ws.close();
