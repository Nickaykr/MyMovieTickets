document.addEventListener('DOMContentLoaded', async () => {
    const popularMoviesTableBody = document.querySelector('#popularMoviesTable tbody');
    const popularMoviesContainer = document.getElementById('popular');
    const ctx = document.getElementById('myChart');

    async function loadPopularMovies() {
        try {
            const result = await myAPI.GetpopularMovie();

            if (result.success && result.Movies) {
                const movies = result.Movies;
                if (movies.length > 0) {
                    movies.forEach(movie => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${movie.title}</td>
                            <td>${movie.booking_count}</td>
                        `;
                        popularMoviesTableBody.appendChild(row);
                    });
                } else {
                    popularMoviesContainer.textContent = 'Нет данных о популярных фильмах.';
                }
            } else {
                console.error('Ошибка при загрузке популярных фильмов:', result.message);
                popularMoviesContainer.textContent = 'Ошибка при загрузке популярных фильмов.';
            }
        } catch (error) {
            console.error('Ошибка при загрузке популярных фильмов:', error);
            popularMoviesContainer.textContent = 'Ошибка при загрузке популярных фильмов.';
        }
    }

    async function loadTheaterSales() {
        try {
          const result = await myAPI.getSales();
    
          if (result.success && result.theatersSales) {
            const theaterSales = result.theatersSales;
    
            const theaterNames = theaterSales.map(sale => sale.theater_name);
            const totalSales = theaterSales.map(sale => sale.total_sales);
    
            new Chart(ctx, {
                type: 'bar', 
                data: { 
                  labels: theaterNames,
                  datasets: [{
                    label: 'Выручка',
                    data: totalSales, 
                    backgroundColor: [ 
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [ 
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Выручка (руб.)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Кинотеатр'
                      }
                    }
                  }
                }
            });
          } else {
            console.error('Ошибка при загрузке данных о продажах:', result.message);
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных о продажах:', error);
        }
      }
    

    loadPopularMovies();
    loadTheaterSales();  
});