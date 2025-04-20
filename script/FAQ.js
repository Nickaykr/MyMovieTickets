document.addEventListener('DOMContentLoaded', function() {
    const categoryQuestionList = document.getElementById('category-queation');
    const listItems = categoryQuestionList.querySelectorAll('li');
  
    listItems.forEach(item => {
      const link = item.querySelector('a');
      const questionDiv = item.querySelector('.question');
  
      link.addEventListener('click', function(event) {
  
        // Закрываем все другие открытые разделы
        listItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherQuestionDiv = otherItem.querySelector('.question');
            otherQuestionDiv.style.display = 'none';
          }
        });
  
        // Переключаем видимость текущего раздела
        if (questionDiv.style.display === 'none') {
          questionDiv.style.display = 'block';
        } else {
          questionDiv.style.display = 'none';
        }
      });
    });
  });
  