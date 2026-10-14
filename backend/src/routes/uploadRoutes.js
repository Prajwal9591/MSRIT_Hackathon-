import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

// POST /upload or /upload/zip (ZIP archive upload)
router.post('/upload', upload.any(), uploadController.handleZipUpload);
router.post('/upload/zip', upload.any(), uploadController.handleZipUpload);

// POST /upload/folder (Local Folder directory upload)
router.post('/upload/folder', uploadController.handleFolderUpload);

// POST /upload/git or /upload/github (GitHub / Remote Git clone)
router.post('/upload/git', uploadController.handleGitClone);
router.post('/upload/github', uploadController.handleGitClone);

export default router;
