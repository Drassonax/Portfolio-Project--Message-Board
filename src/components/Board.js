import React from 'react'
import { Link } from 'react-router-dom'

class Board extends React.Component {
  constructor(props) {
    super(props)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleNewThread = this.handleNewThread.bind(this)
    this.handleReportThread = this.handleReportThread.bind(this)
    this.handleDeleteThread = this.handleDeleteThread.bind(this)
    this.state = {
      input: '',
      threads: [],
      board: ''
    }
  }

  componentDidMount() {
    const pathnameArray = window.location.pathname.split('/')
    if (pathnameArray.length !== 3) {
      window.location.pathname = '/'
    }
    const boardName = pathnameArray[2]
    fetch(`/get-threads/${boardName}`)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.setState({ threads: data, board: boardName })
      }).catch((err) => {
        console.log('error', err)
      })
  }

  handleInputChange = (event) =>{
    this.setState({ input: event.target.value })
  }

  handleNewThread = (event) => {
    event.preventDefault()
    fetch(`/create-thread/${this.state.board}`, 
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        author: event.target.author.value || 'Anonymous',
        title: event.target.threadTitle.value,
        text: event.target.text.value,
        password: event.target.password.value
      })
    }).then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          window.location.pathname = `/thread/${this.state.board}/${data.threadID}`
        }
      }).catch((err) => {
        console.log('error:', err)
      })
  }

  handleReportThread = (threadID) => {
    fetch(`/report-thread/${this.state.board}/${threadID}`, { method: 'PUT' })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          alert(data.success)
          let threadIndex
          const threadList = this.state.threads
          const reportedThread = threadList.find((thread, index) => {
            if (thread._id === threadID) {
              threadIndex = index
              return true
            }
          })
          reportedThread.reported = true
          threadList.splice(threadIndex, 1, reportedThread)
          this.setState({
            threads: threadList
          })
        }
      })
  }

  handleDeleteThread = (threadID, password) => {
    fetch(`/delete-thread/${this.state.board}/${threadID}`, 
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body: JSON.stringify({
        password
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.success)
          this.setState({
            threads: this.state.threads.filter((thread) => thread._id !== threadID)
          })
        } else {
          alert(data.error)
        }
      }).catch((err) => {
        console.log('error', err)
      })
  }

  render() {
    return (
      <div>
        <div className="board-nav-container">
          <div className="board-nav-links">
            <div><Link to='/' className="nav-link">Home</Link></div>
            <div><a href="#new-thread" className="nav-link">New thread</a></div>
          </div>
        </div>
        <div className="board">
          <h1>Welcome to /{this.state.board}/</h1>
          <div id="threads">
            <div className="search-container">
              <input 
                onChange={this.handleInputChange}
                placeholder="search threads"
                autoFocus
                value={this.state.input}
              />
            </div>
            <div id="thread-list">
              {this.state.threads.filter((thread) => thread.title.toLowerCase().includes(this.state.input.toLowerCase())).map((thread) => {
                return (
                  <div className="board-thread" key={thread._id}>
                    <div className="post">
                      <div>{`by ${thread.author} | ${thread.createdAt}`}</div>
                      <div className="thread-title"><Link to={`/thread/${this.state.board}/${thread._id}`} className="thread-title-link" >{thread.title}</Link></div>
                      <div className="thread-text">{thread.text}</div>
                      <div className="post-footer">
                        <div>Replies: {thread.replyCount}</div>
                        <div className="post-actions">
                          <div><button onClick={() => this.handleReportThread(thread._id)}>Report thread</button></div>
                          <form onSubmit={(event) => {
                              event.preventDefault()
                              this.handleDeleteThread(thread._id, event.target.password.value)
                            }}>
                            <input placeholder="password" name="password" required />
                            <button>Delete</button>
                          </form>
                        </div>
                      </div>
                      {thread.reported && <div>REPORTED</div>}
                    </div>
                      <div className="reply-list">
                        {thread.replies.map((reply) => {
                          return (
                            <div className="reply" key={reply.id}>
                              <div>{`by ${reply.author} | ${reply.createdAt}`}</div>
                              <div className="reply-text">{reply.text}</div>
                              {reply.reported && <div>REPORTED</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                )
              })}
              <div className="no-more-threads">---No more threads to display---</div>
            </div>
          </div>
          <div id="new-thread">
            Create new thread:
            <form onSubmit={this.handleNewThread} className="form">
              <input name="author" placeholder="name (optional)" className="new-thread-input" />
              <input name="threadTitle" placeholder="title" required className="new-thread-input" />
              <textarea name="text" placeholder="enter your post here" className="new-thread-textarea" />
              <div className="new-thread-final">
                <input name="password" placeholder="delete password" required className="new-thread-input" />
                <button>Create thread</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Board