import db from "../models/db.js";

export const createApplication = (req, res) => {
  const { name, steam, reason } = req.body;

  db.prepare(`
    INSERT INTO applications (name, steam, reason)
    VALUES (?, ?, ?)
  `).run(name, steam, reason);

  res.json({ success: true });
};

export const getApplications = (req, res) => {
  const apps = db.prepare(`
    SELECT * FROM applications ORDER BY created_at DESC
  `).all();

  res.json(apps);
};

export const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.prepare(`
    UPDATE applications SET status = ?
    WHERE id = ?
  `).run(status, id);

  res.json({ success: true });
};

