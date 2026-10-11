import config from "../class.config.json";

export const repoUrl = "https://github.com/nicknisi/beyond-done";
export const glossaryUrl = config.hostname === "my-class.typevoid.com"
  ? null
  : `https://${config.hostname}/glossary/`;
