const { getDbConnection } = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    await db.close();
    return user;
  }

  async createUser(userData) {
    const db = await getDbConnection();
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone, firebase_uid) VALUES (?, ?, ?, ?, ?)',
      [userData.name, userData.email, userData.password, userData.phone, userData.firebaseUid]
    );
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    await db.close();
    return user;
  }

  async updateFirebaseUid(userId, firebaseUid) {
    const db = await getDbConnection();
    await db.run('UPDATE users SET firebase_uid = ? WHERE id = ?', [firebaseUid, userId]);
    await db.close();
  }

  async getAllUsers() {
    const db = await getDbConnection();
    const users = await db.all('SELECT * FROM users');
    await db.close();
    return users;
  }

  async getUserById(id) {
    const db = await getDbConnection();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    await db.close();
    return user;
  }
}

module.exports = new UserRepository();
