import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// automation/src -> automation -> repo kökü
const AUTOMATION_DIR = path.resolve(__dirname, "..");
const DEFAULT_REPO_DIR = path.resolve(AUTOMATION_DIR, "..");

const bool = (v, fallback = false) =>
  v === undefined ? fallback : String(v).toLowerCase() === "true";

export const config = {
  automationDir: AUTOMATION_DIR,
  dataDir: path.join(AUTOMATION_DIR, "data"),
  repoDir: process.env.REPO_DIR?.trim() || DEFAULT_REPO_DIR,

  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
    temperature: Number(process.env.OLLAMA_TEMPERATURE ?? 0.7),
  },

  website: {
    deployBranch: process.env.WEBSITE_DEPLOY_BRANCH || "main",
    autoPush: bool(process.env.GIT_AUTO_PUSH, true),
    contentDir: "content/yazilar", // repoDir'e göreli
  },

  meta: {
    graphVersion: process.env.META_GRAPH_VERSION || "v21.0",
    fbPageId: process.env.FB_PAGE_ID || "",
    fbPageToken: process.env.FB_PAGE_ACCESS_TOKEN || "",
    igUserId: process.env.IG_USER_ID || "",
    igToken: process.env.IG_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN || "",
  },

  platforms: {
    website: bool(process.env.PUBLISH_WEBSITE, true),
    facebook: bool(process.env.PUBLISH_FACEBOOK, true),
    instagram: bool(process.env.PUBLISH_INSTAGRAM, true),
  },

  schedule: {
    generateCron: process.env.GENERATE_CRON || "0 10 * * 1,3,5",
    publishCron: process.env.PUBLISH_CRON || "0 * * * *",
    timezone: process.env.TZ || "Europe/Istanbul",
  },

  siteUrl: "https://ozsayepsikoloji.com",
  dryRun: bool(process.env.DRY_RUN, false),
};
