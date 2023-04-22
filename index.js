const connectmongo = require('./db');
const express = require('express')
connectmongo();
var cors = require('cors')

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

// Available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`yournote listening on port ${port}`)
})