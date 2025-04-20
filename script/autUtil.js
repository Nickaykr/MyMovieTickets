export async function checkAuth() {
  try {
    const sessionData = await myAPI.getSession();
    if (sessionData && sessionData.ID) {
      return sessionData.ID;
    } else {
      await showAuthMessage(); 
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении данных сессии:', error);
    await showAuthMessage();ъ
    return null;
  }
}

async function showAuthMessage() {
  const options = {
    type: 'info',
    buttons: ['ОК'],
    defaultId: 0,
    title: 'Требуется авторизация',
    message: 'Для продолжения необходимо пройти авторизацию.',
  };

  try {
    await myAPI.showMessage(options); 
    window.location.href = './account.html';
  } catch (error) {
    console.error('Ошибка при отображении сообщения:', error);
    alert('Для продолжения необходимо пройти авторизацию.'); 
  }
}

export default checkAuth;