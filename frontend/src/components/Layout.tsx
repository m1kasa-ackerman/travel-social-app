import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

const NAV_TABS = [
    { label: 'Home', icon: '🏠', to: '/' },
    { label: 'Map', icon: '🗺️', to: '/map' },
    { label: 'Saved', icon: '🔖', to: '/saved' },
    { label: 'Explore', icon: '🔍', to: '/explore' },
    { label: 'Messages', icon: '💬', to: '/messages' },
];

export function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (search.trim()) navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
    }

    return (
        <div className={styles.root}>
            {/* Top Navigation */}
            <header className={styles.topNav}>
                <div className={styles.navInner}>
                    {/* Logo */}
                    <Link to="/" className={styles.logo}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="12,6 15.09,12.26 22,13.27 17,18.14 18.18,25.02 12,21.77 5.82,25.02 7,18.14 2,13.27 8.91,12.26" style={{ transform: 'scale(0.5)', transformOrigin: '12px 12px' }} />
                            <line x1="12" y1="2" x2="12" y2="4" />
                            <line x1="12" y1="20" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="4" y2="12" />
                            <line x1="20" y1="12" x2="22" y2="12" />
                        </svg>
                        <span className={styles.logoText}>Wandrly</span>
                    </Link>

                    {/* Search */}
                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <div className={styles.searchWrap}>
                            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search destinations, people, itineraries…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className={styles.navRight}>
                        <button className={styles.notifBtn} title="Notifications">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className={styles.notifDot} />
                        </button>

                        <Link to="/create" className={styles.createBtn}>
                            + Create
                        </Link>

                        {/* Avatar + Dropdown */}
                        <div className={styles.avatarWrap} ref={dropRef}>
                            <button className={styles.avatarBtn} onClick={() => setDropOpen(d => !d)}>
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.displayName} className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarInitial}>
                                        {user?.displayName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </button>
                            {dropOpen && (
                                <div className={styles.dropdown}>
                                    <Link to={`/profile/${user?.username}`} className={styles.dropItem} onClick={() => setDropOpen(false)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        Profile
                                    </Link>
                                    <Link to="/saved" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                        Saved
                                    </Link>
                                    <div className={styles.dropDivider} />
                                    <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={() => { logout(); setDropOpen(false); }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Bar */}
            <nav className={styles.tabBar}>
                <div className={styles.tabInner}>
                    {NAV_TABS.map(tab => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.to === '/'}
                            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
                        >
                            <span className={styles.tabIcon}>{tab.icon}</span>
                            <span className={styles.tabLabel}>{tab.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.main}>
                {children}
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className={styles.mobileTabBar}>
                {NAV_TABS.map(tab => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.to === '/'}
                        className={({ isActive }) => `${styles.mobileTab} ${isActive ? styles.mobileTabActive : ''}`}
                    >
                        <span className={styles.mobileTabIcon}>{tab.icon}</span>
                        <span className={styles.mobileTabLabel}>{tab.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
