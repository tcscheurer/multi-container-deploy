import React, { Component } from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import DummyPage from './components/DummyPage';
import Fib from './components/Fib';


class App extends Component {
  render() {
    return (
      <Router>
          <Switch>
          <Route exact path="/" component={Fib} />
          <Route path="/otherPage" component={DummyPage} />
          </Switch>
      </Router>
      
    );
  }
}

export default App;
