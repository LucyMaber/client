import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Files from './pages/Files/FileBrowser';
import CollaborativeEditor from './pages/CollaborativeTagger/CollaborativeTagger';
import { TagProvider } from './providers/TagProvider';
import { FileSystemProvider } from './providers/FileSystemProvider';

import './App.css';

const App = () => {
  return (
    <TagProvider>
      <Router>
        <nav className="navbar">
          <ul className="nav-list">
            <li>
              <Link to="/">Files</Link>
            </li>
            <li>
              <Link to="/CollaborativeEditor">CollaborativeEditor</Link>
            </li>
            <li>
              <Link to="/project">Projects</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <FileSystemProvider>
                <Files />
              </FileSystemProvider>
            }
          />
          <Route path="/CollaborativeEditor" element={<CollaborativeEditor />} />
        </Routes>
      </Router>
    </TagProvider>
  );
};

export default App;
