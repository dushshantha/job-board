import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import JobListPage from './pages/JobListPage'
import JobDetailPage from './pages/JobDetailPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
