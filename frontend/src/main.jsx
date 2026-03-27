import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/appStore.js'
import { AuthInitializer } from './features/auth/components/AuthInitializer.jsx'

createRoot(document.getElementById('root')).render(
 <Provider store={store}>
<AuthInitializer>
      <App />
</AuthInitializer>
 </Provider>
)
