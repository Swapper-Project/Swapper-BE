const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const port = process.env.IMG_PORT || 4005;

app.use(cors());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use('/uploads', express.static(__dirname + '../uploads'));
app.use(express.static(__dirname + '/uploads'));

app.get('/api/getPostImg', (req, res) => {
  //console.log(req.query.filename)
  var filepath = path.resolve(
    `${__dirname}/../uploads/post_images/${req.query.filename}`
  );
  res.sendFile(filepath, (err) => {
    if (err) {
      console.log(err);
      return res.json(err);
    } else {
      //console.log('Image at ' + filepath + ' sent to client.');
    }
  });
});

app.listen(port, console.log('Img service running.'));
