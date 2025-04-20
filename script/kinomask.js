document.addEventListener('DOMContentLoaded', () => {
    const theaterContainer = document.querySelector('.poster-theatrs'); 
    const hallsContainer = document.getElementById('Halls');

    function displayHalls(Halls) {
        hallsContainer.innerHTML = ''; 
        console.log(Halls)
        console.log(typeof Halls);
        if (Halls && Halls.length > 0) {
            Halls.forEach(Halls=> {
                const hallDiv = document.createElement('div');
                hallDiv.classList.add('hall');

                const hallNumber = document.createElement('p');
                hallNumber.textContent = `Номер зала: ${Halls.hall_number}`;
                hallDiv.appendChild(hallNumber);

                const capacity = document.createElement('p');
                capacity.textContent = `Вместимость: ${Halls.capacity}`;
                hallDiv.appendChild(capacity);

                const screenType = document.createElement('p');
                screenType.textContent = `Тип экрана: ${Halls.screen_type}`;
                hallDiv.appendChild(screenType);

                hallsContainer.appendChild(hallDiv);
            });
        } else {
            hallsContainer.textContent = "Залы не найдены.";
        }
    }
   
    myAPI.getTheatersByID(1)
        .then((result) => {
            if (result && result.success) {
                const NameElement = theaterContainer.querySelector('#theatr_name');
                const CityElement = theaterContainer.querySelector('#theatr_city');
                const AddressElement = theaterContainer.querySelector('#theatr_address');
                const StateElement = theaterContainer.querySelector('#theatr_state');

                NameElement.textContent = result.name;
                CityElement.textContent = result.city;
                AddressElement.textContent = result.address;
                StateElement.textContent = result.state;

            } else {
                console.log("Ошибка доступа к бд или нет данных:", result ? result.message : 'неизвестная ошибка');
                const NameElement = theaterContainer.querySelector('#theatr_name');
                const CityElement = theaterContainer.querySelector('#theatr_city');
                const AddressElement = theaterContainer.querySelector('#theatr_address');
                const StateElement = theaterContainer.querySelector('#theatr_state');

                NameElement.textContent = "Нет данных";
                CityElement.textContent = "Нет данных";
                AddressElement.textContent = "Нет данных";
                StateElement.textContent = "Нет данных";
            }
        })
        .catch(error => {
            console.error('Error fetching:', error);
            const NameElement = theaterContainer.querySelector('#theatr_name');
            const CityElement = theaterContainer.querySelector('#theatr_city');
            const AddressElement = theaterContainer.querySelector('#theatr_address');
            const StateElement = theaterContainer.querySelector('#theatr_state');

            NameElement.textContent = "Ошибка загрузки";
            CityElement.textContent = "Ошибка загрузки";
            AddressElement.textContent = "Ошибка загрузки";
            StateElement.textContent = "Ошибка загрузки";
        });

        myAPI.getHalls(1)
        .then((result) => {
            if (result && result.success) {
                console.log(result.halls)
                displayHalls(result.halls); 
            } else {
                console.log("Ошибка при загрузке залов:", result ? result.message : 'неизвестная ошибка');
                hallsContainer.textContent = "Ошибка при загрузке залов.";
            }
        })
        .catch(error => {
            console.error('Error fetching halls:', error);
            hallsContainer.textContent = "Ошибка загрузки залов";
        });
});