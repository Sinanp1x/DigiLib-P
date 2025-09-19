import { useState } from 'react';

function generateStudentId(name) {
  const prefix = name.slice(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STU-${prefix}-${rand}`;
}

export default function Students() {
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [form, setForm] = useState({ name: '', grade: '', section: '' });
  const [students, setStudents] = useState(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    return institution?.students || [];
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.name || !form.grade || !form.section) return;
    const id = generateStudentId(form.name);
    const newStudent = { ...form, id };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    institution.students = updatedStudents;
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    setForm({ name: '', grade: '', section: '' });
  };

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-border-light">
        <h2 className="text-2xl font-bold mb-6 text-primary-blue">Manage Students</h2>
        <label className="flex items-center mb-4">
          <input type="checkbox" checked={portalEnabled} onChange={() => setPortalEnabled(!portalEnabled)} className="mr-2" />
          <span className="font-medium text-text-dark">Enable Student Portal</span>
        </label>
        {portalEnabled && (
          <form onSubmit={handleRegister} className="space-y-4 mb-8">
            <input type="text" name="name" placeholder="Student Name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
            <select name="grade" value={form.grade} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light">
              <option value="">Select Grade</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select name="section" value={form.section} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light">
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            <button type="submit" className="w-full bg-primary-blue text-white py-2 rounded-lg font-bold hover:bg-secondary-blue transition-colors disabled:bg-primary-blue/70 shadow">Register Student</button>
          </form>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-bg-light rounded-xl shadow p-6 flex flex-col items-center border border-border-light">
              <div className="font-bold text-lg text-primary-blue mb-2">{student.name}</div>
              <div className="text-sm text-text-dark">Grade: {student.grade}</div>
              <div className="text-sm text-text-dark">Section: {student.section}</div>
              <div className="text-xs text-gray-500 mt-2">ID: {student.id}</div>
              {/* Edit/Delete buttons for future */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
