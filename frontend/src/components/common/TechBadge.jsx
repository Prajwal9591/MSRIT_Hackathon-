import React from 'react';
import { Tooltip } from './Tooltip';

/**
 * Parses raw tech stack inputs (strings, objects, arrays) into standardized badge items.
 * Extracts versions if present in the string (e.g. "Next.js 14.2.3", "React v18.2.0") or version maps.
 *
 * @param {string|Array|Object} rawInput
 * @param {Object} categoryVersions
 * @returns {Array<{ name: string, version: string|null, isNone?: boolean, percentage?: number }>}
 */
export function parseTechItems(rawInput, categoryVersions = {}) {
  if (!rawInput) return [{ name: 'None detected', isNone: true }];

  if (Array.isArray(rawInput)) {
    if (rawInput.length === 0) return [{ name: 'None detected', isNone: true }];
    return rawInput.map((item) => {
      if (typeof item === 'string') {
        return parseSingleTech(item, categoryVersions);
      }
      if (item && typeof item === 'object') {
        const name = item.name || item.label || item.language || String(item);
        const version = item.version || categoryVersions[name] || categoryVersions[name?.toLowerCase()] || null;
        const percentage = item.percentage ?? null;
        return {
          name,
          version: formatVersion(version),
          percentage,
          isNone: item.isNone || name.toLowerCase() === 'none detected' || name.toLowerCase() === 'none'
        };
      }
      return { name: String(item), version: null };
    });
  }

  if (typeof rawInput === 'object') {
    const keys = Object.keys(rawInput).filter((k) => Boolean(rawInput[k]));
    if (keys.length === 0) return [{ name: 'None detected', isNone: true }];
    return keys.map((key) => {
      const val = rawInput[key];
      const version = typeof val === 'string' ? val : (val?.version || categoryVersions[key] || null);
      return {
        name: key,
        version: formatVersion(version)
      };
    });
  }

  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none detected' || trimmed.toLowerCase() === 'none') {
      return [{ name: 'None detected', isNone: true }];
    }

    // Handle "None (Power BI Desktop / Fabric)" or similar descriptive strings
    if (trimmed.startsWith('None (')) {
      const inside = trimmed.replace(/^None\s*\(/i, '').replace(/\)$/, '').trim();
      if (inside) {
        return inside.split('/').map((s) => parseSingleTech(s.trim(), categoryVersions));
      }
      return [{ name: 'None detected', isNone: true }];
    }

    // Handle parentheses: "Python (FastAPI / Flask / Django)" or "Data Model (DAX / M Engine)"
    const parenMatch = trimmed.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      const main = parenMatch[1].trim();
      const subs = parenMatch[2].split(/[/,]/).map((s) => s.trim()).filter(Boolean);
      const items = [main, ...subs];
      return items.map((it) => parseSingleTech(it, categoryVersions));
    }

    // Handle slashed "Next.js / React" or "Express / Node.js"
    if (trimmed.includes('/')) {
      return trimmed.split('/').map((s) => s.trim()).filter(Boolean).map((it) => parseSingleTech(it, categoryVersions));
    }

    // Handle comma-separated
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean).map((it) => parseSingleTech(it, categoryVersions));
    }

    return [parseSingleTech(trimmed, categoryVersions)];
  }

  return [{ name: String(rawInput), version: null }];
}

function formatVersion(ver) {
  if (!ver || typeof ver !== 'string') return null;
  const clean = ver.trim().replace(/^\^|~/, '');
  if (!clean) return null;
  return clean.startsWith('v') || clean.startsWith('V') ? clean : `v${clean}`;
}

function parseSingleTech(rawStr, categoryVersions = {}) {
  const str = rawStr.trim();
  if (!str || str.toLowerCase() === 'none detected' || str.toLowerCase() === 'none') {
    return { name: 'None detected', isNone: true, version: null };
  }

  // Regex to match "TechName v1.2.3" or "TechName 1.2.3" or "TechName ^14.2.0"
  const versionRegex = /^(.+?)\s+v?(\^|~)?(\d+(\.\d+)*(\.[a-zA-Z0-9_-]+)*)$/i;
  const match = str.match(versionRegex);
  if (match) {
    const name = match[1].trim();
    const ver = match[3];
    return {
      name,
      version: `v${ver}`
    };
  }

  // Check categoryVersions map
  const lower = str.toLowerCase();
  const directVersion = categoryVersions[str] || categoryVersions[lower];
  if (directVersion) {
    return {
      name: str,
      version: formatVersion(String(directVersion))
    };
  }

  return {
    name: str,
    version: null
  };
}

/**
 * Individual Technology Badge with icon, name, optional version pill, and optional tooltip.
 */
export const TechBadge = ({
  name,
  version,
  percentage,
  icon: Icon,
  colorTheme = 'cyan',
  isNone = false,
  isPrimary = false,
  tooltip
}) => {
  if (isNone || name === 'None detected' || name === 'None') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] font-mono text-slate-500 italic select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-600/70 shrink-0" />
        {name || 'None detected'}
      </span>
    );
  }

  const themeStyles = {
    cyan: {
      badge: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-200 hover:border-cyan-700/80 hover:bg-cyan-950/60 shadow-sm shadow-cyan-950/20',
      dot: 'bg-cyan-400 shadow-sm shadow-cyan-500/50',
      version: 'bg-cyan-900/70 border-cyan-700/60 text-cyan-300',
      icon: 'text-cyan-400'
    },
    indigo: {
      badge: 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200 hover:border-indigo-700/80 hover:bg-indigo-950/60 shadow-sm shadow-indigo-950/20',
      dot: 'bg-indigo-400 shadow-sm shadow-indigo-500/50',
      version: 'bg-indigo-900/70 border-indigo-700/60 text-indigo-300',
      icon: 'text-indigo-400'
    },
    emerald: {
      badge: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200 hover:border-emerald-700/80 hover:bg-emerald-950/60 shadow-sm shadow-emerald-950/20',
      dot: 'bg-emerald-400 shadow-sm shadow-emerald-500/50',
      version: 'bg-emerald-900/70 border-emerald-700/60 text-emerald-300',
      icon: 'text-emerald-400'
    },
    amber: {
      badge: 'bg-amber-950/40 border-amber-800/50 text-amber-200 hover:border-amber-700/80 hover:bg-amber-950/60 shadow-sm shadow-amber-950/20',
      dot: 'bg-amber-400 shadow-sm shadow-amber-500/50',
      version: 'bg-amber-900/70 border-amber-700/60 text-amber-300',
      icon: 'text-amber-400'
    },
    purple: {
      badge: 'bg-purple-950/40 border-purple-800/50 text-purple-200 hover:border-purple-700/80 hover:bg-purple-950/60 shadow-sm shadow-purple-950/20',
      dot: 'bg-purple-400 shadow-sm shadow-purple-500/50',
      version: 'bg-purple-900/70 border-purple-700/60 text-purple-300',
      icon: 'text-purple-400'
    },
    rose: {
      badge: 'bg-rose-950/40 border-rose-800/50 text-rose-200 hover:border-rose-700/80 hover:bg-rose-950/60 shadow-sm shadow-rose-950/20',
      dot: 'bg-rose-400 shadow-sm shadow-rose-500/50',
      version: 'bg-rose-900/70 border-rose-700/60 text-rose-300',
      icon: 'text-rose-400'
    },
    slate: {
      badge: 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700',
      dot: 'bg-slate-400',
      version: 'bg-slate-800 border-slate-700 text-slate-300',
      icon: 'text-slate-400'
    }
  }[colorTheme] || {
    badge: 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700',
    dot: 'bg-cyan-400',
    version: 'bg-slate-800 border-slate-700 text-slate-300',
    icon: 'text-cyan-400'
  };

  const primaryStyles = isPrimary
    ? 'ring-1 ring-amber-400/60 border-amber-500/60 bg-amber-950/50 text-amber-200 shadow-sm shadow-amber-950/40'
    : themeStyles.badge;

  const badgeElement = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all duration-200 text-xs font-semibold select-none group/badge ${primaryStyles}`}
    >
      {isPrimary ? (
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80 animate-pulse shrink-0" />
      ) : Icon ? (
        <Icon className={`h-3.5 w-3.5 shrink-0 opacity-90 ${themeStyles.icon}`} />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${themeStyles.dot}`} />
      )}
      <span className="truncate max-w-[140px] sm:max-w-[180px]">{name}</span>
      {isPrimary && (
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-900/80 px-1 py-0.2 rounded border border-amber-700/60 shrink-0">
          Primary
        </span>
      )}
      {version && (
        <span
          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 tracking-tight ${
            isPrimary ? 'bg-amber-900/60 border-amber-700/60 text-amber-200' : themeStyles.version
          }`}
        >
          {version}
        </span>
      )}
      {percentage !== undefined && percentage !== null && (
        <span
          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
            isPrimary
              ? 'text-amber-200 bg-amber-900/80 border-amber-700/80'
              : 'text-amber-300 bg-amber-950/80 border-amber-800/60'
          }`}
        >
          {percentage}%
        </span>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip title={name} content={tooltip} position="top">
        {badgeElement}
      </Tooltip>
    );
  }

  return badgeElement;
};

/**
 * Standard database and infrastructure label dictionaries for detected technology mapping.
 */
export const DB_LABELS = {
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  sqlite: 'SQLite',
  redis: 'Redis',
  supabase: 'Supabase',
  firebase: 'Firebase',
  prisma: 'Prisma (ORM)',
  drizzle: 'Drizzle (ORM)',
  typeorm: 'TypeORM'
};

export const INFRA_LABELS = {
  dockerfile: 'Docker',
  dockerCompose: 'Docker Compose',
  githubActions: 'GitHub Actions',
  gitlabCi: 'GitLab CI',
  jenkins: 'Jenkins',
  terraform: 'Terraform',
  kubernetes: 'Kubernetes',
  helmCharts: 'Helm Charts',
  nginx: 'Nginx',
  apache: 'Apache'
};

/**
 * Extracts and groups detected technologies from metadata into the 6 canonical categories:
 * 1. Frontend
 * 2. Backend
 * 3. Package Manager
 * 4. Languages
 * 5. Database
 * 6. Infrastructure
 */
export function extractGroupedTechnologies(effectiveMetadata = {}) {
  const techStack = effectiveMetadata.techStack || {};
  const versions = techStack.versions || effectiveMetadata.versions || {};
  const database = effectiveMetadata.databaseDetection || {};
  const infrastructure = effectiveMetadata.infrastructureDetection || {};
  const rawLanguages = effectiveMetadata.languageDistribution || [];

  // 1. Frontend Badges
  const frontendBadges = parseTechItems(
    techStack.frontendFramework || 'None detected',
    { ...versions, ...(effectiveMetadata.frontendVersions || {}) }
  );

  // 2. Backend Badges
  const backendBadges = parseTechItems(
    techStack.backendFramework || 'None detected',
    { ...versions, ...(effectiveMetadata.backendVersions || {}) }
  );

  // 3. Package Manager Badges
  const packageManagerBadges = parseTechItems(
    techStack.packageManager || 'None detected',
    { ...versions, ...(effectiveMetadata.packageManagerVersions || {}) }
  );

  // 4. Languages Badges
  const languageBadges = rawLanguages.length > 0
    ? rawLanguages.map((l) => ({
        name: l.language,
        percentage: l.percentage,
        version: formatVersion(l.version || versions[l.language] || versions[l.language?.toLowerCase()] || null)
      }))
    : [{ name: 'None detected', isNone: true }];

  // 5. Database Badges (Filtered from detected DB items)
  const detectedDbKeys = Object.keys(DB_LABELS).filter((k) => Boolean(database[k]));
  const databaseBadges = detectedDbKeys.length > 0
    ? detectedDbKeys.map((k) => ({
        name: DB_LABELS[k],
        version: formatVersion(
          (typeof database[k] === 'object' && database[k]?.version) ||
          effectiveMetadata.databaseVersions?.[k] ||
          versions[k] ||
          null
        )
      }))
    : (techStack.database && techStack.database !== 'None detected'
        ? parseTechItems(techStack.database, versions)
        : [{ name: 'None detected', isNone: true }]);

  // 6. Infrastructure Badges (Filtered from detected Infra items)
  const detectedInfraKeys = Object.keys(INFRA_LABELS).filter((k) => Boolean(infrastructure[k]));
  const infrastructureBadges = detectedInfraKeys.length > 0
    ? detectedInfraKeys.map((k) => ({
        name: INFRA_LABELS[k],
        version: formatVersion(
          (typeof infrastructure[k] === 'object' && infrastructure[k]?.version) ||
          effectiveMetadata.infrastructureVersions?.[k] ||
          versions[k] ||
          null
        )
      }))
    : (techStack.infrastructure && techStack.infrastructure !== 'None detected'
        ? parseTechItems(techStack.infrastructure, versions)
        : [{ name: 'None detected', isNone: true }]);

  const activeCount =
    frontendBadges.filter((b) => !b.isNone).length +
    backendBadges.filter((b) => !b.isNone).length +
    packageManagerBadges.filter((b) => !b.isNone).length +
    languageBadges.filter((b) => !b.isNone).length +
    databaseBadges.filter((b) => !b.isNone).length +
    infrastructureBadges.filter((b) => !b.isNone).length;

  return {
    frontendBadges,
    backendBadges,
    packageManagerBadges,
    languageBadges,
    databaseBadges,
    infrastructureBadges,
    rawLanguages,
    totalCount: activeCount
  };
}
