import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  GitCompare, 
  Search, 
  Award, 
  ShieldCheck, 
  Gauge, 
  Fuel, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

const Home = () => {
  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Hero Header Section */}
      <header style={styles.hero} className="glass-panel">
        <div style={styles.heroContent}>
          <div style={styles.badgeBanner}>
            <span style={styles.badgeText}>INTUITION DRIVEN CHOICE</span>
          </div>
          <h1 style={styles.heroTitle}>
            Find the Perfect Vehicle <br />
            Matched to <span className="gradient-text">Your Lifestyle</span>
          </h1>
          <p style={styles.heroSub}>
            No complex AI black boxes. Find Ride uses a transparent, weighted multi-attribute algorithm to align specifications directly to your preferences.
          </p>
          <div style={styles.heroCta}>
            <Link to="/recommend" className="btn btn-primary" style={styles.heroBtn}>
              <Compass size={18} /> Get Recommendation
            </Link>
            <Link to="/vehicles" className="btn btn-secondary" style={styles.heroBtn}>
              <Search size={18} /> Browse Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Action Navigation Grid */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.secTitle}>Core Capabilities</h2>
          <p style={styles.secSub}>Explore what you can accomplish on our vehicle matchmaking engine</p>
        </div>

        <div style={styles.grid}>
          <div className="glass-panel card-hover" style={styles.featureCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(99,102,241,0.1)' }}>
              <Compass size={24} color="var(--primary)" />
            </div>
            <h3 style={styles.cardTitle}>Smart recommendation</h3>
            <p style={styles.cardText}>
              Input your budget, preferred driving purpose, fuel preference, and safety needs to receive scored matches immediately.
            </p>
            <Link to="/recommend" style={styles.cardLink}>Try Recommendation →</Link>
          </div>

          <div className="glass-panel card-hover" style={styles.featureCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(6,182,212,0.1)' }}>
              <GitCompare size={24} color="var(--accent)" />
            </div>
            <h3 style={styles.cardTitle}>Side-by-Side Comparison</h3>
            <p style={styles.cardText}>
              Align up to three vehicle models side-by-side to review discrepancies in horsepower, engine size, price, mileage, and features.
            </p>
            <Link to="/compare" style={styles.cardLink}>Open Comparison Board →</Link>
          </div>

          <div className="glass-panel card-hover" style={styles.featureCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(16,185,129,0.1)' }}>
              <Search size={24} color="var(--success)" />
            </div>
            <h3 style={styles.cardTitle}>Advanced Filters</h3>
            <p style={styles.cardText}>
              Sift the vehicle database using strict criteria parameters including transmission types, body styling, seating size, and brand preferences.
            </p>
            <Link to="/vehicles" style={styles.cardLink}>View Catalog →</Link>
          </div>
        </div>
      </section>

      {/* Algorithm Explainer Section */}
      <section style={{ ...styles.section, ...styles.algorithmSec }} className="glass-panel">
        <div style={styles.sectionHeader}>
          <h2 style={styles.secTitle}>Our Matchmaking Architecture</h2>
          <p style={styles.secSub}>How the non-AI weighted scoring utility identifies matches for you</p>
        </div>

        <div style={styles.algoContent}>
          <div style={styles.algoLeft}>
            <div style={styles.algoStep}>
              <div style={styles.algoNum}>1</div>
              <div>
                <h4 style={styles.algoStepTitle}>Define Input Attributes</h4>
                <p style={styles.algoStepText}>We gather your requirements regarding target pricing, usage goals, and safety focus priorities.</p>
              </div>
            </div>
            <div style={styles.algoStep}>
              <div style={styles.algoNum}>2</div>
              <div>
                <h4 style={styles.algoStepTitle}>Distribute Feature Weights</h4>
                <p style={styles.algoStepText}>Different weights are assigned based on factors like safety, fuel economy, and torque to align with your profile preferences.</p>
              </div>
            </div>
            <div style={styles.algoStep}>
              <div style={styles.algoNum}>3</div>
              <div>
                <h4 style={styles.algoStepTitle}>Calculate Spec Scores</h4>
                <p style={styles.algoStepText}>Vehicles are cataloged and graded, and high-scoring vehicles appear first in your results list.</p>
              </div>
            </div>
          </div>

          <div style={styles.algoRight}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Matching Attributes</h3>
            <div style={styles.attributeGrid}>
              <div style={styles.attrItem}>
                <DollarSign size={16} color="var(--primary)" /> Budget Target
              </div>
              <div style={styles.attrItem}>
                <ShieldCheck size={16} color="var(--primary)" /> Safety Priority
              </div>
              <div style={styles.attrItem}>
                <Gauge size={16} color="var(--primary)" /> Power / Torque
              </div>
              <div style={styles.attrItem}>
                <Fuel size={16} color="var(--primary)" /> Fuel Type Economy
              </div>
              <div style={styles.attrItem}>
                <TrendingUp size={16} color="var(--primary)" /> Seating & Cargo
              </div>
              <div style={styles.attrItem}>
                <Award size={16} color="var(--primary)" /> Brand Value
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4rem',
    paddingBottom: '4rem',
  },
  hero: {
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    background: 'radial-gradient(circle at top right, var(--primary-light), transparent 40%), var(--glass-bg)',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  badgeBanner: {
    backgroundColor: 'var(--primary-light)',
    padding: '0.35rem 1rem',
    borderRadius: '20px',
    border: '1px solid rgba(99, 102, 241, 0.15)',
  },
  badgeText: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '1px',
    color: 'var(--primary)',
  },
  heroTitle: {
    fontSize: '2.75rem',
    fontWeight: 800,
    letterSpacing: '-1px',
    lineHeight: 1.2,
    '@media (min-width: 640px)': {
      fontSize: '3.5rem',
    }
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: '650px',
  },
  heroCta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  heroBtn: {
    padding: '0.875rem 1.75rem',
    borderRadius: 'var(--radius-lg)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  sectionHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  secTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  secSub: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: '100%',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginTop: '0.5rem',
  },
  cardText: {
    fontSize: '0.925rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.55,
    flexGrow: 1,
  },
  cardLink: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--primary)',
    marginTop: '0.5rem',
  },
  algorithmSec: {
    padding: '3rem 2rem',
    background: 'radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.08), transparent 30%), var(--glass-bg)',
  },
  algoContent: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3rem',
    alignItems: 'center',
    marginTop: '1.5rem',
  },
  algoLeft: {
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  algoStep: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'start',
  },
  algoNum: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.95rem',
    flexShrink: 0,
  },
  algoStepTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  algoStepText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.45,
  },
  algoRight: {
    flex: '1 1 300px',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '2rem',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border-color)',
  },
  attributeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
    marginTop: '1rem',
  },
  attrItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  }
};

// Global interactive hover CSS injection
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  .card-hover {
    transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal) !important;
  }
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg) !important;
    border-color: var(--primary) !important;
  }
`;
document.head.appendChild(styleTag);

export default Home;
