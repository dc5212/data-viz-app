import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import TaskDetails from './pages/TaskDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <a href="/">Data Visualization App</a>
          </nav>
        </header>
        
        <main>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/tasks/:taskId" component={TaskDetails} />
          </Switch>
        </main>
        
        <footer>
          <p>&copy; 2025 Data Visualization App</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;