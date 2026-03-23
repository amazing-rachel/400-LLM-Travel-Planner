import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

function formatUserDisplay(user){
  if (!user) return 'Guest';
  const name = user.firstName;
 if (user.role === 'admin') return `${name} (Admin)`;
  return name;
}

const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const displayUser = formatUserDisplay(user);

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.spacing}></div>
        <h1 className={styles.title}>LLM Travel Planner</h1>
      {/* Dropdown for User Profile and Saved */}
      <div className={styles.userSection}>
          <div className={styles.accountTitle}>User: {displayUser}</div>
          {user && (
            <div className={styles.dropdown}>
              <button className={styles.profileButton}>Profile ▾</button>

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
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/trip-input" className={styles.navLink}>Find Itineraries</Link>
        {isLoggedIn ? (
          <button onClick={logout} className={styles.navLink}>
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