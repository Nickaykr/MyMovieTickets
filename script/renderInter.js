document.addEventListener('DOMContentLoaded', () => {
    myAPI.getMoviesID(1)
        .then(({ titleMovie, descriptionMovie, duration, rating, year, country }) => {
            const text_film= document.querySelector('.text_film'); 
            const info = document.querySelector('#content');


            if (text_film && titleMovie){ 
                const TittleElement = text_film.querySelector('#movieTitle');
                const descriptionElement = info.querySelector('#movieDescription');
                const genresElement = text_film.querySelector('#genre_movie');
                const durationElemnt = text_film.querySelector('#duration_movie');
                const ratingElement = text_film.querySelector('#rating_movie');
                const yearElement = text_film.querySelector('#year_movie');
                const countryElement = text_film.querySelector('#county_movie');

                TittleElement.textContent = titleMovie;
                descriptionElement.textContent = descriptionMovie;
                durationElemnt.textContent = duration;
                ratingElement.textContent = rating;
                yearElement.textContent = year;
                countryElement.textContent = country;
                movieId = 1;
                loadMovieGenres(movieId, genresElement)
            } else {
                console.log("Ошибка доступа к бд или нет данных.");
            }
        })
        .catch(error => {
            console.error('Error fetching:', error);
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

    myAPI.getNameRoles("Режиссёр", 1)
        .then(formattedNames => {
          const infoGruppa= document.querySelector('#content');

          if(infoGruppa && formattedNames){
            const nameElement = infoGruppa.querySelector('#reshisher');

            nameElement.textContent = formattedNames;

          } else{
            console.log("Ошибка: Элемент #content не найден или данные не получены.");
          }
        })
        .catch(error =>{
          console.error("Ошибка при получении данных:", error);
        })

    myAPI.getNameRoles("Сценарист", 1)
        .then(formattedNames => {
          const infoGruppa= document.querySelector('#content');

          if(infoGruppa && formattedNames){
            const nameElement = infoGruppa.querySelector('#shenarist');

            nameElement.textContent = formattedNames;

          } else{
            console.log("Ошибка: Элемент #content не найден или данные не получены.");
          }
        })
        .catch(error =>{
          console.error("Ошибка при получении данных:", error);
        })


    myAPI.getNameRolesActor("Актёр", 1)
      .then(formattedNames => {
        const infoGruppa= document.querySelector('#content');

        if(infoGruppa && formattedNames){
          const nameElement = infoGruppa.querySelector('#roli');

          nameElement.innerHTML= formattedNames;

        } else{
          console.log("Ошибка: Элемент #content не найден или данные не получены.");
        }
      })
      .catch(error =>{
        console.error("Ошибка при получении данных:", error);
      })   
});