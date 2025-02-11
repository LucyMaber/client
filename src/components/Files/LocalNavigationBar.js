import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumb from './Breadcrumb';

// Define external style objects
const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  background: '#f9f9f9',
  padding: '5px',
  borderBottom: '1px solid #ddd',
  fontSize: '0.9rem',
};

const buttonStyle = {
  padding: '4px 8px',
  border: 'none',
  background: '#ddd',
  borderRadius: '3px',
  cursor: 'pointer',
};

// LocalNavigationBar Component wrapped in React.memo for performance
const LocalNavigationBar = React.memo(({
  currentPath,
  onBack,
  onForward,
  onReload,
  canGoBack,
  canGoForward,
  fileSystem,
  onBreadcrumbSelect,
}) => (
  <div style={navStyle}>
    <button 
      onClick={onBack} 
      disabled={!canGoBack} 
      style={buttonStyle}
      aria-label="Go Back"
    >
      ◀
    </button>
    <button 
      onClick={onForward} 
      disabled={!canGoForward} 
      style={buttonStyle}
      aria-label="Go Forward"
    >
      ▶
    </button>
    <button 
      onClick={onReload} 
      style={buttonStyle}
      aria-label="Reload"
    >
      ⟳
    </button>
    <Breadcrumb 
      currentPath={currentPath} 
      fileSystem={fileSystem} 
      onSelect={onBreadcrumbSelect} 
    />
  </div>
));

LocalNavigationBar.propTypes = {
  currentPath: PropTypes.arrayOf(PropTypes.string).isRequired,
  onBack: PropTypes.func.isRequired,
  onForward: PropTypes.func.isRequired,
  onReload: PropTypes.func.isRequired,
  canGoBack: PropTypes.bool.isRequired,
  canGoForward: PropTypes.bool.isRequired,
  fileSystem: PropTypes.object.isRequired,
  onBreadcrumbSelect: PropTypes.func.isRequired,
};

export default LocalNavigationBar;
