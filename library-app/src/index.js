import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // ✅

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// ✅ Register service worker
serviceWorkerRegistration.register();
// This line registers the service worker, enabling the app to work offline and load faster on subsequent visits.
// The service worker will cache the app's assets and serve them from the cache when offline,