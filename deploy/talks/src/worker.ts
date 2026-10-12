// scripts/deploy-talks.ts stages talks-worker.ts, openrouter.ts and chat.json next to this file.
import settings from "./chat.json";
import { talksWorker } from "./talks-worker.js";

export default talksWorker(settings);
