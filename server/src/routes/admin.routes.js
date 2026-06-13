import express from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';
import { Report } from '../models/Report.js';
import { writeAudit } from '../utils/audit.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/reports', async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'name email username')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ reports });
});

router.patch('/reports/:id', async (req, res) => {
  const { status, adminNote } = req.body;
  const report = await Report.findById(req.params.id);

  if (!report) return res.status(404).json({ message: 'Report not found' });

  if (status) report.status = status;
  if (adminNote !== undefined) report.adminNote = String(adminNote);
  await report.save();

  await writeAudit({
    actorId: req.user._id,
    action: 'report_updated',
    targetType: 'report',
    targetId: report._id,
    meta: { status: report.status }
  });

  res.json({ report });
});

router.get('/audit-logs', async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  res.json({ logs });
});

export default router;
