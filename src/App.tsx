import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import { LibraryProvider } from './library'
import About from './pages/About'
import Community from './pages/Community'
import Home from './pages/Home'
import Issues from './pages/Issues'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <ScrollToTop />
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sayilar" element={<Issues />} />
              <Route path="/hakkinda" element={<About />} />
              <Route path="/topluluk" element={<Community />} />
              <Route path="*" element={<p className="status">Bu sayfa bulunamadı.</p>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </LibraryProvider>
    </BrowserRouter>
  )
}
