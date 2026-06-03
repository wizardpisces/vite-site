import { execFileSync } from 'child_process';
import path from 'path';

const BLOG_DIR = 'src/blog';
const VIRTUAL_MODULE_ID = 'virtual:blog-freshness';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

function runGit(args, cwd) {
  try {
    return execFileSync('git', ['-c', 'core.quotePath=false', ...args], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function splitLines(output) {
  return output.split(/\r?\n/).filter(Boolean);
}

function listGitFiles(cwd, args) {
  return runGit(args, cwd)
    .split('\0')
    .filter(Boolean)
    .filter((filePath) => filePath.endsWith('.md'));
}

function toImportPath(filePath) {
  return `/${filePath.split(path.sep).join('/')}`;
}

function normalizeStatus(statusCode) {
  if (statusCode.startsWith('A') || statusCode.includes('A') || statusCode.includes('?')) {
    return 'added';
  }
  if (statusCode.trim()) {
    return 'modified';
  }
  return 'unknown';
}

function getWorkingTreeFreshness(cwd) {
  const now = Math.floor(Date.now() / 1000);
  const freshness = new Map();

  splitLines(runGit(['status', '--porcelain', '--', BLOG_DIR], cwd)).forEach((line) => {
    const statusCode = line.slice(0, 2);
    const pathPart = line.slice(3);
    const filePath = pathPart.includes(' -> ') ? pathPart.split(' -> ').pop() : pathPart;

    if (!filePath || !filePath.endsWith('.md')) return;

    freshness.set(filePath, {
      status: normalizeStatus(statusCode),
      changedAt: now,
      commitHash: '',
      source: 'working-tree',
    });
  });

  return freshness;
}

function getLastCommitFreshness(cwd, filePath) {
  const output = runGit(
    ['log', '-1', '--format=%ct%x09%H', '--name-status', '--', filePath],
    cwd
  ).trim();

  if (!output) {
    return {
      status: 'unknown',
      changedAt: 0,
      commitHash: '',
      source: 'unknown',
    };
  }

  const lines = splitLines(output);
  const [changedAtText, commitHash = ''] = lines[0].split('\t');
  const statusLine = lines.find((line) => line.includes('\t')) || '';
  const [statusCode = ''] = statusLine.split('\t');

  return {
    status: normalizeStatus(statusCode),
    changedAt: Number(changedAtText) || 0,
    commitHash,
    source: 'git',
  };
}

function createBlogFreshnessMap(root) {
  const trackedFiles = listGitFiles(root, ['ls-files', '-z', '--', BLOG_DIR]);
  const untrackedFiles = listGitFiles(root, ['ls-files', '--others', '--exclude-standard', '-z', '--', BLOG_DIR]);
  const workingTreeFreshness = getWorkingTreeFreshness(root);
  const files = new Set([...trackedFiles, ...untrackedFiles, ...workingTreeFreshness.keys()]);
  const freshnessByImportPath = {};

  files.forEach((filePath) => {
    freshnessByImportPath[toImportPath(filePath)] =
      workingTreeFreshness.get(filePath) || getLastCommitFreshness(root, filePath);
  });

  return freshnessByImportPath;
}

export default function blogFreshnessPlugin() {
  let root = process.cwd();

  return {
    name: 'vite-plugin-blog-freshness',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) {
        return null;
      }

      return `export default ${JSON.stringify(createBlogFreshnessMap(root), null, 2)};`;
    },
  };
}
