import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  let displayUser;

  if (user) {
    displayUser = user.firstName;
  } else {
    displayUser = "Guest";
  }

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.spacing}></div>
        <h1 className={styles.title}>LLM Travel Planner</h1>

      <div className={styles.accountTitle}>User: {displayUser}</div>
      </header>
      
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/trip-input" className={styles.navLink}>Find Itineraries</Link>
        <Link to="/login" className={styles.navLink}>Login</Link>
      </nav>
    </div>
  );
};

export default Header;