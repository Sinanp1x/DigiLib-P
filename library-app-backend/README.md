# Library App - Python Backend

This is the new backend for the Library App, built with Python, Flask, and SQLite. It replaces the original Firebase implementation.
This is the backend for the Library App, built with Python, Flask, and SQLite.

## Features

-   **User Authentication**: Signup and Login for 'admin' and 'student' roles using JWT.
-   **Book Management**: Full CRUD (Create, Read, Update, Delete) API for books.
-   **Local Storage**: Book data is stored in an SQLite database, and images are stored in a local `uploads/images` folder.
-   **Role-Based Access**: Admin-only endpoints are protected.
-   **Role-Based Access**: Admin-only API endpoints are protected.

## Project Setup


```bash
python seed_db.py
# Al-Burhan Library Digitalization Project 📚✨

## Overview 🌟
The Al-Burhan Library Digitalization Project is a web application developed for DN Campus to transform the Al-Burhan Library into a digital platform. 📖💻 The app empowers students to search and access digitized books (PDFs) and enables library administrators to manage the digital collection. Built with a responsive and animated user interface, it supports both mobile 📱 and desktop 🖥️ devices and is designed to be converted into native mobile (iOS/Android) and desktop (Windows/macOS/Linux) apps using Thunkable and Electron. 🚀


## Features 🎉

- ### Admin Interface 🛠️:
  - Upload PDF books with metadata (title, author). 📥
  - View and manage the library’s digital collection. 📋
  - Secure access restricted to admin users. 🔒


- ### Student Interface 🎓:
  - Search books by title or author. 🔍
  - View and download PDF books. 📚
  - User-friendly, mobile-responsive design. 📱


- ### Authentication 🔐:
  - Secure login for admins and students via Firebase Authentication.
  - Role-based access (admin vs. student).


- ### Responsive Design 🌐:
  - Adapts to mobile, tablet, and desktop screens using Tailwind CSS. 📏


- ### Animations 🎥:
  - Smooth transitions and interactive elements using Framer Motion (e.g., fade-in effects, button hover animations). ✨


- ### Data Storage 💾:
  - Book metadata and user data stored in Google Firestore.
  - PDF files stored in Firebase Storage.



## Technology Stack 🛠️

- ### Frontend:
  - React: For dynamic user interfaces. ⚛️
  - Tailwind CSS: For responsive and modern styling. 🎨
  - Framer Motion: For animations and transitions. 🎬


- ### Backend:
  - Firebase 🔥:
  - Firestore: NoSQL database for book and user data. 🗄️
  - Storage: Cloud storage for PDF files. ☁️
  - Authentication: Email/password-based user authentication. 🔑




### Deployment:
- Vercel: For hosting the web app. 🌍


### App Conversion:
- Thunkable: For iOS and Android apps. 📱
- Electron: For desktop applications. 🖥️



## Prerequisites ✅

- Node.js (v16 or later) for local development and Electron setup. 🟢
- Firebase account for backend services. 🔥
- Thunkable account for mobile app conversion. 🚀
- Git for version control. 📂

## Setup Instructions 🛠️
### 1. Firebase Configuration 🔥

#### 1. Create a Firebase project at console.firebase.google.com. 🌐


#### 2. Enable Authentication 🔑:
    - Go to Authentication > Sign-in method > Enable Email/Password.
    - Add test users:
    - Admin: `admin@alburhanlibrary.com`, Password: `admin123`, Role: `admin`. 👩‍💼
    - Student: `student@alburhanlibrary.com`, Password: `student123`, Role: `student`. 🎓


#### 3. Enable Firestore 🗄️:
    - Create a Firestore database in production mode.
    - Create a `users` collection with documents for each user (e.g., `uid: { role: 'admin' }`).
    - Create a `books` collection (populated by the app).


#### 4. Enable Storage ☁️:
  - Set up Firebase Storage for PDF uploads.
- Update Storage rules:
      ```rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /books/{allPaths=**} {
          allow read: if true;
          allow write: if request.auth != null && request.auth.token.role == 'admin';
        }
      }
    }```




#### 5. Get Firebase config:
  - Go to Project Settings > General > Your apps > Add Web App.
  - Copy the `firebaseConfig` object and update the `index.html` file. 📝



### 2. Frontend Setup 💻

#### 1. Clone the repository:
    ```git clone <repository-url>
    cd al-burhan-library```


#### 2. Copy the provided `index.html` to the project root. 📄
#### 3. Serve locally for testing:
      ```npx serve```


#### 4. Open `http://localhost:3000` in a browser to test the app. 🌐

### 3. Deployment 🚀

#### - Web App 🌍:
  - Push `index.html` to a GitHub repository. 📂
    - Connect the repository to Vercel at vercel.com.
    - Deploy to get a public URL (e.g., `https://al-burhan-library.vercel.app` ).


#### Firebase 🔥:
  Ensure Firestore, Storage, and Authentication are configured as above.
    Update index.html with the deployed Firebase config.



### 4. Mobile App Conversion (Thunkable) 📱
   Sign up at thunkable.com. 🖌️
    Create a new project and add a Web Viewer component.
    Set the Web Viewer’s URL to the deployed web app URL (e.g., https://al-burhan-library.vercel.app).
    Adjust the Web Viewer to fill the screen (set height/width to 100%). 📏
    Customize with a splash screen or app icon. 🎨
    Publish to Google Play or App Store, or download the APK for testing. 🚀

### 5. Desktop App Conversion (Electron) 🖥️
  Create a new folder for the desktop app:mkdir al-burhan-library-desktop
    ```
    cd al-burhan-library-desktop
    npm init -y
    npm install electron --save-dev
    ```
    
   Create a main.js file:const { app, BrowserWindow } = require('electron');
    ```
    function createWindow() {
      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: { nodeIntegration: true, contextIsolation: false },
      });
      win.loadURL('https://al-burhan-library.vercel.app');
    }
    ```
    ```
    app.whenReady().then(createWindow);
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });
    ```
    ```
    Update package.json:{
      "name": "al-burhan-library-desktop",
      "version": "1.0.0",
      "main": "main.js",
      "scripts": {
        "start": "electron ."
      }
    }
    ```
    ```
    Run the desktop app:npm start
    ```
    ```
    Package for distribution:npm install electron-packager --save-dev
    npx electron-packager . AlBurhanLibrary --platform=win32,darwin,linux --arch=x64
    ```

## Security 🔒

    ```
    Firebase Rules:
    Firestore:rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId} {
          allow read: if request.auth.uid == userId;
          allow write: if request.auth != null && request.auth.token.role == 'admin';
        }
        match /books/{bookId} {
          allow read: if true;
          allow write: if request.auth != null && request.auth.token.role == 'admin';
        }
      }
    }
    ```
    
    
    
  Authentication: Uses Firebase Authentication with email/password. Add password reset or user registration for scalability. 🔑
    HTTPS: All Firebase services and the deployed web app use HTTPS for secure communication. 🌐

## Accessibility ♿

  The app uses Tailwind CSS focus states and Framer Motion for smooth interactions. ✨
    ARIA labels can be added to inputs and buttons for screen reader support if needed.

## Considerations ⚠️

   Copyright: Ensure uploaded PDFs are public domain or licensed for distribution to comply with legal requirements. 📜
   Scalability: Firestore and Firebase Storage scale automatically. Monitor usage to manage costs. 📈
   Testing: Test with a small set of PDFs and users to verify functionality, responsiveness, and animations. 🧪
    Maintenance: Regularly update Firebase SDKs and check Vercel deployment for uptime. 🛠️

## Future Enhancements 🚀

  Add advanced search filters (e.g., by tags or publication year). 🔍
  Implement student registration with unique IDs. 🎓
  Add offline support using Firebase’s offline capabilities. 📴
  Integrate analytics to track book usage. 📊

## Contact 📬
   For issues or contributions, contact the DN Campus IT team or open an issue on the project’s GitHub repository. 🌟