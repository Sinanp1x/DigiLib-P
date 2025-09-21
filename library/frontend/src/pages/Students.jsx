import { useState, useEffect } from 'react';
import { hashPassword } from '../utils/auth';
import { toast } from 'react-hot-toast';
import { Container, Box, Typography, TextField, Button, FormControlLabel, Checkbox, Select, MenuItem, InputLabel, FormControl, Grid, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function generateStudentId(name) {
  const prefix = name.slice(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STU-${prefix}-${rand}`;
}

function generateDefaultPassword() {
  // Default password for all students
  return 'std123';
}

export default function Students() {
  const [portalEnabled, setPortalEnabled] = useState(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    return institution?.portalEnabled || false;
  });
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ name: '', grade: '', section: '' });
  const [students, setStudents] = useState(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    return institution?.students || [];
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ uniqueStudentId: '', name: '', grade: '', section: '' });

  // Backfill default password for existing students missing a password
  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    const current = Array.isArray(institution.students) ? institution.students : [];
    let changed = false;
    const updated = current.map((s) => {
      if (!s.password) {
        changed = true;
        return { ...s, password: hashPassword(generateDefaultPassword()) };
      }
      return s;
    });
    if (changed) {
      const updatedInstitution = { ...institution, students: updated };
      localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
      setStudents(updated);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    if (institution) {
      institution.portalEnabled = portalEnabled;
      localStorage.setItem('digilib_institution', JSON.stringify(institution));
    }
  }, [portalEnabled]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.name || !form.grade || !form.section) {
      toast.error('Please fill in all required fields');
      return;
    }

    const uniqueStudentId = generateStudentId(form.name);
    const defaultPassword = generateDefaultPassword();
    const hashedPassword = hashPassword(defaultPassword);

    const newStudent = {
      ...form,
      uniqueStudentId,
      password: hashedPassword,
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);

    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    const updatedInstitution = {
      ...institution,
      students: updatedStudents,
      portalEnabled,
      bookingRequests: institution.bookingRequests || [],
      fines: institution.fines || []
    };

    localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
    setForm({ name: '', grade: '', section: '' });

  toast.success(`Student registered successfully! Default password: ${defaultPassword}`);
  };

  const openEdit = (student) => {
    setEditForm({ uniqueStudentId: student.uniqueStudentId, name: student.name, grade: student.grade, section: student.section });
    setEditOpen(true);
  };

  const saveEdit = () => {
    const idx = students.findIndex(s => s.uniqueStudentId === editForm.uniqueStudentId);
    if (idx === -1) { setEditOpen(false); return; }
    const updated = [...students];
    updated[idx] = { ...updated[idx], name: editForm.name, grade: editForm.grade, section: editForm.section };
    setStudents(updated);
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    institution.students = updated;
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    setEditOpen(false);
    toast.success('Student updated');
  };

  const removeStudent = (id) => {
    if (!window.confirm('Remove this student? This will not delete their history.')) return;
    const updated = students.filter(s => s.uniqueStudentId !== id);
    setStudents(updated);
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    institution.students = updated;
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    toast.success('Student removed');
  };

  return (
    <>
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" component="h1" color="primary" gutterBottom>
          Manage Students
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={portalEnabled}
                onChange={() => setPortalEnabled(!portalEnabled)}
                name="portalEnabled"
                color="primary"
              />
            }
            label="Enable Student Portal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showRegister}
                onChange={() => setShowRegister(!showRegister)}
                name="showRegister"
                color="primary"
              />
            }
            label="Add Students"
          />
        </Box>
        {showRegister && (
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 2, mb: 4 }}>
            <TextField
              fullWidth
              label="Student Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="grade-select-label">Select Grade</InputLabel>
              <Select
                labelId="grade-select-label"
                id="grade-select"
                name="grade"
                value={form.grade}
                label="Select Grade"
                onChange={handleChange}
              >
                <MenuItem value="">Select Grade</MenuItem>
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="section-select-label">Select Section</InputLabel>
              <Select
                labelId="section-select-label"
                id="section-select"
                name="section"
                value={form.section}
                label="Select Section"
                onChange={handleChange}
              >
                <MenuItem value="">Select Section</MenuItem>
                {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                  <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Register Student
            </Button>
          </Box>
        )}

        <Typography variant="h6" component="h2" color="primary" sx={{ mt: 4, mb: 2 }}>
          Registered Students
        </Typography>
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid item key={student.uniqueStudentId} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Typography variant="h6" component="div" color="primary" gutterBottom>
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Grade: {student.grade}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Section: {student.section}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                    ID: {student.uniqueStudentId}
                  </Typography>
                  {portalEnabled && (
                    <Box sx={{ mt: 1, bgcolor: 'success.light', color: 'success.contrastText', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                      <Typography variant="caption">Portal Access Enabled</Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => openEdit(student)}>Edit</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => removeStudent(student.uniqueStudentId)}>Remove</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="ID" value={editForm.uniqueStudentId} InputProps={{ readOnly: true }} fullWidth />
            <TextField label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="edit-grade-label">Select Grade</InputLabel>
              <Select labelId="edit-grade-label" label="Select Grade" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}>
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="edit-section-label">Select Section</InputLabel>
              <Select labelId="edit-section-label" label="Select Section" value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}>
                {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                  <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Container>
    </>
  );
}
