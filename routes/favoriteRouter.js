const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            Favorite.populate('user')
            .populate('campsites');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'applicaton/json');
            res.json(favorite);
        } else {
            err = new Error (`Favorite ${req.user._id} not found`);
            err.status = 404;
            return next(err);
        }
    })    
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            for (let i = 0; i < req.body.length; i++) {
                if(favorite.campsites.indexOf(req.body[i]._id) === -1) {
                    favorite.campsites.push(req.body[i]._id)
                }
            }
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'This campsite has been added to your favorites!', favorite: favorite});
            })
            .catch(err => next(err));
        } else {
            Favorite.create({
                campsites: req.body,
                user: req.user._id
            })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'This campsite has been added to your favorites!', favorite: favorite});
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favorite.findOne({user: req.user._id})
    .then(response => {
        if(response) {
            response.remove()
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: "Favorites have been deleted"});            
            })
        }
    })         
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'That campsite is already in the list of favorites!', favorite: favorite});
            } else {
                favorite.campsites.push(req.params.campsiteId)
            }
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'This campsite has been added to your favorites!', favorite: favorite});
            })
            .catch(err => next(err));
        } else {
            Favorite.create({
                campsites: [
                    req.params.campsiteId
                ], 
                user: req.user._id
            })
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Contnet-Type', 'application/json');
                res.json({status: 'This campsite has been added to your favorites!', favorite: campsiteId});
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favorite.findOne({user: req.user._id})
    .then(response => {
        if(response) {
            response.remove()
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({status: 'Favorites have been deleted'})
            })
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;