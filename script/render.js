document.addEventListener('DOMContentLoaded', () => {
  myAPI.getMovies()
    .then(({ titles, descriptions, movie_id}) => {
      const posterContainers = document.querySelectorAll('.poster'); 

      if (titles && titles.length > 0) {
        posterContainers.forEach((container, index) => {
          if (index < titles.length) { 

            const titleElement = container.querySelector('#movieTitle');
            const descriptionElement = container.querySelector('#movieDescription');
            const genresElement = container.querySelector('#genre_movie');
            const movieID = movie_id[index];
            loadMovieGenres(movieID, genresElement)

            titleElement.textContent = titles[index];
            descriptionElement.textContent = descriptions[index];
          } else {
            clearPoster(container);
          }
        });
      } else {
        posterContainers.forEach(container => {
          clearPoster(container, "Фильмы не найдены");
        });
        console.log("No movies found in the database.");
      }
    })
    .catch(error => {
      console.error('Error fetching:', error);
      posterContainers.forEach(container => {
        clearPoster(container, "Ошибка при загрузке фильмов");
      });
    });

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

    function clearPoster(container, message = "") {
      const titleElement = container.querySelector('#movieTitle');
      const descriptionElement = container.querySelector('#movieDescription');
      const genresElement = container.querySelector('#genre_movie');
  
      titleElement.textContent = message;
      descriptionElement.textContent = "";
      genresElement.innerHTML = ""; 
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