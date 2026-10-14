import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileCode,
  FolderPlus,
  FolderArchive,
  Trash2,
  Eye,
  X,
  Sparkles,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Zap,
  Terminal
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Tooltip } from '../common/Tooltip';

// Helper to determine file language and visual styling
function getFileLanguageInfo(fileName = '') {
  const ext = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return { lang: 'TypeScript', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60', badge: 'TS' };
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return { lang: 'JavaScript', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60', badge: 'JS' };
    case 'py':
      return { lang: 'Python', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60', badge: 'PY' };
    case 'go':
      return { lang: 'Go', color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/60', badge: 'GO' };
    case 'rs':
      return { lang: 'Rust', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/60', badge: 'RS' };
    case 'java':
      return { lang: 'Java', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/60', badge: 'JAVA' };
    case 'cpp':
    case 'cxx':
    case 'cc':
    case 'c':
    case 'h':
    case 'hpp':
      return { lang: 'C/C++', color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/60', badge: 'C++' };
    case 'json':
      return { lang: 'JSON', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/60', badge: 'JSON' };
    case 'yaml':
    case 'yml':
      return { lang: 'YAML', color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/60', badge: 'YAML' };
    case 'sql':
      return { lang: 'SQL', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60', badge: 'SQL' };
    case 'html':
    case 'css':
    case 'scss':
      return { lang: 'Web UI', color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-800/60', badge: ext.toUpperCase() };
    case 'zip':
    case 'tar':
    case 'gz':
      return { lang: 'Archive', color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/60', badge: 'ZIP' };
    default:
      return { lang: 'Source File', color: 'text-slate-300', bg: 'bg-slate-900/80 border-slate-800', badge: ext.toUpperCase() || 'FILE' };
  }
}

// Format bytes
function formatFileSize(bytes = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Sample presets for 1-click test load
const PRESET_SAMPLE_BUNDLES = [
  {
    id: 'payment-gateway',
    title: 'Payment & Order Gateway',
    tag: 'TypeScript / Express',
    desc: 'Stripe webhook processor, order ledger, & token validator with high risk mutation points.',
    icon: Zap,
    files: [
      {
        name: 'paymentGateway.ts',
        path: 'src/services/paymentGateway.ts',
        size: 3420,
        lineCount: 84,
        content: `import { StripeClient } from '../lib/stripe';\nimport { OrderLedger } from './orderLedger';\nimport { validateTokenSignature } from '../guards/authGuard';\n\nexport interface PaymentIntentPayload {\n  orderId: string;\n  amountCents: number;\n  currency: 'USD' | 'EUR' | 'GBP';\n  idempotencyKey: string;\n  customerToken: string;\n}\n\nexport class PaymentGatewayService {\n  private stripe: StripeClient;\n  private ledger: OrderLedger;\n\n  constructor() {\n    this.stripe = new StripeClient(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');\n    this.ledger = new OrderLedger();\n  }\n\n  // Critical Blast Point: Modifies ledger state & executes charges\n  public async processPayment(payload: PaymentIntentPayload) {\n    if (!validateTokenSignature(payload.customerToken)) {\n      throw new Error('Unauthorized customer token signature');\n    }\n\n    const charge = await this.stripe.charges.create({\n      amount: payload.amountCents,\n      currency: payload.currency,\n      idempotencyKey: payload.idempotencyKey\n    });\n\n    await this.ledger.recordTransaction(payload.orderId, charge.id, charge.status);\n    return { success: true, chargeId: charge.id };\n  }\n}`
      },
      {
        name: 'orderLedger.ts',
        path: 'src/services/orderLedger.ts',
        size: 2150,
        lineCount: 52,
        content: `import { DatabasePool } from '../database/pool';\n\nexport class OrderLedger {\n  public async recordTransaction(orderId: string, chargeId: string, status: string) {\n    const query = 'UPDATE orders SET payment_id = $1, payment_status = $2, updated_at = NOW() WHERE id = $3';\n    await DatabasePool.query(query, [chargeId, status, orderId]);\n  }\n}`
      },
      {
        name: 'authGuard.ts',
        path: 'src/guards/authGuard.ts',
        size: 1840,
        lineCount: 45,
        content: `import crypto from 'crypto';\n\nexport function validateTokenSignature(token: string): boolean {\n  if (!token || token.length < 16) return false;\n  const [header, payload, signature] = token.split('.');\n  if (!signature) return false;\n  return true;\n}`
      }
    ]
  },
  {
    id: 'oauth2-auth',
    title: 'OAuth2 & JWT Auth Service',
    tag: 'JavaScript (Node)',
    desc: 'JWT signing authority, token blacklisting, & session middleware guards.',
    icon: Code2,
    files: [
      {
        name: 'authController.js',
        path: 'backend/src/controllers/authController.js',
        size: 2980,
        lineCount: 72,
        content: `import jwt from 'jsonwebtoken';\nimport { TokenBlacklist } from '../services/tokenBlacklist.js';\nimport { UserModel } from '../models/User.js';\n\nexport const authController = {\n  login: async (req, res) => {\n    const { email, password } = req.body;\n    const user = await UserModel.findByEmail(email);\n    if (!user || !(await user.comparePassword(password))) {\n      return res.status(401).json({ error: 'Invalid credentials' });\n    }\n    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });\n    return res.json({ token, user: { id: user._id, email: user.email } });\n  },\n  logout: async (req, res) => {\n    const token = req.headers.authorization?.split(' ')[1];\n    if (token) await TokenBlacklist.add(token);\n    return res.json({ message: 'Session terminated' });\n  }\n};`
      },
      {
        name: 'sessionGuard.js',
        path: 'backend/src/middleware/sessionGuard.js',
        size: 1940,
        lineCount: 48,
        content: `import jwt from 'jsonwebtoken';\nimport { TokenBlacklist } from '../services/tokenBlacklist.js';\n\nexport const sessionGuard = async (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });\n  const token = authHeader.split(' ')[1];\n  if (await TokenBlacklist.has(token)) return res.status(401).json({ error: 'Token revoked' });\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (err) {\n    return res.status(401).json({ error: 'Invalid or expired token' });\n  }\n};`
      }
    ]
  },
  {
    id: 'websocket-chat',
    title: 'Realtime WebSocket Broker',
    tag: 'Go / Microservice',
    desc: 'Concurrent room manager, event dispatcher, & client pool with broadcast locks.',
    icon: Terminal,
    files: [
      {
        name: 'socketServer.go',
        path: 'pkg/realtime/socketServer.go',
        size: 3890,
        lineCount: 96,
        content: `package realtime\n\nimport (\n\t"sync"\n\t"github.com/gorilla/websocket"\n)\n\ntype Client struct {\n\tID   string\n\tConn *websocket.Conn\n\tSend chan []byte\n}\n\ntype RoomManager struct {\n\tmu      sync.RWMutex\n\trooms   map[string]map[*Client]bool\n\tbroadcast chan MessagePayload\n}\n\nfunc (rm *RoomManager) BroadcastToRoom(roomID string, msg []byte) {\n\trm.mu.RLock()\n\tdefer rm.mu.RUnlock()\n\tfor client := range rm.rooms[roomID] {\n\t\tselect {\n\t\tcase client.Send <- msg:\n\t\tdefault:\n\t\t\tclose(client.Send)\n\t\t\tdelete(rm.rooms[roomID], client)\n\t\t}\n\t}\n}`
      },
      {
        name: 'messageBroker.go',
        path: 'pkg/realtime/messageBroker.go',
        size: 2420,
        lineCount: 60,
        content: `package realtime\n\ntype MessagePayload struct {\n\tRoomID  string \`json:"roomId"\`\n\tSender  string \`json:"sender"\`\n\tContent string \`json:"content"\`\n\tTS      int64  \`json:"timestamp"\`\n}`
      }
    ]
  }
];

export const CodeDropZone = ({ onAnalyzeCodeFiles, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [stagedFiles, setStagedFiles] = useState(() => PRESET_SAMPLE_BUNDLES[0].files);
  const [previewFile, setPreviewFile] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [repoNameInput, setRepoNameInput] = useState(() =>
    PRESET_SAMPLE_BUNDLES[0].title.toLowerCase().replace(/[^a-z0-9]/g, '-')
  );

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // Calculate stats
  const totalBytes = stagedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalLines = stagedFiles.reduce((acc, f) => acc + (f.lineCount || 0), 0);

  // Language count map
  const langMap = {};
  stagedFiles.forEach((f) => {
    const info = getFileLanguageInfo(f.name || f.path);
    langMap[info.lang] = (langMap[info.lang] || 0) + 1;
  });
  const languageList = Object.entries(langMap).map(([lang, count]) => ({
    lang,
    count,
    percentage: Math.round((count / stagedFiles.length) * 100)
  }));

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Process dropped native File objects
  const processNativeFiles = async (fileList) => {
    const newItems = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const relPath = file.webkitRelativePath || file.name;

      // Read text content for line counting and preview
      let content = '';
      let lineCount = 0;
      try {
        content = await file.text();
        lineCount = content.split('\n').length;
      } catch {
        content = `// Binary or non-text file content (${formatFileSize(file.size)})`;
        lineCount = 1;
      }

      newItems.push({
        name: file.name,
        path: relPath,
        size: file.size,
        lineCount,
        content,
        rawFile: file
      });
    }

    if (newItems.length > 0) {
      setStagedFiles((prev) => {
        // Prevent duplicate file paths
        const existingPaths = new Set(prev.map((f) => f.path || f.name));
        const filtered = newItems.filter((f) => !existingPaths.has(f.path || f.name));
        return [...prev, ...filtered];
      });

      if (!repoNameInput) {
        const baseName = newItems[0].name.replace(/\.[^/.]+$/, '');
        setRepoNameInput(newItems.length === 1 ? baseName : `${baseName}-codebase`);
      }
    }
  };

  // Handle Drop event
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processNativeFiles(e.dataTransfer.files);
    }
  };

  // Handle File Input Change
  const handleFileInputChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processNativeFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Load Preset
  const handleLoadPreset = (preset) => {
    setStagedFiles(preset.files);
    setRepoNameInput(preset.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    setPreviewFile(null);
  };

  // Remove single file
  const handleRemoveFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    if (previewFile && stagedFiles[index] === previewFile) {
      setPreviewFile(null);
    }
  };

  // Clear all staged
  const handleClearAll = () => {
    setStagedFiles([]);
    setPreviewFile(null);
  };

  // Copy Preview Code
  const handleCopyCode = () => {
    if (!previewFile?.content) return;
    navigator.clipboard.writeText(previewFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Trigger AST Analysis
  const handleLaunchAnalysis = () => {
    if (stagedFiles.length === 0) return;
    const finalRepoName = repoNameInput.trim() || 'analyzed-codebase';
    onAnalyzeCodeFiles({
      repositoryName: finalRepoName,
      files: stagedFiles
    });
  };

  return (
    <div id="code-drop-zone-container" className="w-full space-y-6">
      {/* Hidden Native File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.go,.rs,.java,.c,.cpp,.h,.hpp,.json,.yaml,.yml,.sql,.html,.css,.scss,.md,.txt,.env,.zip,.tar,.gz"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,.tar,.gz,.tgz"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Main Interactive Drop Zone */}
      <motion.div
        id="interactive-drag-drop-box"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: dragActive ? 'rgba(34, 211, 238, 0.9)' : 'rgba(51, 65, 85, 0.8)',
          backgroundColor: dragActive ? 'rgba(6, 78, 95, 0.25)' : 'rgba(15, 23, 42, 0.65)'
        }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 shadow-2xl backdrop-blur-xl ${
          dragActive ? 'scale-[1.01] ring-4 ring-cyan-500/20' : 'hover:border-slate-600'
        }`}
      >
        {/* Cyber Neon Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Icon Indicator */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={dragActive ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
            className="flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-2xl relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 animate-pulse" />
            <UploadCloud className={`h-10 w-10 relative z-10 ${dragActive ? 'text-cyan-300 animate-bounce' : 'text-cyan-400'}`} />
          </motion.div>

          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
              {dragActive ? 'Release to Ingest Code Files' : 'Drag & Drop Code Files for Blast Analysis'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop single code files, multi-file source directories, or ZIP archives (<code className="text-cyan-300 font-mono">.ts</code>, <code className="text-cyan-300 font-mono">.js</code>, <code className="text-cyan-300 font-mono">.py</code>, <code className="text-cyan-300 font-mono">.go</code>, <code className="text-cyan-300 font-mono">.rs</code>, <code className="text-cyan-300 font-mono">.java</code>, <code className="text-cyan-300 font-mono">.cpp</code>, <code className="text-cyan-300 font-mono">.json</code>).
            </p>
          </div>

          {/* Action Buttons: Browse Files, Folder & ZIP */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              id="browse-code-files-btn"
              type="button"
              variant="primary"
              icon={FileCode}
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-5 text-xs shadow-lg shadow-cyan-500/20"
            >
              Browse Code Files
            </Button>

            <Button
              id="browse-folder-btn"
              type="button"
              variant="secondary"
              icon={FolderPlus}
              onClick={() => folderInputRef.current?.click()}
              className="py-2.5 px-5 text-xs"
            >
              Upload Workspace Folder
            </Button>

            <Button
              id="upload-zip-btn"
              type="button"
              variant="secondary"
              icon={FolderArchive}
              onClick={() => zipInputRef.current?.click()}
              className="py-2.5 px-5 text-xs"
            >
              Select ZIP Archive
            </Button>
          </div>

          {/* Supported format pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">TypeScript (.ts/.tsx)</span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">JavaScript (.js/.jsx)</span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">Python (.py)</span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">Go (.go)</span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">Rust (.rs)</span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">Java (.java)</span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">ZIP/TAR Archives</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Test Presets Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Instant Test Presets (Load Sample Codebases)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">1-click AST demo bundles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_SAMPLE_BUNDLES.map((preset) => {
            const Icon = preset.icon;
            const isSelected = stagedFiles.some((f) => preset.files.some((pf) => pf.name === f.name));
            return (
              <motion.div
                key={preset.id}
                whileHover={{ y: -2 }}
                onClick={() => handleLoadPreset(preset)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-100">{preset.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400">
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.desc}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{preset.files.length} code files</span>
                  <span className="text-cyan-400 font-semibold">{isSelected ? '✓ Active Staged' : 'Click to Load'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Staged Files List Deck */}
      {stagedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5 shadow-2xl"
        >
          {/* Header & Metrics Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Staged Code Files for Analysis ({stagedFiles.length})
                </h4>
                <Badge variant="success" className="text-[10px]">
                  Ready to Parse
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Total size: <strong className="text-cyan-400 font-mono">{formatFileSize(totalBytes)}</strong> • Total volume:{' '}
                <strong className="text-slate-200 font-mono">{totalLines} lines</strong> • Languages:{' '}
                <strong className="text-indigo-400 font-mono">{languageList.map((l) => l.lang).join(', ')}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={handleClearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Repository Target Name Input */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 shrink-0">Repository / Module Name:</span>
            <input
              id="staged-repo-name-input"
              type="text"
              value={repoNameInput}
              onChange={(e) => setRepoNameInput(e.target.value)}
              placeholder="e.g. payment-gateway-service"
              className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2 font-mono focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Staged File Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {stagedFiles.map((file, idx) => {
              const langInfo = getFileLanguageInfo(file.name || file.path);
              return (
                <div
                  key={file.path || file.name || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${langInfo.bg} ${langInfo.color}`}>
                      {langInfo.badge}
                    </span>

                    <div className="min-w-0">
                      <Tooltip title={file.name} content={`Relative path: ${file.path || file.name}. Size: ${formatFileSize(file.size)}.`} position="top">
                        <span className="text-xs font-bold text-slate-200 block truncate cursor-help">
                          {file.name}
                        </span>
                      </Tooltip>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.lineCount || 1} lines</span>
                        {file.path && file.path !== file.name && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{file.path}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                      title="Inspect Source Code"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>AST AST call-hierarchy parser ready to process {stagedFiles.length} source files</span>
            </div>

            <Button
              id="analyze-dropped-code-btn"
              type="button"
              variant="primary"
              icon={isLoading ? RefreshCw : Sparkles}
              disabled={isLoading || stagedFiles.length === 0}
              onClick={handleLaunchAnalysis}
              className="w-full sm:w-auto py-3 px-6 shadow-xl shadow-cyan-500/20 font-bold"
            >
              {isLoading ? 'Parsing AST Call Graph...' : `Analyze ${stagedFiles.length} Code Files & Build AST`}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Code File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl max-h-[85vh] rounded-3xl glass-card border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-mono">{previewFile.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {previewFile.path || previewFile.name} • {formatFileSize(previewFile.size)} • {previewFile.lineCount || 1} lines
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={copiedCode ? Check : Copy}
                    onClick={handleCopyCode}
                    className="text-xs"
                  >
                    {copiedCode ? 'Copied' : 'Copy Code'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPreviewFile(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Code Viewer Body */}
              <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 custom-scrollbar leading-relaxed">
                <pre className="whitespace-pre overflow-x-auto">
                  {previewFile.content || '// Empty file'}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
