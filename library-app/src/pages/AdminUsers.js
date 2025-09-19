import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  // collection, getDocs, doc, deleteDoc, updateDoc,
  // getDoc, setDoc
} from 'firebase/firestore';
// import { useAuth } from '../contexts/AuthContext';
import userImg from '../assets/user.png';
import SplashScreen from '../components/SplashScreen';
import { toast } from 'react-toastify';

function AdminUsers() {
  // const { db } = useAuth(); // Temporarily removed
  const [users, setUsers] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [signupAllowed, setSignupAllowed] = useState(true); // ✅ State
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch users + signup setting
  useEffect(() => {
    const fetchUsersAndSettings = async () => {
      try {
        setIsLoading(true);
      // TODO: Replace with API call to fetch users
      // const snapshot = await getDocs(collection(db, 'users'));
      // const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // setUsers(allUsers.filter(user => user.role !== 'admin'));

      // Fetch signup setting
      // TODO: Replace with API call to fetch signup setting
      // const settingDoc = await getDoc(doc(db, 'settings', 'signup'));
      // if (settingDoc.exists()) {
      //   setSignupAllowed(settingDoc.data().allowed);
      // }
      toast.info("User management is temporarily disabled pending API integration.");
      setUsers([]); // Set to empty array for now
      } catch (error) {
        console.error('Error fetching users or settings:', error); 
      toast.error('Failed to load users or settings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersAndSettings();
  }, []); // Removed `db` from dependencies

  // ✅ Toggle signup allowed
  const handleSignupToggle = async (value) => {
    // TODO: Replace with API call
    // await setDoc(doc(db, 'settings', 'signup'), { allowed: value });
    // setSignupAllowed(value);
    toast.warn("This feature is not yet connected to the new backend.");
  };

  const handleRemoveUser = async (userId) => {
    // TODO: Replace with API call
    // if (window.confirm('Remove user?')) {
    //   await deleteDoc(doc(db, 'users', userId));
    //   setUsers(prev => prev.filter(user => user.id !== userId));
    // }
    toast.warn("This feature is not yet connected to the new backend.");
  };

  const handleGlobalLevelUp = async () => {
    // TODO: Replace with API call
    toast.warn("This feature is not yet connected to the new backend.");
    const classMap = { '+1': '+2', '+2': 'UG-1', 'UG-1': 'UG-2', 'UG-2': 'UG-3', 'UG-3': 'PG-1' };
    const updatedUsers = [];

    for (const user of users) {
      const currentClass = user.class;
      const newClass = classMap[currentClass];
      if (newClass) {
        await updateDoc(doc(db, 'users', user.id), { class: newClass });
        updatedUsers.push({ ...user, class: newClass });
      } else if (currentClass === 'PG-1') {
        await deleteDoc(doc(db, 'users', user.id));
      }
    }

    const refreshedSnapshot = await getDocs(collection(db, 'users'));
    const refreshedUsers = refreshedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(refreshedUsers.filter(user => user.role !== 'admin'));
  };

  const filteredUsers = filterClass ? users.filter(user => user.class === filterClass) : users;

  if (isLoading) return <SplashScreen message="Loading Users..." page='users' />;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGlobalLevelUp}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Promote All
            </button>
            {/* ✅ Radio Buttons */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-medium">Allow Signup</label>
              <button
                onClick={() => handleSignupToggle(!signupAllowed)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  signupAllowed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    signupAllowed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        <div className="mb-4">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Classes</option>
            <option value="+1">+1</option>
            <option value="+2">+2</option>
            <option value="UG-1">UG-1</option>
            <option value="UG-2">UG-2</option>
            <option value="UG-3">UG-3</option>
            <option value="PG-1">PG-1</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <img src={user.profilePic || userImg} alt="Profile" className="h-8 w-8 rounded-full mb-2" />
              <p className="text-sm text-gray-600">{user.name}</p>
              <p className="text-sm text-gray-600">{user.class}</p>
              <button
                onClick={() => handleRemoveUser(user.id)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default AdminUsers;
