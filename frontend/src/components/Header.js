import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>LLM Travel Planner</h1>
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