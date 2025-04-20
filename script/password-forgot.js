const btn = document.getElementById("loginButton");

// При клике на кнопку "Поменять пароль"
btn.onclick = function() {
   showMessage("Пароль сменен");

    setTimeout(function() {
        window.location.href = "../account.html"; // Замените на вашу страницу входа
    }, 3000);
}

async function showMessage(message) {
    const options = {
      type: 'info',
      buttons: ['ОК'],
      defaultId: 0,
      title: 'Сообщение',
      message: message,
    };

    try {
      await window.myAPI.showMessage(options); // Исправлено: добавлено window.
    } catch (error) {
      console.error('Ошибка при отображении сообщения:', error);
    }
  }чё