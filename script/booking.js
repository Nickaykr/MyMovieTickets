import * as checkAuth from "./autUtil.js";

document.addEventListener('DOMContentLoaded', async () => {
    const upcomingBookingsDiv = document.getElementById('upcoming-bookings');
    const upcomingAllBookingsDiv = document.getElementById('upcoming-all-bookings');
    const upcomingCalledBookingsDiv = document.getElementById('upcoming-Called-bookings');
    const userId = await checkAuth.checkAuth();

    if (!userId) {
        return; 
    }

    const monthNames = [
        "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
        "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
    ];

    function formatDateTime(date) {
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      
        return `${day} ${monthNames[monthIndex]} ${year} ${hours}:${formattedMinutes}`;
    }
       
    async function confirmDelete(itemId) {

      const confirmOptions = {
        type: 'question',
        buttons: ['Да', 'Нет'],
        defaultId: 1,
        title: 'Подтверждение',
        message: 'Вы уверены, что хотите удалить этот элемент?',
      };
    
      try {
        const choice = await myAPI.showMessage(confirmOptions);
    
        if (choice.response === 0) { 
          const requestOptions = {
            type: 'info',
            buttons: ['ОК'],
            defaultId: 0,
            title: 'Сообщение',
            message: 'Запрос на удаление отправлен.',
          };
    
          try {
            await myAPI.showMessage(requestOptions);
          } catch (requestError) {
            console.error('Ошибка при отправке запроса на удаление:', requestError);
          }
        } else { 
          console.log('Удаление отменено.');
        }
      } catch (confirmError) {
        console.error('Ошибка при отображении диалога подтверждения:', confirmError);
      }
    }

    function displayBookings(bookings, Div, containerId) {
      Div.innerHTML = '';
      const container = document.getElementById(containerId);
      const images = container.querySelectorAll('.image');
      let hasBookings = false;
    
      if (bookings && bookings.length > 0) {
        hasBookings = true;

        const bookingsContainer = document.createElement('div');
        bookingsContainer.classList.add('bookings-container');
    
        const firstBookingCard = createBookingCard(bookings[0]);
        bookingsContainer.appendChild(firstBookingCard);
    
        const hiddenBookingsContainer = document.createElement('div');
        hiddenBookingsContainer.classList.add('hidden-bookings-container');
        hiddenBookingsContainer.style.display = 'none'; 
    
        for (let i = 1; i < bookings.length; i++) {
          const bookingCard = createBookingCard(bookings[i]);
          hiddenBookingsContainer.appendChild(bookingCard);
        }
    
        bookingsContainer.appendChild(hiddenBookingsContainer);
    
        if (bookings.length > 1) {
          const toggleButton = document.createElement('button');
          toggleButton.textContent = 'Показать все';
          toggleButton.classList.add('toggle-bookings-button');
    
          let isExpanded = false; 
    
          toggleButton.addEventListener('click', () => {
            if (isExpanded) {
              hiddenBookingsContainer.style.display = 'none';
              toggleButton.textContent = 'Показать все';
            } else {
              hiddenBookingsContainer.style.display = 'block';
              toggleButton.textContent = 'Свернуть';
            }
            isExpanded = !isExpanded; 
          });
    
          bookingsContainer.appendChild(toggleButton);
        }
  
        Div.appendChild(bookingsContainer);
    
      } else {
        Div.textContent = 'Нет  сеансов.';
      }

      images.forEach(image => {
        image.style.display = hasBookings ? 'block' : 'none';
      });
    }

    function createBookingCard(booking) {
      const bookingCard = document.createElement('div');
      bookingCard.classList.add('booking-card');
  
      bookingCard.innerHTML = `
        <h3>${booking.movie_title}</h3>
        <p>Дата бронирования: ${booking.formattedBookingDate}</p>
        <p>Кинотеатр: ${booking.theater_name}</p>
        <p>Время начала: ${booking.formattedStartTime}</p>
        <p>Цена: ${booking.total_price} руб.</p>
        <p>Статус: ${booking.booking_status}</p>
        <button class="cancel-booking" data-booking-id="${booking.booking_id}">Отменить</button>
      `;
  
      return bookingCard;
    }
  
    async function loadBookings() {
      try {
        const result = await myAPI.NowBooking(userId);

        if (result.success) {
            if (result.bookings) {
                result.bookings.forEach(booking => {
                  booking.booking_date = new Date(booking.booking_date);
                  booking.start_time = new Date(booking.start_time);
        
                  booking.formattedBookingDate = formatDateTime(booking.booking_date);
                  booking.formattedStartTime = formatDateTime(booking.start_time);
                });
            }
            displayBookings(result.bookings,upcomingBookingsDiv,"skoro-ticket");
        } else {
            console.error('Ошибка при загрузке бронирований:', result.message);
            upcomingBookingsDiv.textContent = 'Ошибка при загрузке бронирований.';
        }
      } catch (error) {
        console.error('Ошибка при загрузке бронирований:', error);
        upcomingBookingsDiv.textContent = 'Ошибка при загрузке бронирований.';
      }
    }

    async function AllloadBookings() {
      try {
        const result = await myAPI.AllBoking(userId);

        if (result.success) {
            if (result.Allbookings) {
                result.Allbookings.forEach(booking => {
                  booking.booking_date = new Date(booking.booking_date);
                  booking.start_time = new Date(booking.start_time);
        
                  booking.formattedBookingDate = formatDateTime(booking.booking_date);
                  booking.formattedStartTime = formatDateTime(booking.start_time);
                });
            }
            displayBookings(result.Allbookings, upcomingAllBookingsDiv, "histiry");
        } else {
            console.error('Ошибка при загрузке бронирований:', result.message);
            upcomingAllBookingsDiv.textContent = 'Ошибка при загрузке бронирований.';
        }
      } catch (error) {
        console.error('Ошибка при загрузке бронирований:', error);
        upcomingAllBookingsDiv.textContent = 'Ошибка при загрузке бронирований.';
      }
    }

    
    async function CalledloadBookings() {
      try {
        const result = await myAPI.cancelledBooking(userId);

        if (result.success) {
            if (result.Сancelledbookings) {
                result.Сancelledbookings.forEach(booking => {
                  booking.booking_date = new Date(booking.booking_date);
                  booking.start_time = new Date(booking.start_time);
        
                  booking.formattedBookingDate = formatDateTime(booking.booking_date);
                  booking.formattedStartTime = formatDateTime(booking.start_time);
                });
            }
            displayBookings(result.Сancelledbookings, upcomingCalledBookingsDiv,"Vozvrat");
        } else {
            console.error('Ошибка при загрузке бронирований:', result.message);
            upcomingCalledBookingsDiv.textContent = 'Ошибка при загрузке бронирований.';
        }
      } catch (error) {
        console.error('Ошибка при загрузке бронирований:', error);
        upcomingCalledBookingsDiv.textContent = 'Ошибка при загрузке бронирований.';
      }
    }

    document.addEventListener('click', async (event) => {
      if (event.target.classList.contains('cancel-booking')) {
        const itemId = event.target.dataset.itemId;
        await confirmDelete(itemId);
      }
    });

    loadBookings();
    AllloadBookings();
    CalledloadBookings();
});