import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SESSION, createInitialFeedbacks, createInitialSubmissions } from './src/defaultData.ts';
import { FullClassroomData } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// File database setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'classroom_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db: FullClassroomData;

function initDb(): FullClassroomData {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.session && parsed.submissions && parsed.feedbacks) {
        return parsed;
      }
    } catch (e) {
      console.error('Error loading db file, re-initializing', e);
    }
  }

  const initialData: FullClassroomData = {
    session: DEFAULT_SESSION,
    submissions: createInitialSubmissions(),
    feedbacks: createInitialFeedbacks()
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

db = initDb();

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

// Helper to count words
function countWords(str: string): number {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

// SSE Clients for Real-time zero-refresh updates
const sseClients: Response[] = [];

function broadcast(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  const msg = `event: ${eventType}\ndata: ${data}\n\n`;

  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(msg);
    } catch (e) {
      sseClients.splice(i, 1);
    }
  }
}

// Heartbeat every 20 seconds to prevent connection drops in Cloud Run / Proxies
setInterval(() => {
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 20000);

// SSE Endpoint
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  sseClients.push(res);

  // Send initial snapshot
  const initialPayload = {
    type: 'init',
    data: {
      session: {
        ...db.session,
        teacherPin: undefined // hide teacher PIN
      },
      submissions: db.submissions,
      reviewedGroupIds: Object.keys(db.feedbacks)
        .filter(k => db.feedbacks[Number(k)]?.isReviewed)
        .map(Number)
    }
  };
  res.write(`event: init\ndata: ${JSON.stringify(initialPayload)}\n\n`);

  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// REST API: Public session data for students
app.get('/api/session', (req: Request, res: Response) => {
  const { teacherPin, ...safeSession } = db.session;
  res.json({
    session: safeSession,
    totalGroups: 12,
    groups: Object.values(db.submissions).map(s => ({
      groupId: s.groupId,
      groupNumber: s.groupNumber,
      topicId: s.topicId,
      status: s.status,
      submittedAt: s.submittedAt,
      hasFeedback: db.feedbacks[s.groupId]?.isPublishedToStudent || false
    }))
  });
});

// REST API: Get submission for a specific group (Student view)
app.get('/api/submissions/:groupId', (req: Request, res: Response) => {
  const groupId = Number(req.params.groupId);
  if (isNaN(groupId) || groupId < 1 || groupId > 12) {
    return res.status(400).json({ error: 'Mã nhóm không hợp lệ' });
  }

  const submission = db.submissions[groupId];
  const feedback = db.feedbacks[groupId];

  res.json({
    submission,
    feedback: feedback?.isPublishedToStudent ? feedback : null
  });
});

// REST API: Student submit answers or save draft
app.post('/api/submissions', (req: Request, res: Response) => {
  const { groupId, answer1 = '', answer2 = '', answer3 = '', status = 'submitted', clientDeviceId } = req.body;
  const gId = Number(groupId);

  if (isNaN(gId) || gId < 1 || gId > 12) {
    return res.status(400).json({ error: 'Nhóm phải từ 1 đến 12' });
  }

  if (status === 'submitted' && !db.session.isSubmissionsOpen) {
    return res.status(403).json({ error: 'Giáo viên hiện đã đóng tiếp nhận bài nộp' });
  }

  const existing = db.submissions[gId] || {
    groupId: gId,
    groupNumber: gId,
    topicId: Math.ceil(gId / 3),
    status: 'not_started'
  };

  const wordCount = {
    ans1: countWords(answer1),
    ans2: countWords(answer2),
    ans3: countWords(answer3),
    total: countWords(answer1) + countWords(answer2) + countWords(answer3)
  };

  let newStatus = existing.status;
  const isReviewed = db.feedbacks[gId]?.isReviewed;

  if (status === 'submitted') {
    newStatus = isReviewed ? 'reviewed' : 'submitted';
  } else if (status === 'in_progress') {
    // If it was already submitted, keep submitted unless explicit
    newStatus = existing.status === 'submitted' || existing.status === 'reviewed' ? existing.status : 'in_progress';
  }

  const updatedSubmission = {
    ...existing,
    groupId: gId,
    groupNumber: gId,
    topicId: Math.ceil(gId / 3),
    answer1: String(answer1),
    answer2: String(answer2),
    answer3: String(answer3),
    status: newStatus,
    submittedAt: status === 'submitted' ? (existing.submittedAt || new Date().toISOString()) : existing.submittedAt,
    updatedAt: new Date().toISOString(),
    clientDeviceId,
    wordCount
  };

  db.submissions[gId] = updatedSubmission;
  saveDb();

  // Broadcast to all connected teacher screens and students
  broadcast('submission_updated', {
    groupId: gId,
    submission: updatedSubmission
  });

  res.json({
    success: true,
    message: status === 'submitted' ? 'Đã gửi câu trả lời thành công!' : 'Đã lưu bản nháp thành công!',
    submission: updatedSubmission
  });
});

// Middleware for Teacher authentication
function verifyTeacher(req: Request, res: Response, next: () => void) {
  const pin = req.headers['x-teacher-pin'] || req.body?.pin || req.query?.pin;
  if (pin === db.session.teacherPin) {
    return next();
  }
  return res.status(401).json({ error: 'Mã PIN bảo mật giáo viên không chính xác' });
}

// Teacher PIN verification
app.post('/api/teacher/auth', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === db.session.teacherPin) {
    return res.json({ success: true, message: 'Xác thực giáo viên thành công' });
  }
  return res.status(401).json({ error: 'Mã PIN không đúng. Vui lòng thử lại.' });
});

// Full state for Teacher Dashboard
app.get('/api/teacher/full-data', verifyTeacher, (req: Request, res: Response) => {
  res.json({
    session: db.session,
    submissions: db.submissions,
    feedbacks: db.feedbacks
  });
});

// Teacher Feedback submission
app.post('/api/teacher/feedback', verifyTeacher, (req: Request, res: Response) => {
  const { groupId, generalComment, strengths, improvements, suggestions, isReviewed, isPublishedToStudent } = req.body;
  const gId = Number(groupId);

  if (isNaN(gId) || gId < 1 || gId > 12) {
    return res.status(400).json({ error: 'Mã nhóm không hợp lệ' });
  }

  const existingFeedback = db.feedbacks[gId] || { groupId: gId };
  const updatedFeedback = {
    ...existingFeedback,
    groupId: gId,
    generalComment: generalComment || '',
    strengths: strengths || '',
    improvements: improvements || '',
    suggestions: suggestions || '',
    isReviewed: Boolean(isReviewed),
    isPublishedToStudent: Boolean(isPublishedToStudent),
    reviewedAt: new Date().toISOString(),
    reviewedBy: db.session.teacherName
  };

  db.feedbacks[gId] = updatedFeedback;

  // Update submission status to reviewed if marked as reviewed
  if (db.submissions[gId]) {
    if (updatedFeedback.isReviewed) {
      db.submissions[gId].status = 'reviewed';
    } else if (db.submissions[gId].submittedAt) {
      db.submissions[gId].status = 'submitted';
    }
  }

  saveDb();

  broadcast('feedback_updated', {
    groupId: gId,
    feedback: updatedFeedback,
    submission: db.submissions[gId]
  });

  res.json({
    success: true,
    feedback: updatedFeedback,
    submission: db.submissions[gId]
  });
});

// Teacher Session Settings update
app.post('/api/teacher/session-settings', verifyTeacher, (req: Request, res: Response) => {
  const { className, teacherName, schoolName, subject, lessonName, isSubmissionsOpen, allowEditAfterSubmit, teacherPin, questions, topics } = req.body;

  db.session = {
    ...db.session,
    ...(className !== undefined && { className }),
    ...(teacherName !== undefined && { teacherName }),
    ...(schoolName !== undefined && { schoolName }),
    ...(subject !== undefined && { subject }),
    ...(lessonName !== undefined && { lessonName }),
    ...(isSubmissionsOpen !== undefined && { isSubmissionsOpen }),
    ...(allowEditAfterSubmit !== undefined && { allowEditAfterSubmit }),
    ...(teacherPin !== undefined && { teacherPin }),
    ...(questions !== undefined && { questions }),
    ...(topics !== undefined && { topics }),
    updatedAt: new Date().toISOString()
  };

  saveDb();

  const { teacherPin: _pin, ...safeSession } = db.session;
  broadcast('session_updated', safeSession);

  res.json({ success: true, session: db.session });
});

// Teacher Reset Data (clean slate for new session/class)
app.post('/api/teacher/reset-data', verifyTeacher, (req: Request, res: Response) => {
  db.submissions = createInitialSubmissions();
  db.feedbacks = createInitialFeedbacks();
  saveDb();

  broadcast('data_reset', {
    submissions: db.submissions,
    feedbacks: db.feedbacks
  });

  res.json({ success: true, message: 'Đã đặt lại dữ liệu lớp học thành công' });
});

// Vite dev server middleware or static production serve
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Classroom Discussion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
