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
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-2xl border border-blue-100">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Manage Students</h2>
      <label className="flex items-center mb-4">
        <input type="checkbox" checked={portalEnabled} onChange={() => setPortalEnabled(!portalEnabled)} className="mr-2" />
        <span className="font-medium">Enable Student Portal</span>
      </label>
      {portalEnabled && (
        <form onSubmit={handleRegister} className="space-y-4 mb-8">
          <input type="text" name="name" placeholder="Student Name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          <select name="grade" value={form.grade} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
            <option value="">Select Grade</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select name="section" value={form.section} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
            <option value="">Select Section</option>
            {['A', 'B', 'C', 'D', 'E'].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded-lg font-bold hover:from-blue-700 hover:to-blue-500 transition shadow">Register Student</button>
        </form>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student.id} className="bg-blue-50 rounded-xl shadow p-6 flex flex-col items-center">
            <div className="font-bold text-lg text-blue-700 mb-2">{student.name}</div>
            <div className="text-sm text-gray-700">Grade: {student.grade}</div>
            <div className="text-sm text-gray-700">Section: {student.section}</div>
            <div className="text-xs text-gray-500 mt-2">ID: {student.id}</div>
            {/* Edit/Delete buttons for future */}
          </div>
        ))}
      </div>
    </div>
  );
}
