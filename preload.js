const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  doSomething: (message) => ipcRenderer.invoke('my-invoke', message),
  getMovies: () => ipcRenderer.invoke('get-movies'),
  getMoviesGenres: (movieId) => ipcRenderer.invoke('get-movie-genres', movieId),
  getTheatrs: () => ipcRenderer.invoke('get-theatrs'),
  getMoviesNow: () => ipcRenderer.invoke('get-nov-movies'),
  getMoviesID: (movieId) => ipcRenderer.invoke('get-movie-id', movieId),
  getNameRoles: (role_name, movieId) => ipcRenderer.invoke('get-movie-people', role_name, movieId),
  getNameRolesActor: (role_name, movieId) => ipcRenderer.invoke('get-movie-people-actor', role_name, movieId),
  register: (userData) => ipcRenderer.invoke('register', userData),
  showMessage: (options) => ipcRenderer.invoke('show-message-box', options),
  login: (email, password) => ipcRenderer.invoke('login', email, password),
  onLoginSuccess: (callback) => ipcRenderer.on('login-success', callback),
  saveSession: (data) => ipcRenderer.invoke('save-session', data),
  getSession: () => ipcRenderer.invoke('get-session'),
  clearSession: () => ipcRenderer.invoke('clear-session'),
  getStates: () => ipcRenderer.invoke('get-states'),
  getCities: (state) => ipcRenderer.invoke('get-cities', state),
  getTheatersByCity: (city) => ipcRenderer.invoke('get-theaters-by-city', city),
  getShowtimes: (nameTeatrs, moveId) => ipcRenderer.invoke('get-showtimes', nameTeatrs, moveId),
  getAvailableSeats: (hallNumber, showtimeId) => ipcRenderer.invoke('getAvailableSeats', hallNumber, showtimeId),
  booking: (bookdata) => ipcRenderer.invoke('book-seats', bookdata),
  NowBooking: (userId) => ipcRenderer.invoke('getBookings', userId),
  AllBoking: (userId) => ipcRenderer.invoke('getAllBookings', userId),
  cancelledBooking: (userId) => ipcRenderer.invoke('getCancelledBookings', userId),
  GetpopularMovie: () => ipcRenderer.invoke('getPopularMovies'),
  getSales: () => ipcRenderer.invoke('getSales'),
  getMoviesGenreOne: (genreName) => ipcRenderer.invoke('get-movies-genres-one', genreName),
  getTheatersByID: (Id) => ipcRenderer.invoke('get-theatr-id', Id),
  getHalls: (Id) => ipcRenderer.invoke('get-movie-halls', Id),
});