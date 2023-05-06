const express = require('express');
const bodyParser = require('body-parser');
const api = require('qbittorrent-api-v2')
const cors = require('cors');
const { MovieDb } = require('moviedb-promise');

const moviedb = new MovieDb('KEY')
const imageLink = "https://image.tmdb.org/t/p/original"

const findMovie = async (title) => {
    try{
        const res = await moviedb.searchTv(title);
        const query_img = await imageLink + res.results[0].poster_path;
        return query_img;
    } catch(e) {
        try{
            const res = await moviedb.searchMovie(title);
            const query_img = await imageLink + res.results[0].poster_path;
            return query_img;
        } catch(e) {
            const query_img = await "src/chain.jpg";
            return query_img;
        }
    }
}
 
api.connect('http://192.168.1.157:8080/', 'admin', 'adminadmin')
    .then(qbt => {
        const app = express();
        app.use(bodyParser.json());
        app.use(cors())

        console.log("qBittorrent running...");
        app.post('/torrent', (req, res) => {
            qbt.torrents().then(torrents => {
                let array = [];

                if(torrents.length != 0) {
                    torrents.forEach(torrent => {                  
                        const percentage = ((torrent.completed / torrent.size) * 100).toFixed(1);
                        const dlSpeed = (torrent.dlspeed / (1024 * 1024)).toFixed(1);
        
                        const eta =  torrent.eta
                        const hours = Math.floor(eta / 3600);
                        const minutes = Math.floor(eta / 60);
        
                        array.push({
                            'torrent_name': torrent.name,
                            'speed': dlSpeed,
                            "completed": percentage,
                            "eta": {
                                "h": hours, 
                                "m": minutes
                            },
                            "state": torrent.state,
                            "hash": torrent.hash
                        })
                    });
                    res.send(array);
                }
            })
        });

        app.post('/pause', (req, res) => {
            let hash = req.body.hash
            
            qbt.pauseTorrents(hash);
        });

        app.post('/resume', (req, res) => {
            let hash = req.body.hash
            
            qbt.resumeTorrents(hash);
        });

        app.post('/poster', (req, res) => {
            let query = req.body.query
            
            findMovie(query).then(image => {
                res.send(JSON.stringify(image))
            })
        });

        app.listen(2999, () => {
            console.log(`Server listening on port 2999`);
        });
    })
    .catch(err => {
        console.error(err)
    })
