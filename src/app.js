import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Home from './components/Home'
import Board from './components/Board'
import Thread from './components/Thread'
import 'normalize.css/normalize.css'
import './styles/styles.scss'

class App extends React.Component {

  render() {
    return(
      <BrowserRouter>
        <Switch>
          <Route path="/board" component={Board} />
          <Route path="/thread" component={Thread} />
          <Route path="/" component={Home} />
        </Switch>
      </BrowserRouter>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))