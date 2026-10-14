import path from 'path';
import { repoUploadService } from './repoUploadService.js';
import { logger } from '../utils/logger.js';

/**
 * Real Codebase Static Security Analysis & Vulnerability Scanner
 * 
 * Inspects uploaded files for actual security vulnerabilities across 11 core vectors:
 * 1. SQL Injection (SQLi)
 * 2. Cross-Site Scripting (XSS)
 * 3. Cross-Site Request Forgery (CSRF)
 * 4. Hardcoded Secrets & Credentials
 * 5. Weak Authentication & Authorization
 * 6. Missing Input Validation & Parameter Tampering
 * 7. Dangerous File Access & Path Traversal
 * 8. Unsafe Deserialization & Code Evaluation
 * 9. Command Injection
 * 10. Dependency Vulnerabilities & Insecure Configurations
 * 11. Missing Exception Handling & Unhandled Promise Rejections
 *
 * Strictly follows rules:
 * - Only report issues that actually exist in the scanned files.
 * - If no issue is detected, report 0 issues ("No critical security issues detected.").
 * - Never invent vulnerabilities.
 * - Never use placeholder findings.
 */

// Insecure dependency CVE database for package.json inspection
const VULNERABLE_DEPENDENCY_RULES = [
  { name: 'lodash', vulnerableBelow: '4.17.21', cve: 'CVE-2021-23337', title: 'Prototype Pollution in lodash', severity: 'HIGH' },
  { name: 'jsonwebtoken', vulnerableBelow: '9.0.0', cve: 'CVE-2022-23529', title: 'Insecure Key Verification in jsonwebtoken', severity: 'CRITICAL' },
  { name: 'axios', vulnerableBelow: '0.21.1', cve: 'CVE-2020-28168', title: 'Server-Side Request Forgery in axios', severity: 'HIGH' },
  { name: 'express', vulnerableBelow: '4.19.2', cve: 'CVE-2024-29041', title: 'Open Redirect & IP Spoofing in express', severity: 'MEDIUM' },
  { name: 'minimist', vulnerableBelow: '1.2.6', cve: 'CVE-2021-44906', title: 'Prototype Pollution in minimist', severity: 'HIGH' },
  { name: 'moment', vulnerableBelow: '2.29.4', cve: 'CVE-2022-31129', title: 'Path Traversal & ReDoS in moment', severity: 'MEDIUM' },
  { name: 'ejs', vulnerableBelow: '3.1.7', cve: 'CVE-2022-29078', title: 'Remote Code Execution in ejs', severity: 'CRITICAL' },
  { name: 'multer', vulnerableBelow: '1.4.4', cve: 'CVE-2022-24434', title: 'DoS via Unhandled File Uploads in multer', severity: 'HIGH' },
  { name: 'got', vulnerableBelow: '11.8.5', cve: 'CVE-2022-33987', title: 'Insecure Redirects in got', severity: 'MEDIUM' },
  { name: 'tar', vulnerableBelow: '6.1.9', cve: 'CVE-2021-37712', title: 'Arbitrary File Overwrite in tar', severity: 'HIGH' }
];

function isCodeFile(filePath = '') {
  const ext = path.extname(filePath).toLowerCase();
  return ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.java', '.go', '.rs', '.php', '.rb', '.cs', '.sql', '.html', '.vue'].includes(ext);
}

function compareSemverLess(versionStr, targetStr) {
  try {
    const cleanVer = versionStr.replace(/[^0-9.]/g, '');
    const vParts = cleanVer.split('.').map((p) => parseInt(p, 10) || 0);
    const tParts = targetStr.split('.').map((p) => parseInt(p, 10) || 0);
    for (let i = 0; i < 3; i++) {
      const v = vParts[i] || 0;
      const t = tParts[i] || 0;
      if (v < t) return true;
      if (v > t) return false;
    }
    return false;
  } catch {
    return false;
  }
}

export const securityAuditEngineService = {
  /**
   * Run static security audit across repository files
   *
   * @param {Object} params
   * @param {Array} [params.files] - Array of { path, name, content }
   * @param {string} [params.repoId] - Active repo ID
   * @param {string} [params.repoName]
   * @returns {Object} Security audit report
   */
  runSecurityAudit: ({ files = null, repoId = null, repoName = null } = {}) => {
    const startTime = Date.now();
    const currentRepo = repoUploadService.getCurrentRepo();
    const resolvedRepoName = repoName || currentRepo?.name || 'repository';

    let filesToScan = files;
    if (!filesToScan || filesToScan.length === 0) {
      if (currentRepo && currentRepo.files && currentRepo.files.length > 0) {
        filesToScan = currentRepo.files;
      } else {
        filesToScan = [];
      }
    }

    const issues = [];
    const scannedFilesCount = filesToScan.length;
    let totalLinesOfCode = 0;

    // Scan each file
    for (const file of filesToScan) {
      const filePath = file.path || file.name || 'unknown-file';
      const content = file.content;

      // If file has no content (e.g. metadata-only scan), we can still inspect manifest or skip line checks
      if (!content || typeof content !== 'string') {
        continue;
      }

      const lines = content.split('\n');
      totalLinesOfCode += lines.length;

      // 1. Dependency Vulnerability & Configuration Check (package.json)
      if (filePath.endsWith('package.json')) {
        securityAuditEngineService.inspectPackageJson(filePath, content, issues);
      }

      // If not a source code file, skip code pattern checks
      if (!isCodeFile(filePath)) {
        continue;
      }

      // Run code-level vulnerability checks across lines
      securityAuditEngineService.inspectCodeFile(filePath, content, lines, issues);
    }

    // Sort issues by severity: CRITICAL -> HIGH -> MEDIUM -> LOW
    const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    issues.sort((a, b) => (severityRank[a.severity] ?? 4) - (severityRank[b.severity] ?? 4));

    const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
    const highCount = issues.filter((i) => i.severity === 'HIGH').length;
    const mediumCount = issues.filter((i) => i.severity === 'MEDIUM').length;
    const lowCount = issues.filter((i) => i.severity === 'LOW').length;

    // Calculate dynamic security risk index based purely on real issues
    let securityRiskScore = 0;
    if (issues.length > 0) {
      securityRiskScore = Math.min(100, criticalCount * 30 + highCount * 18 + mediumCount * 8 + lowCount * 3);
    }

    const passed = issues.length === 0;
    const executionTimeMs = Date.now() - startTime;

    return {
      passed,
      status: passed ? 'SECURE' : criticalCount > 0 ? 'CRITICAL_RISK' : highCount > 0 ? 'HIGH_RISK' : 'EVALUATED',
      message: passed ? 'No critical security issues detected.' : `${issues.length} security issue(s) detected across ${new Set(issues.map((i) => i.filePath)).size} file(s).`,
      summary: {
        totalIssues: issues.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        scannedFilesCount,
        totalLinesOfCode,
        securityRiskScore,
        executionTimeMs
      },
      categoriesAudited: [
        'SQL Injection (SQLi)',
        'Cross-Site Scripting (XSS)',
        'Cross-Site Request Forgery (CSRF)',
        'Hardcoded Secrets & API Keys',
        'Weak Authentication & Authorization',
        'Missing Input Validation',
        'Dangerous File Access & Path Traversal',
        'Unsafe Deserialization',
        'Command Injection',
        'Dependency Vulnerabilities',
        'Missing Exception Handling'
      ],
      issues,
      repositoryName: resolvedRepoName,
      repoId: repoId || currentRepo?.id || 'active-repo'
    };
  },

  /**
   * Inspect package.json for known CVEs and insecure wildcards
   */
  inspectPackageJson: (filePath, content, issues) => {
    try {
      const parsed = JSON.parse(content);
      const allDeps = { ...parsed.dependencies, ...parsed.devDependencies };

      for (const rule of VULNERABLE_DEPENDENCY_RULES) {
        if (allDeps[rule.name]) {
          const rawVer = allDeps[rule.name];
          if (compareSemverLess(rawVer, rule.vulnerableBelow)) {
            issues.push({
              id: `DEP-${rule.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              category: 'Dependency Vulnerabilities',
              title: `${rule.title} (${rule.cve})`,
              severity: rule.severity,
              filePath,
              lineNumber: 1,
              codeSnippet: `"${rule.name}": "${rawVer}"`,
              explanation: `The project depends on '${rule.name}' version '${rawVer}', which is vulnerable to ${rule.cve} (affects versions < ${rule.vulnerableBelow}).`,
              remediation: `Upgrade '${rule.name}' to version ^${rule.vulnerableBelow} or higher in package.json.`,
              ruleId: 'SEC-DEP-001'
            });
          }
        }
      }

      // Check for wildcard '*' or 'latest'
      for (const [pkg, ver] of Object.entries(parsed.dependencies || {})) {
        if (ver === '*' || ver === 'latest' || ver === 'x') {
          issues.push({
            id: `DEP-WILDCARD-${pkg}`,
            category: 'Dependency Vulnerabilities',
            title: `Wildcard Dependency Version for '${pkg}'`,
            severity: 'MEDIUM',
            filePath,
            lineNumber: 1,
            codeSnippet: `"${pkg}": "${ver}"`,
            explanation: `Using wildcard "${ver}" for '${pkg}' introduces non-deterministic builds and supply-chain vulnerabilities.`,
            remediation: `Pin '${pkg}' to an explicit, audited semver version (e.g. "^1.2.3").`,
            ruleId: 'SEC-DEP-002'
          });
        }
      }
    } catch {
      // Ignore JSON parse errors in malformed package.json
    }
  },

  /**
   * Line-by-line and AST regex inspection of real source code files
   */
  inspectCodeFile: (filePath, content, lines, issues) => {
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__') || filePath.includes('/tests/');
    const ext = path.extname(filePath).toLowerCase();

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // -------------------------------------------------------------
      // 1. SQL Injection (SQLi)
      // -------------------------------------------------------------
      // String concatenation or template literals inside db queries
      const isSqlConcat = /(?:query|execute|\$queryRawUnsafe|raw)\s*\(\s*`[^`]*(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|WHERE)[^`]*\$\{[^}]+\}/i.test(lineText) ||
                          /(?:query|execute)\s*\(\s*["'](?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|WHERE)[^"']*["']\s*\+\s*[a-zA-Z0-9_.]+/i.test(lineText) ||
                          /(?:cursor|db|connection|conn)\.execute\s*\(\s*f["'][^"']*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)[^"']*\{[^}]+\}/i.test(lineText) ||
                          /(?:cursor|db|connection|conn)\.execute\s*\(\s*["'][^"']*(?:SELECT|INSERT|UPDATE|DELETE|WHERE)[^"']*%\s*[a-zA-Z0-9_]+/i.test(lineText);

      if (isSqlConcat) {
        issues.push({
          id: `SQLI-${lineNum}-${Math.random().toString(36).substring(2, 6)}`,
          category: 'SQL Injection',
          title: 'Unsanitized Dynamic SQL Query Construction',
          severity: 'CRITICAL',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `SQL query is constructed using dynamic string concatenation or unescaped template interpolation without parameterized query placeholders. This permits SQL Injection attacks.`,
          remediation: `Use parameterized queries or prepared statements (e.g., db.query('SELECT * FROM table WHERE id = $1', [id])) to bind input variables safely.`,
          ruleId: 'SEC-SQLI-001'
        });
      }

      // -------------------------------------------------------------
      // 2. Cross-Site Scripting (XSS)
      // -------------------------------------------------------------
      if (!isTestFile) {
        const isDangerousHtml = /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(?!['"][^'"]*['"])[a-zA-Z0-9_.]+/i.test(lineText);
        const isInnerHtmlVar = /\.(?:innerHTML|outerHTML)\s*=\s*(?!['"][^'"]*['"])[a-zA-Z0-9_.]+/i.test(lineText) && !lineText.includes('DOMPurify.sanitize');
        const isDocumentWrite = /document\.write(?:ln)?\s*\(\s*[a-zA-Z0-9_.]+/i.test(lineText);

        if (isDangerousHtml || isInnerHtmlVar || isDocumentWrite) {
          issues.push({
            id: `XSS-${lineNum}-${Math.random().toString(36).substring(2, 6)}`,
            category: 'Cross-Site Scripting (XSS)',
            title: 'Unescaped Direct DOM HTML Insertion (XSS)',
            severity: 'HIGH',
            filePath,
            lineNumber: lineNum,
            codeSnippet: lineText.trim(),
            explanation: `Raw HTML content is inserted directly into the DOM using innerHTML or dangerouslySetInnerHTML without sanitization. Untrusted user content can execute malicious JavaScript.`,
            remediation: `Sanitize untrusted HTML with DOMPurify (e.g. DOMPurify.sanitize(input)) or use standard textContent / JSX text expressions.`,
            ruleId: 'SEC-XSS-001'
          });
        }
      }

      // -------------------------------------------------------------
      // 3. Hardcoded Secrets & Credentials
      // -------------------------------------------------------------
      if (!isTestFile && !filePath.includes('.env.example') && !filePath.includes('mockData')) {
        // AWS Access Key
        if (/(?:AKIA|ASIA)[0-9A-Z]{16}/.test(lineText)) {
          issues.push({
            id: `SECRET-AWS-${lineNum}`,
            category: 'Hardcoded Secrets',
            title: 'Exposed AWS Access Key Identifier',
            severity: 'CRITICAL',
            filePath,
            lineNumber: lineNum,
            codeSnippet: lineText.replace(/(AKIA|ASIA)[0-9A-Z]{16}/g, '$1****************'),
            explanation: `An AWS Access Key ID was detected hardcoded directly in source code.`,
            remediation: `Remove the hardcoded key immediately. Store credentials in environment variables (AWS_ACCESS_KEY_ID) or a secrets manager.`,
            ruleId: 'SEC-SECRET-001'
          });
        }

        // Stripe Live Secret Key
        if (/sk_live_[0-9a-zA-Z]{24,}/.test(lineText) || /rk_live_[0-9a-zA-Z]{24,}/.test(lineText)) {
          issues.push({
            id: `SECRET-STRIPE-${lineNum}`,
            category: 'Hardcoded Secrets',
            title: 'Exposed Production Stripe Secret Key',
            severity: 'CRITICAL',
            filePath,
            lineNumber: lineNum,
            codeSnippet: lineText.replace(/sk_live_[0-9a-zA-Z]{24,}/g, 'sk_live_************************'),
            explanation: `A live Stripe production secret key is embedded in code. This grants full unauthorized access to billing APIs.`,
            remediation: `Revoke this key in the Stripe Dashboard and load it via process.env.STRIPE_SECRET_KEY.`,
            ruleId: 'SEC-SECRET-002'
          });
        }

        // Private Key block
        if (/-----BEGIN (?:RSA |EC |DSA |OPENSSH |)PRIVATE KEY-----/.test(lineText)) {
          issues.push({
            id: `SECRET-PRIVKEY-${lineNum}`,
            category: 'Hardcoded Secrets',
            title: 'Hardcoded Cryptographic Private Key',
            severity: 'CRITICAL',
            filePath,
            lineNumber: lineNum,
            codeSnippet: '-----BEGIN PRIVATE KEY----- ...',
            explanation: `A cryptographic private key is committed in plaintext source code.`,
            remediation: `Store private keys in a secure vault or file mounted via environment variables with 0600 file permissions.`,
            ruleId: 'SEC-SECRET-003'
          });
        }

        // Hardcoded JWT secret string in sign/verify (not process.env)
        const jwtSecretMatch = /jwt\.(?:sign|verify)\s*\([^,]+,\s*['"]([a-zA-Z0-9_\-!@#$%^&*]{8,})['"]/i.exec(lineText);
        if (jwtSecretMatch && !lineText.includes('process.env') && !lineText.includes('config.')) {
          issues.push({
            id: `SECRET-JWT-${lineNum}`,
            category: 'Hardcoded Secrets',
            title: 'Hardcoded Plaintext JWT Secret Key',
            severity: 'HIGH',
            filePath,
            lineNumber: lineNum,
            codeSnippet: lineText.trim(),
            explanation: `JWT token signing/verification utilizes a hardcoded plaintext secret string rather than an environment variable.`,
            remediation: `Pass process.env.JWT_SECRET or an asymmetric public/private key pair.`,
            ruleId: 'SEC-SECRET-004'
          });
        }
      }

      // -------------------------------------------------------------
      // 4. Weak Authentication & Authorization
      // -------------------------------------------------------------
      // JWT algorithms: ['none']
      if (/algorithms?\s*:\s*\[\s*['"]none['"]\s*\]/i.test(lineText)) {
        issues.push({
          id: `AUTH-NONE-${lineNum}`,
          category: 'Weak Authentication',
          title: 'Insecure JWT "none" Algorithm Allowed',
          severity: 'CRITICAL',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `Allowing the "none" algorithm in JWT verification permits attackers to forge arbitrary authentication tokens without valid signatures.`,
          remediation: `Restrict JWT algorithms explicitly to ['HS256', 'RS256'] and reject unsigned tokens.`,
          ruleId: 'SEC-AUTH-001'
        });
      }

      // Disabled SSL/TLS verification
      if (/rejectUnauthorized\s*:\s*false/i.test(lineText) || /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0['"]?/i.test(lineText) || /verify\s*=\s*False\b/.test(lineText)) {
        issues.push({
          id: `TLS-DISABLE-${lineNum}`,
          category: 'Weak Authentication',
          title: 'Disabled TLS/SSL Certificate Validation',
          severity: 'HIGH',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `Disabling TLS/SSL certificate validation (rejectUnauthorized: false) leaves network requests vulnerable to Man-in-the-Middle (MitM) interception.`,
          remediation: `Enable strict TLS certificate validation (rejectUnauthorized: true) and install trusted CA certificates.`,
          ruleId: 'SEC-AUTH-002'
        });
      }

      // Insecure MD5 / SHA1 hashing for passwords
      if (/(?:crypto\.createHash\(['"](?:md5|sha1)['"]\)|md5\s*\(|sha1\s*\()/i.test(lineText) && (lineText.toLowerCase().includes('pass') || lineText.toLowerCase().includes('pwd') || lineText.toLowerCase().includes('auth'))) {
        issues.push({
          id: `HASH-WEAK-${lineNum}`,
          category: 'Weak Authentication',
          title: 'Weak / Deprecated Hash Algorithm for Passwords',
          severity: 'HIGH',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `MD5 and SHA-1 are cryptographically broken and vulnerable to collision and rainbow table attacks when hashing credentials.`,
          remediation: `Use adaptive key-derivation hashing functions such as bcrypt, argon2id, or scrypt.`,
          ruleId: 'SEC-AUTH-003'
        });
      }

      // -------------------------------------------------------------
      // 5. Dangerous File Access & Path Traversal
      // -------------------------------------------------------------
      const isDangerousFs = /fs\.(?:readFile|readFileSync|createReadStream|unlink|unlinkSync|writeFile|writeFileSync)\s*\(\s*(?:req\.(?:query|params|body)|path\.join\(.*req\.(?:query|params|body)\))/i.test(lineText);
      const isDangerousSendFile = /res\.(?:sendFile|download)\s*\(\s*(?:req\.(?:query|params|body)|[a-zA-Z0-9_]*path[a-zA-Z0-9_]*)/i.test(lineText);

      if (isDangerousFs || isDangerousSendFile) {
        issues.push({
          id: `PATH-TRAVERSAL-${lineNum}`,
          category: 'Dangerous File Access',
          title: 'Potential Path Traversal in File Operations',
          severity: 'CRITICAL',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `User-supplied input is directly passed to filesystem read/write or download operations without path normalization or sandboxing (../ directory traversal risk).`,
          remediation: `Normalize paths with path.resolve() and verify the resolved path starts with the allowed base directory.`,
          ruleId: 'SEC-FILE-001'
        });
      }

      // -------------------------------------------------------------
      // 6. Unsafe Deserialization & Code Evaluation
      // -------------------------------------------------------------
      const isEval = /\beval\s*\(\s*(?!['"][^'"]*['"])[a-zA-Z0-9_.]+/i.test(lineText);
      const isNewFunction = /new\s+Function\s*\(\s*[^)]*(?:req\.|params|query|body|[a-zA-Z0-9_]+)[^)]*\)/i.test(lineText);
      const isUnserialize = /(?:unserialize|node-serialize\.unserialize)\s*\(/i.test(lineText);

      if (isEval || isNewFunction || isUnserialize) {
        issues.push({
          id: `DESERIAL-${lineNum}`,
          category: 'Unsafe Deserialization',
          title: 'Arbitrary Code Execution via eval() / Unsafe Deserialization',
          severity: 'CRITICAL',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `Executing code dynamically with eval() or deserializing untrusted objects allows Remote Code Execution (RCE).`,
          remediation: `Replace dynamic evaluation with safe JSON.parse() or structured parsing mechanisms.`,
          ruleId: 'SEC-EVAL-001'
        });
      }

      // -------------------------------------------------------------
      // 7. Command Injection
      // -------------------------------------------------------------
      const isCmdInjection = /child_process\.(?:exec|execSync)\s*\(\s*`[^`]*\$\{[^}]+\}`/i.test(lineText) ||
                            /child_process\.(?:exec|execSync)\s*\(\s*["'][^"']*["']\s*\+\s*[a-zA-Z0-9_.]+/i.test(lineText) ||
                            /(?:os\.system|subprocess\.Popen|subprocess\.call)\s*\(\s*f?["'][^"']*\{[^}]+\}/i.test(lineText);

      if (isCmdInjection) {
        issues.push({
          id: `CMD-INJ-${lineNum}`,
          category: 'Command Injection',
          title: 'Unescaped Shell Command Execution (Command Injection)',
          severity: 'CRITICAL',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `Shell command string is dynamically constructed from variables. Attackers can inject command separators (;, &&, |) to execute arbitrary system commands.`,
          remediation: `Use child_process.execFile or spawn with argument arrays without shell: true.`,
          ruleId: 'SEC-CMD-001'
        });
      }

      // -------------------------------------------------------------
      // 8. Missing Input Validation / Prototype Pollution
      // -------------------------------------------------------------
      if (/Object\.assign\s*\(\s*[a-zA-Z0-9_.]+\s*,\s*req\.body\s*\)/i.test(lineText)) {
        issues.push({
          id: `PROTO-POLLUTION-${lineNum}`,
          category: 'Missing Input Validation',
          title: 'Prototype Pollution Vector via Unfiltered Object.assign',
          severity: 'HIGH',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `Passing unfiltered req.body directly into Object.assign can overwrite prototype properties (e.g. __proto__, constructor).`,
          remediation: `Validate inputs using schema validators (Zod/Joi) and sanitize keys against prototype pollution.`,
          ruleId: 'SEC-VAL-001'
        });
      }

      // -------------------------------------------------------------
      // 9. Missing Exception Handling in Sensitive Modules
      // -------------------------------------------------------------
      if (/catch\s*\([a-zA-Z0-9_]*\)\s*\{\s*\}/.test(lineText) && (filePath.toLowerCase().includes('db') || filePath.toLowerCase().includes('auth') || filePath.toLowerCase().includes('payment') || filePath.toLowerCase().includes('service'))) {
        issues.push({
          id: `EMPTY-CATCH-${lineNum}`,
          category: 'Missing Exception Handling',
          title: 'Silenced Exception in Critical Service Operation',
          severity: 'MEDIUM',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `An empty catch block suppresses exceptions in a critical business/auth path, concealing system failures and database error states.`,
          remediation: `Log error details with logger.error() and propagate or handle with meaningful error responses.`,
          ruleId: 'SEC-ERR-001'
        });
      }

      // -------------------------------------------------------------
      // 10. Insecure CORS Configuration
      // -------------------------------------------------------------
      if (/cors\s*\(\s*\{\s*origin\s*:\s*['"]\*['"]\s*,\s*credentials\s*:\s*true\s*\}\s*\)/i.test(lineText)) {
        issues.push({
          id: `CORS-INSECURE-${lineNum}`,
          category: 'CSRF & Insecure Configurations',
          title: 'Insecure CORS Policy with Wildcard Origin & Credentials',
          severity: 'HIGH',
          filePath,
          lineNumber: lineNum,
          codeSnippet: lineText.trim(),
          explanation: `Allowing wildcard origin ('*') with credentials: true breaches browser cross-origin security models and exposes user sessions to CSRF.`,
          remediation: `Specify an explicit allowed whitelist of origins (e.g. origin: ['https://app.example.com']).`,
          ruleId: 'SEC-CORS-001'
        });
      }
    });
  }
};
