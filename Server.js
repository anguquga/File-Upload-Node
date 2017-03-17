var express = require("express");
var multer = require('multer');
var mime = require('mime');
const path = require('path');
const fs = require('fs');

var app = express();

var uploadFolder = './uploads/';

var maxSize = 1 * 1000 * 1000;

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadFolder);
  },
  filename: function (req, file, callback) {
    callback(null, req.fileNameTmp);
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize, files: 1 },
  fileFilter: function (req, file, cb) {
    console.debug("Filefilter");
    file.fileRejected = false;
    fileNameTmp = file.originalname + '-TT.' + mime.extension(file.mimetype);
    console.debug("fileNameTmp: " + fileNameTmp);
    uploadAbsoluteFile = path.resolve(uploadFolder) + path.sep + fileNameTmp;
    console.debug("uploadAbsoluteFile: " + uploadAbsoluteFile);
    if (fs.existsSync(uploadAbsoluteFile)) {
      console.debug("File Already exists");
      req.fileRejected = true;
      cb(null, false, new Error('File Already exists'));
    } else if (file.mimetype !== 'image/png') {
      console.debug("Not a PNG");
      req.fileRejected = true;
      return cb(null, false, new Error('File Type not allowed'));
    }
    req.fileNameTmp = fileNameTmp;
    cb(null, true);
  }
}).single('userPhoto');

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo', function (req, res) {
  try {
    upload(req, res, function (err) {
      if (err) {
        console.error(err);
        res.json({ status: false, result: err.message, files: null });
        return;
      } else if (req.fileRejected) {
        res.json({ status: false, result: "File not allowed to be uploaded", files: null });
        return;
      }
      res.json({ status: true, result: "File is uploaded", files: req.file });
      return;
    });
  } catch (err) {
    console.error(err);
    res.json({ status: false, result: "An error ocurred uploading the file", files: null });
    return;
  }
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ status: false, result: "General - An error ocurred uploading the file", files: null });
  return
});

app.listen(3000, function () {
  console.log("Working on port 3000");
});
