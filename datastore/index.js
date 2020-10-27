const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

Promise.promisifyAll(fs);
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId((err, id) => {
    if (err) {
      return err;
    } else {
      items[id] = text;
      let newFile = path.join(exports.dataDir, `/${id}.txt`);
      fs.writeFile(newFile, text, (err) => {
        if (err) {
          throw ('error writing counter');
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};
function funct(files) {
  items = {};
  files.forEach((file) => {
    file = file.slice(0, -4);
    items[file] = file;
  })
  var data = _.map(items, (text, id) => {
    return { id, text };
  });
  return data;
}

exports.readAll = (callback) => {
  var output;
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('error reading files');
    } else {
      items = {};
      files.forEach((file) => {
        file = file.slice(0, -4);
        items[file] = file;
      });
      var data = _.map(items, (text, id) => {
        let file = path.join(exports.dataDir, `/${id}.txt`);
        return new Promise(function (resolve, reject) {
          fs.readFile(file, 'utf8', (err, text) => {
            if (err) {
              reject(err)
            } else {
              resolve({id, text});
            }
          });
        });
      });
      Promise.all(data).then((values) => {
        callback(null, values);
      })
    }
  });
};

exports.readOne = (id, callback) => {
  // var text = items[id];
  // if (!text) {
  // } else {
  let file = path.join(exports.dataDir, `/${id}.txt`);
  fs.readFile(file, 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
      // throw ('Error reading file')
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, file) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
      // throw ('Error reading file')
    } else {
      let local = path.join(exports.dataDir, `/${id}.txt`);
      fs.writeFile(local, text, (err) => {
        if (err) {
          throw ('Cannot write file');
        } else {
          items[id] = text;
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var socal = path.join(exports.dataDir, `/${id}.txt`);
  fs.unlink(socal, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      delete items[id];
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
