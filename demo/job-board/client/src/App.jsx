import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import JobListPage from './pages/JobListPage'
import JobDetail from './pages/JobDetail'
import CompanyProfile from './pages/CompanyProfile'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
