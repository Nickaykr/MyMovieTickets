document.addEventListener('DOMContentLoaded', () => {
    myAPI.getMoviesNow()
        .then(({ titleMovie, descriptionMovie, movie_id }) => {
            const posterContainers = document.querySelectorAll('.poster'); 

            if (titleMovie && titleMovie.length > 0){ 
                posterContainers.forEach((container, index) => {
                    if(index < titleMovie.length){
                        const TittleElement = container.querySelector('#movieTitle');
                        const descriptionElement = container.querySelector('#movieDescription');
                        const genresElement = container.querySelector('#genre_movie');
                        const movieID = movie_id[index];

                        TittleElement.textContent = titleMovie[index];
                        descriptionElement.textContent = descriptionMovie[index];
                        loadMovieGenres(movieID, genresElement)

                    } else {
                        const TittleElement = container.querySelector('#movieTitle');
                        const descriptionElement = container.querySelector('#movieDescription');
                        const genresElement = container.querySelector('#genre_movie');
                        
                        TittleElement.textContent = "";
                        descriptionElement.textContent = "";
                        genresElement.innerHTML = "";
                    }
                })
            } else {
                console.log("Ошибка доступа к бд или нет данных.");
                posterContainers.forEach(container => {
                    const TittleElement = container.querySelector('#movieTitle');
                    const descriptionElement = container.querySelector('#movieDescription');
                    const genresElement = container.querySelector('#genre_movie');
                  
                    TittleElement.textContent = "Нет данных"; 
                    descriptionElement.textContent = "Нет данных";
                    genresElement.innerHTML = "";
                });
            }
        })
        .catch(error => {
            console.error('Error fetching:', error);
            posterContainers.forEach(container => {
                const TittleElement = container.querySelector('#movieTitle');
                const descriptionElement = container.querySelector('#movieDescription');
                const genresElement = container.querySelector('#genre_movie');

                TittleElement.textContent = "Ошибка загрузки"; 
                descriptionElement.textContent = "Ошибка загрузки";
                genresElement.innerHTML = "Ошибка загрузки";
            });
        }) 
    
        function loadMovieGenres(movieId, genresElement) {
            myAPI.getMoviesGenres(movieId)
              .then(genres => {
                displayGenres(genres, genresElement); 
              })
              .catch(err => {
                console.error("Ошибка при получении жанров:", err);
                genresElement.textContent = 'Ошибка при загрузке жанров.';
              });
        }

        function displayGenres(genres, genresElement) {
            genresElement.innerHTML = ''; 
      
            if (genres && genres.length > 0) {
              const genreList = document.createElement('ul');
              
              genres.forEach(genre => {
                const listItem = document.createElement('li');
                listItem.textContent = genre;
                genreList.appendChild(listItem);
              });
        
              genresElement.appendChild(genreList);
            } else {
              genresElement.textContent = 'Жанры не найдены.';
            }
        }
});