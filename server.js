const express = require('express')
const path = require('path')
const publicPath = path.join(__dirname, 'public')
const bodyParser  = require('body-parser')
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(publicPath))
const CONNECTION_STRING = process.env.DB
mongoose.connect(CONNECTION_STRING)

// schemas
const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  createdAt: {
    type: Date
  },
  password: {
    type: String
  },
  reported: {
    type: Boolean,
    default: false
  }
})

const threadSchema = new mongoose.Schema({
  board: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date
  },
  bumpedAt: {
    type: Date
  },
  reported: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  replies: {
    type: [replySchema]
  }
})

let Thread = mongoose.model('Thread', threadSchema)


const database = mongoose.connection
database.on('error', console.error.bind(console, 'connection error:'))

database.once('open', () => {
  app.get('/get-boards', (req, res) => {
    Thread.find(
    {},
    'board',
    (err, docs) => {
      let boards = {}
      docs.forEach((doc) => {
        if (!boards.hasOwnProperty(doc.board)) {
          boards[doc.board] = 1
        } else {
          boards[doc.board]++
        }
      })
      res.json(boards)
    })
  })
  
  app.get('/get-threads/:board', (req, res) => {
    Thread.find(
      { board: req.params.board },
      null,
      {
        sort: {
          bumpedAt: -1
        }  
      },
      (err, docs) => {
        if (!docs) {
          res.json([])
        } else {
          res.json(docs.map((thread) => {
            return {
              _id: thread._id,
              author: thread.author || 'Anonymous',
              title: thread.title,
              text: thread.text,
              createdAt: thread.createdAt,
              bumpedAt: thread.bumpedAt,
              reported: thread.reported,
              password: thread.password,
              replyCount: thread.replies.length,
              replies: thread.replies.slice(0, 3)
            }
          }))
        }
      }
    )
  })
  
  app.get('/get-replies/:board/:threadID', (req, res) => {
    Thread.findById(req.params.threadID, (err, doc) => {
      if (doc) {
        res.json(doc)
      } else {
        res.json([])
      }
    })
  })
  
  app.post('/create-thread/:board', (req, res) => {
    let thread = new Thread({
      board: req.params.board,
      author: req.body.author,
      title: req.body.title,
      text: req.body.text,
      createdAt: new Date(),
      bumpedAt: new Date(),
      reported: false,
      password: req.body.password,
      replies: []
    })
    thread.save((err, thread) => {
      if (err) {
        res.json({error: 'Error'})
      } else {
        res.json({threadID: thread._id})
      }
    })
  })
  
  app.post('/create-reply/:board/:threadID', (req, res) => {
    Thread.findByIdAndUpdate(
      req.params.threadID,
      {
        bumpedAt: new Date(),
        $push: {
          replies: {
            author: req.body.author,
            text: req.body.text,
            createdAt: new Date(),
            password: req.body.password,
            reported: false
          }
        }
      },
      { new: true },
      (err, thread) => {
        if (err) {
          res.json({error: 'An error has occured. Please try again later.'})
        } else {
          res.json(thread.replies)
        }
      }
    )
  })
  
  app.put('/report-thread/:board/:threadID', (req, res) => {
    Thread.findByIdAndUpdate(
      req.params.threadID,
      {$set: {reported: true}},
      (err, doc) => {
        if (err) {
          res.json({error: 'An error has occured. Please try again later.'})
        } else {
          res.json({success: 'Thread reported'})
        }
      }
    )
  })
  
  app.put('/report-reply/:board/:threadID/:replyID', (req, res) => {
    Thread.findOneAndUpdate(
      {"_id": req.params.threadID, "replies._id": req.params.replyID},
      {
        $set: {
          "replies.$.reported": true
        }
      },
      (err, doc) => {
        if (err) {
          res.json({error: 'An error has occured. Please try again later.'})
        } else {
          res.json({success: 'Post reported'})
        }
      }
    )
  })
  
  app.delete('/delete-thread/:board/:threadID', (req, res) => {
    Thread.findById(req.params.threadID, (err, doc) => {
      if (doc.password === req.body.password) {
        Thread.findByIdAndDelete(req.params.threadID, (err, doc) => {
          res.json({success: 'Thread deleted'})
        })
      } else {
        res.json({error: 'Incorrect password'})
      }
    })
  })
  
  app.delete('/delete-reply/:board/:threadID/:replyID', (req, res) => {
    Thread.findOneAndUpdate(
      {"_id": req.params.threadID, "replies._id": req.body.replyID, "replies.password": req.body.password},
      {
        $set: {
          "replies.$.text": 'DELETED'
        }
      },
      (err, doc) => {
        if (!doc) {
          res.json({error: 'Wrong password'})
        } else {
          res.json({success: 'Post deleted'})
        }
      }
    )
  })
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
  
  app.listen(port, () => {
    console.log('Server is up!')
  })
})
