export interface Env {
  COUNTER: DurableObjectNamespace;
  [key: string]: any;
}

export class Counter implements DurableObject {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    let count = ((await this.state.storage.get("count")) as number) || 0;
    count++;
    await this.state.storage.put("count", count);
    return Response.json({
      id: this.state.id.toString(),
      count,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/do") {
      const id = env.COUNTER.idFromName("test");
      const stub = env.COUNTER.get(id);
      return stub.fetch(request);
    }

    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string") {
        vars[key] = value;
      }
    }

    return Response.json({
      worker: "test-builds-do-isolation",
      branch: "feature/test-do-isolation",
      vars,
      routes: ["/do"],
    });
  },
};
