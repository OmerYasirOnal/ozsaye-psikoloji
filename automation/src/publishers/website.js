import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "../config.js";
import { log } from "../util.js";

const execFileAsync = promisify(execFile);

async function git(args, cwd) {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trim();
}

/** YAML frontmatter için güvenli string (JSON çift tırnak biçimi YAML-uyumludur). */
function yamlStr(value) {
  return JSON.stringify(String(value ?? ""));
}

function buildMarkdown(content) {
  const fm = [
    "---",
    `title: ${yamlStr(content.title)}`,
    `description: ${yamlStr(content.description)}`,
    `date: ${yamlStr(content.date)}`,
    `category: ${yamlStr(content.category)}`,
    `author: ${yamlStr(content.author)}`,
    `tags: ${JSON.stringify(content.tags || [])}`,
    "---",
    "",
    content.bodyMarkdown.trim(),
    "",
  ];
  return fm.join("\n");
}

/** Aynı slug varsa benzersiz bir dosya yolu döndürür. */
function uniqueFilePath(dir, slug) {
  let candidate = path.join(dir, `${slug}.md`);
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${slug}-${n}.md`);
    n += 1;
  }
  return candidate;
}

/**
 * Onaylanan içeriği repoya markdown olarak yazar, commit'ler ve (autoPush ise)
 * deploy branch'ine push eder — bu da GitHub Actions FTP deploy'unu tetikler.
 * @returns {Promise<{url: string, file: string, pushed: boolean}>}
 */
export async function publishToWebsite(item) {
  const content = item.content;
  const contentDir = path.join(config.repoDir, config.website.contentDir);
  fs.mkdirSync(contentDir, { recursive: true });

  const filePath = uniqueFilePath(contentDir, content.slug);
  const finalSlug = path.basename(filePath, ".md");
  const relPath = path.relative(config.repoDir, filePath);
  const url = `${config.siteUrl}/yazilar/${finalSlug}/`;

  if (config.dryRun) {
    log.warn(`[DRY_RUN] Web yazısı yazılmadı: ${relPath}`);
    return { url, file: relPath, pushed: false };
  }

  fs.writeFileSync(filePath, buildMarkdown({ ...content, slug: finalSlug }), "utf8");
  log.ok(`Markdown yazıldı: ${relPath}`);

  if (!config.website.autoPush) {
    log.warn("GIT_AUTO_PUSH=false — commit/push atlandı. Dosyayı elle yayınlayın.");
    return { url, file: relPath, pushed: false };
  }

  try {
    await git(["add", relPath], config.repoDir);
    await git(
      ["commit", "-m", `İçerik: ${content.title}`],
      config.repoDir,
    );
    await git(["push", "origin", `HEAD:${config.website.deployBranch}`], config.repoDir);
    log.ok(`Push edildi → ${config.website.deployBranch} (FTP deploy tetiklendi)`);
    return { url, file: relPath, pushed: true };
  } catch (err) {
    log.error("Git işlemi başarısız:", err.message);
    throw err;
  }
}
