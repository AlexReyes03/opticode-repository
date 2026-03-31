import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRouter/>
    </AuthProvider>
  )
}

export default App
