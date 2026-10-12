// Static assets in ./public answer every request they match. Nothing else exists.
export default {
  fetch() {
    return new Response("Not found", { status: 404 });
  },
};
