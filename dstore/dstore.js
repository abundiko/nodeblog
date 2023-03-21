const fs = require('fs');
const uuid = require('uuid');

const DStore = {
  dbPath: './db',
  init: (path) => {
    DStore.dbPath = path;
  },
  getAllDocs: (file) => {
    const filePath = DStore.dbPath + "/" + file;
    let allFiles = [];
    if (fs.existsSync(filePath)) {

      fs.readdirSync(filePath).forEach(item => {
        allFiles.push(item.split('.json')[0]);

      });
      return allFiles;
    }
    else return [];
  },
  getAllDocsWhere: (file, condition) => {
    const filePath = DStore.dbPath + "/" + file;
    let allDocs = [], filteredDocs = [], keys = [];
    for (const key in condition) {
      keys.push(key);
    }
    if (fs.existsSync(filePath)) {

      fs.readdirSync(filePath).forEach(item => {
        allDocs.push(DStore.getDocData(file, item.split('.json')[0]));

      });
      for (let i = 0; i < keys.length; i++) {

        allDocs.forEach(doc => {
          if (doc[keys[i]] == condition[keys[i]]) {
            filteredDocs.push(doc)
          }
        })
      }
      return filteredDocs;
    }
    else return [];
  },
  newDoc: (file, data) => {
    let id = 1;
    const filePath = DStore.dbPath + "/" + file;
    if (fs.existsSync(filePath)) {
      id = fs.readdirSync(filePath).length + 1
    }
    const uid = id + uuid.v4();
    data = JSON.stringify({
      "uid": String(uid),
      ...data
    });
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    fs.writeFile(`${filePath}/${uid}.json`, data, (err) => {
      if (err) {
        console.log('dstore error', err);
        return false
      }
      else return uid;
    });
  },
  getDocData: (file, docId) => {
    const filePath = DStore.dbPath + "/" + file + "/" + docId + '.json';
    if (!fs.existsSync(filePath))
      return false;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  },
  docDataMatches: (file, key, value) => {
    let uid = '', docData;
    const allUsers = DStore.getAllDocs(file);
    for (let i = 0; i < allUsers.length; i++) {
      docData = DStore.getDocData(file, allUsers[i]);
      if (docData[key] == value) {
        uid = docData['uid'];
        break;
      }
    }
    if (uid === '') return false;
    return docData;

  },
  deleteDoc: (file, docId) => {
    const filePath = DStore.dbPath + "/" + file + "/" + docId + '.json';
    fs.unlinkSync(filePath)
  },
  updateDataField: (file, docId, key, value) => {
    const docData = DStore.getDocData(file, docId);
    const filePath = DStore.dbPath + "/" + file + "/" + docId + '.json';
    if (docData) {
      docData[key] = value;
      fs.writeFile(filePath, JSON.stringify(docData), (err) => {
        if (err) {
          console.log('dstore update field error:', err);
          return false
        }
        else return DStore.getDocData(file, docId);
      });
    } else return false;
  }
};

module.exports = DStore;