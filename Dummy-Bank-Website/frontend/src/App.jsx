import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SearchUser from './pages/SearchUser'
import Transfer from './pages/Transfer'
import Confirmation from './pages/Confirmation'
import Success from './pages/Success'
import { Contacts, Transactions } from './pages/Lists'
import Layout from './layouts/Layout'
import MobileRecharge from './pages/services/MobileRecharge'
import ElectricityBill from './pages/services/ElectricityBill'
import BuyGold from './pages/services/BuyGold'
import Settings from './pages/Settings'
import useBankStore from './store/bankStore'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useBankStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchUser />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/success" element={<Success />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/services/mobile-recharge" element={<MobileRecharge />} />
          <Route path="/services/electricity" element={<ElectricityBill />} />
          <Route path="/services/gold" element={<BuyGold />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
