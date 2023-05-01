const express = require('express');
const bodyParser = require('body-parser');
const { qBittorrentClient } = require('@robertklep/qbittorrent');
const cors = require('cors');
const nyaapi = require('nyaapi');
const { MovieDb } = require('moviedb-promise');

const client = new qBittorrentClient("http://192.168.1.175:8080/", 'admin', "adminadmin");
console.log("qBittorrent running...");

const moviedb = new MovieDb('TMDB KEY')
const imageLink = "https://image.tmdb.org/t/p/original"

const app = express();
app.use(bodyParser.json());
app.use(cors());

const findMovie = async (title) => {
    title = title.replace(/(\s)*(4[8-9][0-9]|5[0-9][0-9]|6[0-9][0-9]|7[0-9][0-9]|8[0-9][0-9]|9[0-9][0-9]|1[0-9]{3}|2[0-1][0-9]{2})\s*p(\s)*/gi, "");
    title = title.replace(/(\s)*vostfr(\s)*/i, "");
    title = title.replace(/(\s)*vf(\s)*/i, "");
    title = title.replace(/(\s)*MULTI(\s)*/i, "");

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
            return;
        }
    }
}

app.post('/query', async (req, res) => {
    const query = req.body.query;

    // Search torrent
    nyaapi.si.search(query, n=10)
        .then(results => {
            let array = [];
                findMovie(query)
                .then(image => {
                    results.forEach(data => {
                        array.push({
                            'torrent_name': data.name,
                            'torrent_size': data.filesize,
                            'seeds': data.seeders,
                            'poster': image,
                            'magnet': data.magnet,
                        })
                    });
                    res.send(array);
                })
        })
        .catch(error => {
            console.log(error);
        });
});

app.post('/start', async (req) => {
    let magnet = req.body.magnet;
    await client.torrents.add(magnet);
})

app.post('/delete', async (req) => {
    let hash = req.body.hash;

    await client.torrents.delete(hash, true);
})

app.post('/recommended', async (req, res) => {
    let array = [];

    moviedb.tvTopRated().then(datas => {
        datas.results.forEach(element => {
            if (element.origin_country.includes('JP')) {
                array.push({
                    'torrent_name': element.name,
                    'poster': element.poster_path,
                })
            }
        });
        res.send(array);
    })
})

app.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});