import { createContext, useContext, useState } from 'react';
import { validatePassword } from './utils/auth';

const StudentAuthContext = createContext(null);

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);

  const login = (studentId, password) => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    
    if (!institution?.portalEnabled) {
      throw new Error('Student portal is not enabled');
    }

    const foundStudent = institution.students.find(s => s.uniqueStudentId === studentId);
    if (!foundStudent) {
      throw new Error('Invalid student ID');
    }

    if (!validatePassword(password, foundStudent.password)) {
      throw new Error('Invalid password');
    }

    const studentData = {
      uniqueStudentId: foundStudent.uniqueStudentId,
      name: foundStudent.name,
      grade: foundStudent.grade,
      section: foundStudent.section
    };

    setStudent(studentData);
    return studentData;
  };

  const logout = () => {
    setStudent(null);
  };

  const value = {
    student,
    login,
    logout
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};