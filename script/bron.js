import * as checkAuth from "./autUtil.js";

document.addEventListener('DOMContentLoaded', () => {
    function getQueryParam(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }

    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const TheatrsSelect = document.getElementById('theatrs');
    const showtimesContainer = document.getElementById('showtimes'); 
    const seanceSelect = document.getElementById('seance');
    const movieId = getQueryParam('movieId');
    const rowSelect = document.getElementById('row-select');
    const seatSelect = document.getElementById('seat-select');
    const setDiv = document.getElementById('seat-selection');
    const addSeatButton = document.getElementById('add-seat');
    const selectedSeatsList = document.getElementById('selected-seats');
    const oplataSpan = document.getElementById('oplata');
    const clearSeatsButton = document.getElementById('clear-seats');
    const submitFormButton = document.getElementById('submit-form');

    let showtimePrice = 0; 
    let selectedSeats = []
    let totalPrice = 0;

    async function showMessage(message) {
      const options = {
        type: 'info', 
        buttons: ['ОК'], 
        defaultId: 0, 
        title: 'Сообщение', 
        message: message, 
      };
    
      try {
        await myAPI.showMessage(options);
      } catch (error) {
        console.error('Ошибка при отображении сообщения:', error);
      }
    }

    function populateSelect(selectElement, data, valueKey, textKey) {
      selectElement.innerHTML = '<option value="">Выберите...</option>'; 
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey] || item[valueKey]; 
        selectElement.appendChild(option);
      });
    }

    function resetSelect(selectElement) {
      selectElement.innerHTML = '<option value="">Выберите...</option>';
      selectElement.disabled = true; 
    }

    function resetCityAndBelow() {
      resetSelect(citySelect);
      resetTheatersAndBelow();
    }
  
    function resetTheatersAndBelow() {
      resetSelect(TheatrsSelect);
      
      if (seanceSelect) {
        showtimesContainer.innerHTML = ''; 
      }
      resetSeats();
    }

    function resetSeats(){
      setDiv.style.display = 'none';
      oplataSpan.textContent = ' '; 
      selectedSeatsList.innerHTML = ''; 
    }

    function calculateSeatPrice(showtimePrice, priceMultiplier) {
      return showtimePrice * priceMultiplier;
    }

    function updateTotalPrice() {
      totalPrice = 0; 
      selectedSeats.forEach((seat) => {
        totalPrice += calculateSeatPrice(showtimePrice, seat.price_multiplier);
      });
      oplataSpan.textContent = totalPrice.toFixed(2) + ' руб.';
    }

    async function loadStates() {
      try {
        const result = await myAPI.getStates();
        if (result.success) {
          populateSelect(stateSelect, result.states, 'state'); 
        } else {
          console.error('Ошибка загрузки областей:', result.message);
        }
      } catch (error) {
        console.error('Ошибка при вызове ipcRenderer:', error);
      }
    }

    async function loadCities(state) {
      try {
        const result = await myAPI.getCities(state);
        if (result.success) {
          populateSelect(citySelect, result.cities, 'city');  
        } else {
          console.error('Ошибка загрузки городов:', result.message);
        }
      } catch (error) {
        console.error('Ошибка при вызове ipcRenderer:', error);
      }
    }

    async function loadTheatrs(city) {
      try {
        const result = await myAPI.getTheatersByCity(city);
        if (result.success) {
          populateSelect(TheatrsSelect, result.theaters, 'name', 'name'); 
        } else {
          console.error('Ошибка загрузки кинотеатров:', result.message);
        }
      } catch (error) {
        console.error('Ошибка при вызове API (getTheatersByCity):', error);
      }
    }

    async function loadShowtimes(nameTeatrs, movieId) {
      try {
          const result = await myAPI.getShowtimes(nameTeatrs, movieId);
          if (result.success) {
              const showtimes = result.showtimes;
              showtimesContainer.innerHTML = ''; 
  
              if (showtimes.length > 0) {
                  showtimes.forEach((showtime) => {
                    const card = createShowtimeCard(showtime);
                    showtimesContainer.appendChild(card);
                  });
              } else {
                showtimesContainer.textContent = 'Нет доступных сеансов.';
              }
          } else {
            console.error('Ошибка загрузки сеансов:', result.message);
          }
      } catch (error) {
        console.error('Ошибка при вызове API:', error);
      }
    }

    async function loadAvailableSeats(hallNumber, showtimeId) {
      try {
        const result = await myAPI.getAvailableSeats(hallNumber, showtimeId);
    
        if (result.success) {
          const seats = result.seats;
          populateRowSelect(seats);
        } else {
          console.error('Ошибка загрузки доступных мест:', result.message);
        }
      } catch (error) {
        console.error('Ошибка при вызове API:', error);
      }
    }

    function createShowtimeCard(showtime) {
      const card = document.createElement('div');
      card.classList.add('showtime-card'); 
  
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'selectedShowtime'; 
      radio.value = showtime.showtime_id; 
  
      const label = document.createElement('label');
      label.dataset.showtimeId = showtime.showtime_id; 
      label.dataset.hallNumber = showtime.hall_number;
      label.dataset.price = showtime.price;
  
      const hallInfo = document.createElement('p');
      hallInfo.textContent = `Зал: ${showtime.hall_number}`;
  
      const timeInfo = document.createElement('p');
      timeInfo.textContent = `Время: ${showtime.start_time}`;
  
      const priceInfo = document.createElement('p');
      priceInfo.textContent = `Цена: ${showtime.price} руб.`;
  
      label.appendChild(radio);
      label.appendChild(hallInfo);
      label.appendChild(timeInfo);
      label.appendChild(priceInfo);
      card.appendChild(label);

      card.addEventListener('click', () => {
        radio.checked = true;
      });
  
      return card;
    }

    function populateRowSelect(seats) {
      const uniqueRows = [...new Set(seats.map(seat => seat.row_number))];
    
      rowSelect.innerHTML = '<option value="">Выберите ряд</option>';
    
      uniqueRows.forEach(row => {
        const option = document.createElement('option');
        option.value = row;
        option.textContent = row;
        rowSelect.appendChild(option);
      });
    
      rowSelect.addEventListener('change', () => {
        const selectedRow = rowSelect.value;
        if (selectedRow) {
          populateSeatSelect(seats, selectedRow);
        } else {
          seatSelect.innerHTML = '<option value="">Выберите место</option>';
        }
      });
    }

    function populateSeatSelect(seats, selectedRow) {
      const availableSeatsInRow = seats.filter(seat => seat.row_number == selectedRow);
    
      seatSelect.innerHTML = '<option value="">Выберите место</option>';
    
      availableSeatsInRow.forEach(seat => {
        const option = document.createElement('option');
        option.value = seat.seat_number;
        option.textContent = seat.seat_number + ' (' + seat.seat_type + ')';
        option.dataset.priceMultiplier = seat.price_multiplier;
        seatSelect.appendChild(option);
      });
    }
  

    stateSelect.addEventListener('change', (event) => {
      const selectedState = event.target.value;
      resetCityAndBelow();
      if (selectedState) {
        loadCities(selectedState);
        citySelect.disabled = false;
      } else {
        citySelect.innerHTML = '<option value="">Выберите...</option>'; 
        citySelect.disabled = true;
        TheatrsSelect.innerHTML = '<option value="">Выберите...</option>';
        TheatrsSelect.disabled = true
      }
    });

    citySelect.addEventListener('change', (event) => {
      const selectedCity = event.target.value;
      resetTheatersAndBelow();
      if (selectedCity) {
        loadTheatrs(selectedCity);
        TheatrsSelect.disabled = false;
      } else {
        TheatrsSelect.innerHTML = '<option value="">Выберите...</option>';
        TheatrsSelect.disabled = true
      }
    });

    TheatrsSelect.addEventListener('change', (event) => {
      const selectedTheaterName = event.target.value;
    
      if (selectedTheaterName) {
        loadShowtimes(selectedTheaterName, movieId);
      } else {
        seanceSelect.innerHTML ='';
      }
    });

    showtimesContainer.addEventListener('change', (event) => {
      if (event.target.type === 'radio' && event.target.name === 'selectedShowtime') {
        const selectedLabel = event.target.parentNode; 
    
        const showtimeId = selectedLabel.dataset.showtimeId;
        const hallNumber = selectedLabel.dataset.hallNumber;
        showtimePrice = parseFloat(selectedLabel.dataset.price);
    
        setDiv.style.display = 'block';
        loadAvailableSeats(hallNumber, showtimeId);
      }
      selectedSeats = []; 
      selectedSeatsList.innerHTML = ''; 
      updateTotalPrice()
    });

    addSeatButton.addEventListener('click', () => {
      const selectedRow = rowSelect.value;
      const selectedSeat = seatSelect.value;
    
      if (selectedRow && selectedSeat) {
          const selectedSeatOption = seatSelect.options[seatSelect.selectedIndex]; 
          const priceMultiplier = parseFloat(selectedSeatOption.dataset.priceMultiplier); 
        
          const seat = {
              row: selectedRow,
              seat: selectedSeat,
              price_multiplier: priceMultiplier 
          };
    
          selectedSeats.push(seat);
          const listItem = document.createElement('li');
          listItem.textContent = `Ряд: ${selectedRow}, Место: ${selectedSeat} - ${showtimePrice * priceMultiplier} руб.`; 
          selectedSeatsList.appendChild(listItem);
    
          updateTotalPrice(); 
         
          rowSelect.value = '';
          seatSelect.value = '';
          submitFormButton.style.display = 'block';
      } else {
          alert('Пожалуйста, выберите ряд и место.');
      }
    });

    clearSeatsButton.addEventListener('click', () => {
      selectedSeats = []; 
      totalPrice = 0; 
      selectedSeatsList.innerHTML = ''; 
      submitFormButton.style.display = 'none'
      oplataSpan.textContent = '0.00 руб.'; 
    });


    submitFormButton.addEventListener('click', async () => {
      const userId = await checkAuth.checkAuth();
      const showtimeId = document.querySelector('input[name="selectedShowtime"]:checked')?.value;

      if (!userId) {
        return; 
      }

      const formattedSeats = selectedSeats.map(seat => ({
        seatId: seat.seat, 
        seat_price: showtimePrice * seat.price_multiplier 
      }));

      const bookingData = {
        userId: userId,
        showtimeId: showtimeId,
        seats: formattedSeats,
        movieId: movieId,
        totalPrice: totalPrice,
      };

      try {
        const response = await myAPI.booking(bookingData);

        if (response.success) {
          showMessage('Бронирование прошло успешно!!!');
          resetCityAndBelow();
          selectedSeats = [];
          totalPrice = 0;
          selectedSeatsList.innerHTML = '';
          oplataSpan.textContent = '0.00 руб.';
        } else {
          showMessage(`Ошибка при оформлении брони: ${response.message}`);
          console.error('Ошибка при оформлении брони:', response);
        }
      } catch (error) {
        showMessage('Произошла ошибка при отправке данных.');
        console.error('Ошибка при отправке данных:', error);
      }
    });

    citySelect.disabled = true;   
    TheatrsSelect.disabled = true;
    setDiv.style.display = 'none';
    submitFormButton.style.display = 'none'
    loadStates();
  });