document.addEventListener('DOMContentLoaded', async () => {
    const loginButton = document.getElementById('loginButton');
    const loginInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.querySelector('.login-form');
    const accountInfо = document.getElementById('accountInfo');
    const userName = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutButton');
    const loginPhotos = document.querySelectorAll('.photo');
    const content = document.getElementById('content');
    const userTel = document.getElementById('tel');
    const userByrd = document.getElementById('daybutr');

    const monthNames = [
      "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
      "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"
    ];

    myAPI.onLoginSuccess(async (event, data) => {
      await myAPI.saveSession(data);
      showAccountInfo(data.firstName, data.lastName, data.Telephon, data.dateBirth); 
    });

    const sessionData = await myAPI.getSession();
    if (sessionData) {
      showAccountInfo(sessionData.firstName, sessionData.lastName, sessionData.Telephon, sessionData.dateBirth); 
    }

    function showAccountInfo(firstNname,lastName,Tel,Day) {
      loginForm.style.display = 'none';
      accountInfо.style.display = 'block';
      content.style.display = 'block';
      content.style.marginLeft = '10%';
      loginPhotos.forEach(photo => { 
        photo.style.display = 'none';
      });
      userName.textContent = `${firstNname} ${lastName}`;
      userTel.textContent = `${Tel}`;

      if (Day) {
        const date = new Date(Day);
        const day = date.getDate(); 
        const monthIndex = date.getMonth(); 
        const year = date.getFullYear(); 
  
        const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`; 
        userByrd.textContent = formattedDate; 
      } else {
        userByrd.textContent = 'Не указана'; 
      }
    }
   

    loginButton.addEventListener('click', async () => {
        const email = loginInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage('Пожалуйста, введите почту и пароль.');
            return;
        }

        try {
            const result = await myAPI.login(email, password); 
      
            showMessage(result.message); 
      
            if (result.success) {
              loginInput.value = '';
              passwordInput.value = '';
              showAccountInfo(result.firstName, result.lastName, result.Telephon, result.dateBirth)
            }
        } catch (error) {
            showMessage('Ошибка при входе. Пожалуйста, попробуйте позже.');
            console.error('Login error:', error);
        }        
    });

    logoutButton.addEventListener('click', () => {
      myAPI.clearSession();
      loginForm.style.display = 'block';
      accountInfо.style.display = 'none';
      content.style.display = 'flex';
      loginPhotos.forEach(photo => { 
        photo.style.display = 'block';
      });
     
    })

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
});
