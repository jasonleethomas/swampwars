import * as express from 'express';
export var index = express.Router();

/* GET home page. */
index.get('/', function(req, res, next) {
  res.render('index', { title: 'SwampWars' });
});
