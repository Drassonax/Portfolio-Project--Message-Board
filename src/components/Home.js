import React from 'react'
import { Link } from 'react-router-dom'

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleNewBoardName = this.handleNewBoardName.bind(this)
    this.createBoard = this.createBoard.bind(this)
    this.state = {
      input: '',
      boards: {},
      newBoardName: ''
    }
  }

  componentDidMount() {
    fetch(`/get-boards`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({boards: data})
      }).catch((err) => {
        console.log('error:', err)
      })
  }

  handleInputChange = (event) => {
    this.setState({ input: event.target.value})
  }

  handleNewBoardName = (event) => {
    if (event.target.value.includes('/')) {
      alert('Board name cannot include "/" character!')
    } else {
      this.setState({ newBoardName: event.target.value })
    }
  }

  createBoard = (event) => {
    event.preventDefault()
    window.location.pathname = `/board/${this.state.newBoardName}`
  }

  render() {
    return (
      <div>
        <h1 id="title">Anonymous message board</h1>
        <div id="home-container">
          <div id="boards">
            <div id="search">
              <input 
                onChange={this.handleInputChange}
                placeholder="search boards" 
                autoFocus
                value={this.state.input} 
              />
            </div>
            <ul id="board-list">
              {Object.keys(this.state.boards).filter((board) => board.toLowerCase().includes(this.state.input.toLowerCase())).map((board) => {
                return (
                  <li><Link to={`/board/${board}`} className="board-name">/{board}/</Link><div className="thread-num">{this.state.boards[board]} thread(s)</div></li>
                )
              })}
              <div id="no-more-threads">---No more boards to display---</div>
            </ul>
          </div>

          <div id="new-board">
            <form>
              <div id="new-board-label">Create new board:</div>
              <input 
                onChange={this.handleNewBoardName}
                placeholder="board name" 
                value={this.state.newBoardName}
                name="board-name"
              />
              <button onClick={this.createBoard}>Create new board</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Home