import React from 'react';
import PropTypes from 'prop-types';

// External style objects
const containerStyle = {
  display: 'flex',
  gap: '5px',
  alignItems: 'center',
  fontSize: '0.9rem',
};

const itemStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: '#fff',
  transition: 'color 0.3s',
};

const separatorStyle = {
  color: '#fff',
};

// Helper function to compute names based on the file system structure and current path.
// Helper function to compute names based on the file system structure and current path.
function getPathNames(fs, path) {
  let names = [];
  let current = fs;
  if (!current) return []; // safeguard in case fs is undefined
  names.push(current.name);
  
  // Start at index 1 since index 0 is assumed to be the root.
  for (let i = 1; i < path.length; i++) {
    // Make sure current exists and has a folders array
    if (!current || !current.folders) break;
    const next = current.folders.find((f) => f.id === path[i]);
    if (next) {
      names.push(next.name);
      current = next;
    } else {
      break;
    }
  }
  return names;
}


// Breadcrumb component wrapped in React.memo for performance
const Breadcrumb = React.memo(({ currentPath, fileSystem, onSelect, separator }) => {
  const names = getPathNames(fileSystem, currentPath);

  return (
    <div style={containerStyle}>
      {names.map((name, index) => {
        const pathForItem = currentPath.slice(0, index + 1);
        return (
          <span key={pathForItem.join('-')}>
            <span
              style={itemStyle}
              onClick={() => onSelect(pathForItem)}
              onMouseOver={(e) => (e.target.style.color = '#ffdd57')}
              onMouseOut={(e) => (e.target.style.color = '#fff')}
            >
              {name}
            </span>
            {index < names.length - 1 && <span style={separatorStyle}>{separator}</span>}
          </span>
        );
      })}
    </div>
  );
});

Breadcrumb.propTypes = {
  currentPath: PropTypes.arrayOf(PropTypes.string).isRequired,
  fileSystem: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  separator: PropTypes.node,
};

Breadcrumb.defaultProps = {
  separator: ' / ',
};

export default Breadcrumb;
