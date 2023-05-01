// DOMs elements
const bottom_div = document.querySelector('.bottom_div');
const homeBtn = document.querySelector('.bottom-home');
const downloadPageBtn = document.querySelector('.bottom-download');
const done = document.querySelector('.done');
const infos_section = document.querySelector('.infos-section');

const imageLink = "https://image.tmdb.org/t/p/original"

const website_ip = "http://192.168.1.119/"
const backend_ip = "http://192.168.1.119:2999/"
const backend_ip_home = "http://192.168.1.119:3000/"

// Scroll func
window.addEventListener('scroll', () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;;
    const bottomPos = Math.round(y / 2);
    
    bottom_div.style.transform = `translateY(${bottomPos}px)`
})

// Bottom redirect btn
homeBtn.addEventListener('click', () => {
    window.location.href = website_ip + 'Code/home.html';
});
downloadPageBtn.addEventListener('click', () => {
    window.location.href = website_ip + 'Code/download.html';
});

// Fetching torrents datas

function fetchData() {
    return fetch(backend_ip + 'torrent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(datas => {
        return datas;
    })
}

function sendAction(route, hash) {
    fetch(backend_ip + route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({hash}),
    })
}

function deleteTorrent(hash) {
    return fetch(backend_ip_home + 'delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({hash}),
    })
}

function getPoster(query) {
    return fetch(backend_ip + 'poster', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({query}),
    })
    .then(response => response.json())
    .then(image => {
        return image;
    })
}

fetchData()
.then(infos => {
    for (let i = 0; i < infos.length; i++) {
        // Create elements
        const single_div = document.createElement('div');
        single_div.className = "single-download-div";
                
        const bg_img = document.createElement('img');
        bg_img.className = "bg-download-img";

        const title = document.createElement('h3');
        
        let name = infos[i].torrent_name
        if (name.startsWith("[")) {
            // Supprimer le contenu à l'intérieur du premier crochet et le premier crochet lui-même
            name = name.replace(/^\[[^\]]*\]/, "");
        }                      
        if (name.length > 17) {
            name = name.slice(0, 17);
        }
        
        getPoster(name).then(image => {
            bg_img.src = image;
        })
        
        const p_infos = document.createElement('p');
        p_infos.className = "download-infos";

        const progress_bar = document.createElement('div');
        const progress_done = document.createElement('div');
        progress_bar.className = "progress-bar";
        progress_done.className = "progress-bar done";

        // Adding element to page
        infos_section.appendChild(single_div);
        single_div.appendChild(bg_img);
        single_div.appendChild(title);
        single_div.appendChild(p_infos);
        single_div.appendChild(progress_bar);
        single_div.appendChild(progress_done);

        let boucle = setInterval(() => {
            fetchData()
            .then(infos => {
                infos.forEach(info => {
                    let name = infos[i].torrent_name;
                    if (name.startsWith("[")) {
                        // Supprimer le contenu à l'intérieur du premier crochet et le premier crochet lui-même
                        name = name.replace(/^\[[^\]]*\]/, "");
                    }                      
                    if (name.length > 24) {
                        name = name.slice(0, 24) + "...";
                    }
                
                    const speed = infos[i].speed;
                    const completed = infos[i].completed;
                    const hours = infos[i].eta.h;
                    const mins = infos[i].eta.m;
                    const state = infos[i].state

                    if (state === "downloading") {
                        single_div.addEventListener('click', () => {
                            single_div.className = "single-download-div border-active";
                            sendAction('pause', infos[i].hash);
                            window.location.reload();
                        });

                        title.textContent = name;
                        if (hours != 0) {
                            p_infos.textContent = `${hours} Hrs / ${mins} Mins - ${speed} Mio/s`
                        } else {
                            p_infos.textContent = `${mins} Mins - ${speed} Mio/s`
                        }
                        progress_done.style.width = (completed * 0.85) + "%";

                        single_div.addEventListener('touchstart', () => {
                            // Start the timer when the user touches the element
                            let timer = setTimeout(() => {
                                let p = 0;
                                let delete_timer = setInterval(() => {
                                    p++;
                                    progress_done.style.width = p + "%";
                                    title.textContent = "DELETING";
                                    p_infos.textContent = name;
                                    clearInterval(boucle);
                                    
                                    if(p === 85) {
                                        clearInterval(delete_timer);
                                        let hash = infos[i].hash
                                        deleteTorrent(hash);
                                        window.location.reload();
                                    }
                                }, 30)
                                
                                single_div.addEventListener('touchend', () => {
                                    window.location.reload();
                                });
                            }, 1500);
                        });
                    } else if (state === "stalledDL"){
                        title.textContent = name;
                        p_infos.textContent = `BLOQUÉ`
                        progress_done.style.width = (completed * 0.85) + "%";
                        bg_img.style.opacity = "20%"

                    } else {
                        clearInterval(boucle);
                        single_div.addEventListener('click', () => {
                            single_div.className = "single-download-div border-active";
                            sendAction('resume', infos[i].hash)
                            window.location.reload();
                        });

                        title.textContent = name;
                        p_infos.textContent = `PAUSED`
                        progress_done.style.width = (completed * 0.85) + "%";
                        bg_img.style.opacity = "20%"

                        single_div.addEventListener('touchstart', () => {
                            // Start the timer when the user touches the element
                            let timer = setTimeout(() => {
                                let p = 0;
                                let delete_timer = setInterval(() => {
                                    p++;
                                    progress_done.style.width = p + "%";
                                    title.textContent = "DELETING";
                                    p_infos.textContent = name;
                                    
                                    if(p === 85) {
                                        clearInterval(delete_timer);
                                        let hash = infos[i].hash
                                        deleteTorrent(hash);
                                        window.location.reload();
                                    }
                                }, 30)
                                
                                single_div.addEventListener('touchend', () => {
                                    window.location.reload();
                                });
                            }, 1500);
                        });
                          
                    }
                });
            })    
        }, 1500);   
        
    }
})