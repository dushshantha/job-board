import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="container header__inner">
          <NavLink to="/" className="header__brand">
            <svg
              className="header__logo"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="6" fill="var(--color-primary)" />
              <rect x="7" y="8" width="14" height="2.5" rx="1.25" fill="white" />
              <rect x="7" y="12.75" width="10" height="2.5" rx="1.25" fill="white" />
              <rect x="7" y="17.5" width="12" height="2.5" rx="1.25" fill="white" />
            </svg>
            <span className="header__title">JobBoard</span>
          </NavLink>

          <nav className="header__nav" aria-label="Main navigation">
            <NavLink
              to="/"
              className={({ isActive }) =>
                ['header__nav-link', isActive ? 'header__nav-link--active' : ''].join(' ').trim()
              }
              end
            >
              Jobs
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} JobBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
