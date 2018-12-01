import React from 'react'
import { Link } from 'react-router-dom'

class Thread extends React.Component {
  constructor(props) {
    super(props)
    this.handleReportThread = this.handleReportThread.bind(this)
    this.handleDeleteThread = this.handleDeleteThread.bind(this)
    this.handlePostReply = this.handlePostReply.bind(this)
    this.handleReportReply = this.handleReportReply.bind(this)
    this.handleDeleteReply = this.handleDeleteReply.bind(this)
    this.state = {
      thread: {},
      replies: [],
      board: '',
      threadID: ''
    }
  }

  componentDidMount() {
    const pathnameArray = window.location.pathname.split('/')
    if (pathnameArray.length !== 4) {
      window.location.pathname = '/'
    }
    const boardName = pathnameArray[2]
    const threadID = pathnameArray[3]
    fetch(`/get-replies/${boardName}/${threadID}`)
      .then((response) => response.json())
      .then((thread) => {
        if (thread.author) {
          this.setState({
            thread: {
              author: thread.author,
              title: thread.title,
              text: thread.text,
              createdAt: thread.createdAt,
              reported: thread.reported,
              password: thread.password
            },
            replies: thread.replies,
            board: boardName,
            threadID
          })
        } else {
          window.location.pathname = '/'
        }
      })
  }

  handleReportThread = (event) => {
    fetch(`/report-thread/${this.state.board}/${this.state.threadID}`, { method: 'PUT' })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          alert(data.success)
          const threadReported = this.state.thread
          threadReported.reported = true
          this.setState({ thread: threadReported })
        }
      })
  }

  handleDeleteThread = (password) => {
    fetch(`/delete-thread/${this.state.board}/${this.state.threadID}`, 
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password
      })
    }).then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.pathname = `/board/${this.state.board}`
        } else {
          alert(data.error)
        }
      })
  }

  handlePostReply = (event) => {
    event.preventDefault()
    fetch(`/create-reply/${this.state.board}/${this.state.threadID}`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        author: event.target.author.value || 'Anonymous',
        text: event.target.post.value,
        password: event.target.password.value
      })
    }).then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          this.setState({
            replies: data
          })
        }
      })
  }

  handleReportReply = (replyID) => {
    fetch(`/report-reply/${this.state.board}/${this.state.threadID}/${replyID}`,
      { method: 'PUT' }
    ).then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          alert(data.success)
          let replyIndex
          const replyList = this.state.replies
          const reportedReply = replyList.find((reply, index) => {
            if (reply._id === replyID) {
              replyIndex = index
              return true
            }
          })
          reportedReply.reported = true
          replyList.splice(replyIndex, 1, reportedReply)
          this.setState({
            replies: replyList
          })
        }
      })
  }

  handleDeleteReply = (replyID, password) => {
    fetch(`/delete-reply/${this.state.board}/${this.state.threadID}/${replyID}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
        body: JSON.stringify({
          replyID,
          password
        })
      }
    ).then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error)
        } else {
          alert(data.success)
          let replyIndex
          const replyList = this.state.replies
          const deletedReply = replyList.find((reply, index) => {
            if (reply._id === replyID) {
              replyIndex = index
              return true
            }
          })
          deletedReply.text = 'DELETED'
          replyList.splice(replyIndex, 1, deletedReply)
          this.setState({
            replies: replyList
          })
        }
      })
  }

  render() {
    return (
      <div>
        <div className="thread-nav-container">
          <div className="thread-nav">
            <div>
              <Link to='/' className="nav-link">Home</Link><span>  |  </span>
              <Link to={`/board/${this.state.board}`} className="nav-link">/{this.state.board}/</Link>
            </div>
            <div>
              <a href="#new-reply" className="nav-link">New reply</a>
            </div>
          </div>
        </div>
        <div className="thread">
          <div className="post">
            <div>{`by ${this.state.thread.author} | ${this.state.thread.createdAt}`}</div>
            <div className="thread-title">{this.state.thread.title}</div>
            <div className="thread-text">{this.state.thread.text}</div>
            <div className="post-footer">
              <div>Replies: {this.state.replies.length}</div>
              <div className="post-actions">
                <div><button onClick={this.handleReportThread}>Report thread</button></div>
                <form 
                  onSubmit={(event) => {
                    event.preventDefault()
                    this.handleDeleteThread(event.target.password.value)
                  }}>
                  <input placeholder="password" name="password" />
                  <button>Delete</button>
                </form>
              </div>
            </div>
            {this.state.thread.reported && <div>REPORTED</div>}
          </div>
          <div className="reply-list">
            {this.state.replies.map((reply) => {
              return (
                <div className="reply" key={reply._id}>
                  <div>{`by ${reply.author} | ${reply.createdAt}`}</div>
                  <div className="reply-text">{reply.text}</div>
                  <div className="post-actions">
                    <div><button onClick={() => this.handleReportReply(reply._id)}>Report post</button></div>
                    <form onSubmit={(event) => {
                      event.preventDefault()
                      this.handleDeleteReply(reply._id, event.target.password.value)
                    }}>
                      <input placeholder="password" name="password" />
                      <button>Delete</button>
                    </form>
                  </div>
                  {reply.reported && <div>REPORTED</div>}
                </div>
              )
            })}
          </div>
          <div id="new-reply">
            Post new reply:
            <form onSubmit={this.handlePostReply} className="form">
              <input name="author" placeholder="name (optional)" className="new-thread-input" />
              <textarea name="post" placeholder="enter your reply here" className="new-thread-textarea"  />
              <div className="new-reply-final">
                <input name="password" placeholder="delete password" className="new-thread-input" />
                <button>Post</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Thread