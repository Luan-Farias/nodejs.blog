const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', err => {
    console.error(`ERROR: ${err.message}`);
});

// Loading the models
require('./models/Post');

const app = require('./app');

app.set('port', process.env.PORT || 3333);
const server = app.listen(app.get('port'), () => {
    console.log(`Server running in the port ${server.address().port}`);
});
