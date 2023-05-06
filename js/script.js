// DOMs elements
const home_page = document.querySelector('.home-page')
const search_page = document.querySelector('.search-page')

const homeBtn = document.querySelectorAll('.bottom-home');
const downloadPageBtn = document.querySelectorAll('.bottom-download');
const bottom_div = document.querySelectorAll('.bottom-div')

const searchbar_home = document.querySelector("#searchbar-home");
const searchbar_result = document.querySelector("#searchbar-result");

const anime_btn = document.querySelector('#anime-btn');
const movie_btn = document.querySelector('#movie-btn');

const imageLink = "https://image.tmdb.org/t/p/original"

const website_ip = "http://192.168.1.119:5500/"
const backend_ip = "http://192.168.1.119:3000/"

search_page.style.display = "none";

let gender_state = "anime";

movie_btn.addEventListener('click', () => {
    gender_state = "movie";

    // Styles
    anime_btn.classList.remove("active");
    movie_btn.classList.add("active");

    sendInfosFromResult(searchbar_result.value, "movie");
})

anime_btn.addEventListener('click', () => {
    gender_state = "anime";

    // Styles
    movie_btn.classList.remove("active");
    anime_btn.classList.add("active");

    sendInfosFromResult(searchbar_result.value, "query");
})

searchbar_home.addEventListener('change', () => {
    // Send query to backend
    sendInfos(searchbar_home.value, "query");
});
searchbar_result.addEventListener('change', () => {
    if (gender_state === "anime") {
        sendInfosFromResult(searchbar_result.value, "query");
    } else {
        sendInfosFromResult(searchbar_result.value, "movie");
    }
});

homeBtn.forEach(element => {
    element.addEventListener('click', () => {
        window.location.href = website_ip + 'Code/home.html';
    });
});
downloadPageBtn.forEach(element => {
    element.addEventListener('click', () => {
        window.location.href = website_ip + 'Code/download.html';
    });
});

fetch(backend_ip + 'recommended', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(datas => {
    const swiper_wrapper = document.querySelector('.swiper-wrapper');

    // Create recommendation elements

    datas.forEach(data => {
        const div = document.createElement('div');
        div.className = "swiper-slide";
        swiper_wrapper.appendChild(div);

        const img = document.createElement('img');
        img.className = "recommended-img";
        img.src = imageLink + data.poster;
        div.appendChild(img);

        const divTitle = document.createElement('div');
        divTitle.className = "div-title-recommended";
        div.appendChild(divTitle);

        const title = document.createElement('h2');
        title.textContent = data.torrent_name
        const genre = document.createElement('h3');
        genre.textContent = "Serie"

        divTitle.appendChild(title);
        div.appendChild(genre);

        img.addEventListener('click', () => {
            query = title.textContent;
            searchbar_home.value = query
            sendInfos(query, "query");
        })
    });

})

function sendInfos(query, route) {
    fetch(backend_ip + route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(datas => {
        // Show the search page and hide the home
        home_page.style.display = "none";
        search_page.style.display = "block";
        
        // Put the query on the top searchbar
        searchbar_result.value = searchbar_home.value;

        datas.forEach(data => {
            createNewResult(data.torrent_size, data.seeds, data.torrent_name, data.poster, data.magnet);
        });
    })
}

function sendInfosFromResult(query, route) {
    fetch(backend_ip + route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(datas => {
        removeOldResults();

        datas.forEach(data => {
            createNewResult(data.torrent_size, data.seeds, data.torrent_name, data.poster, data.magnet);
        });
    })
}

function sendAction(route, magnet) {
    fetch(backend_ip + route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ magnet })
    })
}

function createNewResult(size, seeds, torrent_name, poster, magnet) {
    const search_page = document.querySelector('.search-page');

    // Create elements
    let result_div = document.createElement('div');
    result_div.className = "result-div";
    search_page.appendChild(result_div);

    let torrent_infos = document.createElement('div');
    torrent_infos.className = "torrent-infos";
    result_div.appendChild(torrent_infos);

    let torrent_info_p = document.createElement('p');
    torrent_info_p.className = "torrent-info-p";
    torrent_info_p.textContent = `${size} - ${seeds} seeds`
    torrent_infos.appendChild(torrent_info_p);

    let download_btn_div = document.createElement('div');
    download_btn_div.className = "download-btn-div";
    result_div.appendChild(download_btn_div);
    
    let download_btn = document.createElement('button');
    download_btn.innerText = "DOWNLOAD";
    download_btn.className = "download-btn";
    download_btn_div.appendChild(download_btn);

    let torrent_title = document.createElement('p');
    torrent_title.className = "torrent-title-p";
    torrent_title.textContent = torrent_name;

    torrent_infos.appendChild(torrent_title);
    
    if (torrent_title.textContent.length >= 100) {
        torrent_title.textContent = torrent_title.textContent.slice(0, 100);
    }

    let img = document.createElement('img');
    img.src = poster;
    img.className = "bg-torrent-result";
    result_div.appendChild(img);

    if (img.src === website_ip +  "Code/undefined") {
        img.src = website_ip + "/Code/src/chain.jpg"
    } else if (img.src === imageLink + "null") {
        img.src = website_ip + "/Code/src/chain.jpg"
    }

    // trigger elements
    download_btn.addEventListener('click', () => {
        sendAction("start", magnet);
        window.location.href = "download.html"
    })

    result_div.addEventListener('touchstart', () => {
        // Start the timer when the user touches the element
        timer = setTimeout(() => {
            download_btn.className = "fade-element download-btn";
            torrent_info_p.className = "fade-element torrent-info-p";
            torrent_title.className = "fadein-element torrent-title-p";
            img.style.opacity = "60%";
        
        }, 1000);
    });
      
    result_div.addEventListener('touchend', () => {
        // Clear the timer
        clearTimeout(timer);
        download_btn.className = "fadein-element download-btn";
        torrent_info_p.className = "fadein-element torrent-info-p";
        torrent_title.className = "fade-element torrent-title-p";
        img.style.opacity = "40%";
    });
};

function removeOldResults() {
    const search_page = document.querySelector('.search-page');
    const result_div = document.querySelectorAll('.result-div');

    result_div.forEach(element => {
        search_page.removeChild(element);
    });
}

// Swiper code 
var swiper = new Swiper(".mySwiper", {
    spaceBetween: 0,
});

// Scroll func

window.addEventListener('scroll', () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;;
    const bottomPos = Math.round(y / 3)

    bottom_div.forEach(div => {
        
        div.style.transform = `translateY(${bottomPos}px)`
    });
})