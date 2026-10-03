// Send www.lethen.dev to the apex. Every other request is served from the static assets.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.lethen.dev") {
      url.hostname = "lethen.dev";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
