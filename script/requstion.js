document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('loginButton'); 
    const usernameInput = document.getElementById('username');
    const usernLastnameInput = document.getElementById('usernLastname');
    const emailInput = document.getElementById('email');
    const numberInput = document.getElementById('number');
    const dateBirthInput = document.getElementById('dateBirth');
    const passwordInput = document.getElementById('password');
    const povtorPasswordInput = document.getElementById('PovtorPassword'); 
  
    registerButton.addEventListener('click', async () => {
      const username = usernameInput.value;
      const usernLastname = usernLastnameInput.value;
      const email = emailInput.value;
      const number = numberInput.value;
      const dateBirth = dateBirthInput.value;
      const password = passwordInput.value;
      const povtorPassword = povtorPasswordInput.value;
  
      if (!username || !usernLastname || !email || !number || !dateBirth || !password || !povtorPassword) {
        showMessage('Пожалуйста, заполните все поля.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Неверный формат email.');
            return ;
        }
  
      if (password !== povtorPassword) {
        showMessage('Пароли не совпадают.');
        return;
      }
  
      if (password.length < 8) {
        showMessage('Пароль должен содержать не менее 8 символов.');
        return;
      }
  
      // Сбор данных пользователя в объект
      const userData = {
        username,
        usernLastname,
        email,
        number,
        dateBirth,
        password,
      };
  
      try {
        const result = await myAPI.register(userData); // Вызываем функцию регистрации
        showMessage(result.message); // Отображаем сообщение
        if (result.success) {
            // Перенаправление на страницу входа или другую страницу
            window.location.href = 'account.html'; 
        }
  
      } catch (error) {
        showMessage('Ошибка регистрации. Пожалуйста, попробуйте позже.');
        console.error('Registration error:', error);
      }
    });
  
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