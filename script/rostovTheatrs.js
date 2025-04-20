document.addEventListener('DOMContentLoaded', () => {
    const city = "Ростов-на-Дону"; 
    const theaterContainers = document.querySelectorAll('.poster-theatrs'); 

    myAPI.getTheatersByCity(city)
        .then((result) => {
            if (result && result.success) {
                const theaters = result.theaters;

                if (theaters.length > theaterContainers.length) {
                    console.warn("Количество кинотеатров больше, чем контейнеров для отображения.");
                }

                theaterContainers.forEach((container, index) => {
                    if (index < theaters.length) {
                        const theater = theaters[index];

                        const NameElement = container.querySelector('#theatr_name');
                        const CityElement = container.querySelector('#theatr_city');
                        const AddressElement = container.querySelector('#theatr_address');
                        const StateElement = container.querySelector('#theatr_state');

                        NameElement.textContent = theater.name;
                        CityElement.textContent = theater.city;
                        AddressElement.textContent = theater.address;
                        StateElement.textContent = theater.state;
                    } else {
                        const NameElement = container.querySelector('#theatr_name');
                        const CityElement = container.querySelector('#theatr_city');
                        const AddressElement = container.querySelector('#theatr_address');
                        const StateElement = container.querySelector('#theatr_state');

                        NameElement.textContent = "";
                        CityElement.textContent = "";
                        AddressElement.textContent = "";
                        StateElement.textContent = "";
                    }
                });
            } else {
                console.log("Ошибка при загрузке кинотеатров:", result ? result.message : 'неизвестная ошибка');
                theaterContainers.forEach(container => {
                    const NameElement = container.querySelector('#theatr_name');
                    const CityElement = container.querySelector('#theatr_city');
                    const AddressElement = container.querySelector('#theatr_address');
                    const StateElement = container.querySelector('#theatr_state');

                    NameElement.textContent = "Нет данных";
                    CityElement.textContent = "Нет данных";
                    AddressElement.textContent = "Нет данных";
                    StateElement.textContent = "Нет данных";
                });
            }
        })
        .catch(error => {
            console.error('Error fetching theaters:', error);
            theaterContainers.forEach(container => {
                const NameElement = container.querySelector('#theatr_name');
                const CityElement = container.querySelector('#theatr_city');
                const AddressElement = container.querySelector('#theatr_address');
                const StateElement = container.querySelector('#theatr_state');

                NameElement.textContent = "Ошибка загрузки";
                CityElement.textContent = "Ошибка загрузки";
                AddressElement.textContent = "Ошибка загрузки";
                StateElement.textContent = "Ошибка загрузки";
            });
        });
});