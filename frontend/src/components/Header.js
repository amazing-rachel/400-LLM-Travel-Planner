import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';
import {
  GUEST_SHOW_SAVED_KEY,
  GUEST_SAVED_NAV_EVENT,
} from '../constants/guestSession';

function formatUserDisplay(user) {
  if (!user) return 'Guest';
  const name =
    user.firstName ||
    user.first_name ||
    user.username ||
    user.email ||
    'User';
  if (user.role === 'admin') return `${name} (admin)`;
  return name;
}

const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const displayUser = formatUserDisplay(user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSavedItinerariesNav = () => {
    sessionStorage.removeItem(GUEST_SHOW_SAVED_KEY);
    window.dispatchEvent(new Event(GUEST_SAVED_NAV_EVENT));
  };

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.spacing} />
        <h1 className={styles.title}>LLM Travel Planner</h1>

        <div className={styles.userSection}>
          <div className={styles.accountTitle}>User: {displayUser}</div>
          {user && (
            <div className={styles.dropdown}>
              <button type="button" className={styles.profileButton}>
                Profile ▾
              </button>

              <div className={styles.dropdownContent}>
                <Link to="/profile" className={styles.dropdownItem}>
                  Edit Profile
                </Link>
                <Link to="/saved-itineraries" className={styles.dropdownItem}>
                  View Saved Itineraries
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>
          Home
        </Link>
        <Link to="/trip-input" className={styles.navLink}>
          Find Itineraries
        </Link>
        <Link
          to="/saved-itineraries"
          className={styles.navLink}
          onClick={handleSavedItinerariesNav}
        >
          Saved Itineraries
        </Link>
        {isLoggedIn ? (
          <button type="button" onClick={handleLogout} className={styles.navLink}>
            Logout
          </button>
        ) : (
          <Link to="/login" className={styles.navLink}>
            Login
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Header;
