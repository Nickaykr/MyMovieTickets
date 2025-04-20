document.addEventListener('DOMContentLoaded', () => {
    myAPI.getTheatrs()
        .then(({ theatrsName, theatrsCity, theatrsAddress}) => {
            const posterContainers = document.querySelectorAll('.poster-theatrs'); 

            if (theatrsName && theatrsName.length > 0){ 
                posterContainers.forEach((container, index) => {
                    if(index < theatrsName.length){
                        const NameElement = container.querySelector('#theatr_name');
                        const CityElement = container.querySelector('#theatr_city');
                        const AddressElement = container.querySelector('#theatr_address');

                        NameElement.textContent = theatrsName[index];
                        CityElement.textContent = theatrsCity[index];
                        AddressElement.textContent = theatrsAddress[index];

                    } else {
                        const NameElement = container.querySelector('#theatr_name');
                        const CityElement = container.querySelector('#theatr_city');
                        const AddressElement = container.querySelector('#theatr_address');

                        NameElement.textContent = ""; 
                        CityElement.textContent = "";
                        AddressElement.textContent = "";
                    }
                })
            } else {
                console.log("Ошибка доступа к бд или нет данных.");
                posterContainers.forEach(container => {
                    const NameElement = container.querySelector('#theatr_name');
                    const CityElement = container.querySelector('#theatr_city');
                    const AddressElement = container.querySelector('#theatr_address');
                  
                    NameElement.textContent = "Нет данных"; 
                    CityElement.textContent = "Нет данных";
                    AddressElement.textContent = "Нет данных";
                });
            }
        })
        .catch(error => {
            console.error('Error fetching:', error);
            posterContainers.forEach(container => {
              const NameElement = container.querySelector('#theatr_name');
              const CityElement = container.querySelector('#theatr_city');
              const AddressElement = container.querySelector('#theatr_address');
              
                NameElement.textContent = "Ошибка загрузки"; 
                CityElement.textContent = "Ошибка загрузки";
                AddressElement.textContent = "Ошибка загрузки";
            });
        }) 
});