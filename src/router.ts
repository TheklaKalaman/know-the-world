export type Route = "" | "mode/regions-quiz" | "mode/regions-study";

export function getRoute(): Route {
  const hash = (location.hash || "#/").slice(2);
  if (hash === "") return "";
  if (hash === "mode/regions-quiz") return "mode/regions-quiz";
  if (hash === "mode/regions-study") return "mode/regions-study";
  return "";
}

export function navigate(to: Route) {
  location.hash = `#/${to}`;
}
