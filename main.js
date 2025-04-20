import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path, { join } from 'path'; 
import sqlite3Module from 'sqlite3'; 
import bcrypt from 'bcrypt';
import { promisify } from 'util'; 
import Store from 'electron-store'; 
import {fileURLToPath} from 'url'; 
import fs from 'fs';

const store = new Store();  
const sqlite3 = sqlite3Module.verbose();
const hash = promisify(bcrypt.hash); 
const compare = promisify(bcrypt.compare)


const __filename = fileURLToPath(import.meta.url);
const __dirname = join(path.dirname(__filename));

let db;


async function initializeDatabase() {

  db = new sqlite3.Database('kinobilet.db', (err) => {
    if (err) {
      console.error("Ошибка при открытии базы данных:", err.message);
      app.quit(); 
    }
    
  });
}

async function createWindow() {
  const preloadPath = join(__dirname, 'preload.js');

  if (!fs.existsSync(preloadPath)) {
      console.error("Ошибка: Файл preload.js не найден по пути:", preloadPath);
  }

  const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: preloadPath,
          sandbox: true 
      }
  });

  mainWindow.loadFile(join(__dirname, 'index.html'));
}

ipcMain.handle('save-session', async (event, data) => {
  store.set('sessionData', data);
  return true; 
});

ipcMain.handle('get-session', async (event) => {
  return store.get('sessionData'); 
});

ipcMain.handle('clear-session', async (event) => {
  store.delete('sessionData');
  return true;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(options);
  return result;
});

app.whenReady().then(async () => {
  await initializeDatabase(); 
  createWindow();
});

ipcMain.handle('get-movies', async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT movie_id, title, description FROM movies", [], (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        const titles = rows.map(row => row.title);
        const descriptions = rows.map(row => row.description);
        const movie_id = rows.map(row => row.movie_id);
        resolve({ titles, descriptions, movie_id });
      }
    });
  });
});

ipcMain.handle('get-movie-genres', async (event, movieId) => {  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT g.genre_name 
      FROM Genres g 
      JOIN Movie_Genre mg ON g.genre_id = mg.genre_id
      WHERE mg.movie_id = ?
    `;

    db.all(sql, [movieId], (err, rows) => {  
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        const genreNames = rows.map(row => row.genre_name); 
        resolve(genreNames); 
      }
    });
  });
});

ipcMain.handle('get-movie-id', async (event, movieId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT m.title, m.description, m.duration, m.rating, m.Year, m.country
      FROM Movies m
      WHERE movie_id = ?
    `;

    db.all(sql, [movieId], (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        if (rows.length > 0) {
          const movie = rows[0]; 

          resolve({  
            titleMovie: movie.title,
            descriptionMovie: movie.description,
            duration: movie.duration,
            rating: movie.rating,
            year: movie.Year,
            country: movie.country
          });
        } else {
          resolve(null); 
        }
      }
    });
  });
});

ipcMain.handle('get-theatrs', async () => {  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT name, city, address, state 
      from Teatrers 
    `;

    db.all(sql, [], (err, rows) => {  
      if (err) {
        console.error("Error::", err.message);
        reject(err);
      } else {
        const theatrsName = rows.map(row => row.name);
        const theatrsCity = rows.map(row => row.city);
        const theatrsAddress = rows.map(row => row.address);
        const theatrsState = rows.map(row => row.state);
        resolve({ theatrsName, theatrsCity, theatrsAddress, theatrsState}); 
      }
    });
  });
});

ipcMain.handle('get-nov-movies', async () => {  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT m.movie_id , m.title , m.description 
      FROM Movies m 
      join Showtimes s ON s.movie_id = m.movie_id
      where strftime('%m', s.start_time) = '04'
    `;

    db.all(sql, [], (err, rows) => {  
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        const titleMovie = rows.map(row => row.title);
        const descriptionMovie = rows.map(row => row.description);
        const movie_id = rows.map(row => row.movie_id);
        resolve({ titleMovie, descriptionMovie, movie_id}); 
      }
    });
  });
});

ipcMain.handle('get-movie-people', async (event, roleName, movieId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.first_name, p.last_name
      From People p 
      join MovieCrew mc ON mc.person_id = p.person_id
      join CrewRoles cr ON mc.role_id = cr.role_id
      WHERE cr.role_name = ? AND mc.movie_id = ?
    `;

    db.all(sql, [roleName, movieId], (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        // Преобразуем каждую строку в "имя фамилия"
        const formattedNames = rows.map(row => {
          if (row.first_name && row.last_name) {
            return `${row.first_name} ${row.last_name}`;
          } else {
            return null; 
          }
        });

        // Фильтруем null значения и объединяем через запятую
        const validNames = formattedNames.filter(name => name !== null);
        resolve(validNames.join(', ')); 
      }
    });
  });
});

ipcMain.handle('get-movie-people-actor', async (event, roleName, movieId) => {
  return new Promise((resolve, reject) => {
    const sql = `
       SELECT p.first_name, p.last_name, mc.character_name
      FROM People p
      JOIN MovieCrew mc ON mc.person_id = p.person_id
      JOIN CrewRoles cr ON mc.role_id = cr.role_id
      WHERE cr.role_name = ? AND mc.movie_id = ?
    `;

    db.all(sql, [roleName, movieId], (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        const formattedNames = rows.map(row => {
          let nameString = '';

          if (row.character_name) {
            nameString += `${row.character_name} - `; 
          }

          if (row.first_name && row.last_name ) {
            nameString += `${row.first_name} ${row.last_name}`;
          } 

          return nameString.trim();
        });

        resolve(formattedNames.join('<br>'));
      }
    });
  });
});


ipcMain.handle('register', async (event, userData) => {
  return new Promise((resolve, reject) => {

    hash(userData.password, 10, (err, hash) => {
      if (err) {
        console.error('Ошибка при хэшировании пароля:', err.message);
        return resolve({ success: false, message: 'Ошибка при регистрации.' });
      }

      db.run(`
       INSERT INTO users (first_name, last_name, email, phone_number, date_of_birth, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userData.username, userData.usernLastname, userData.email, userData.number, userData.dateBirth, hash], function(err) {
        if (err) {
          console.error('Ошибка при добавлении пользователя:', err.message);
          if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return resolve({ success: false, message: 'Этот email уже зарегистрирован.' });
          }
          return resolve({ success: false, message: 'Ошибка при регистрации.' });
        }

        console.log(`Пользователь ${userData.username} успешно зарегистрирован.`);
        return resolve({ success: true, message: 'Регистрация прошла успешно.' });
      });
    });
  });
});

const bcryptCompare = promisify(compare);

ipcMain.handle('login', async (event, email, password) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get(`
              SELECT * FROM users WHERE email = ?
              `, [email], (err, row) => {

                if (err) {
                  console.error('Ошибка при запросе пользователя:', err.message);
                  return reject({ success: false, message: 'Ошибка сервера.' });
                }
                resolve(row);
              });
    });

    if (!row) {
      console.log('Неверная почта');
      return { success: false, message: 'Неверная почта.' };
    }

    const result = await bcryptCompare(password, row.password);

    if (result === true) {
      const sessionData = {
        loggedIn: true,
        ID: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        Telephon: row.phone_number,
        dateBirth: row.date_of_birth
      };

      store.set('sessionData', sessionData); // Сохраняем sessionData
      return {
        success: true,
        message: 'Успешный вход!',
        ...sessionData
    };
    } else {
      return { success: false, message: 'Неверный пароль.' };
    }
  } catch (error) {
    console.error('Ошибка при входе:', error.message);
    return { success: false, message: 'Ошибка сервера.' };
  }
});

ipcMain.handle('get-states', async (event) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT DISTINCT state FROM Teatrers', (err, rows) => {
      if (err) {
        console.error('Ошибка при запросе областей:', err.message);
        reject({ success: false, message: 'Ошибка сервера.' });
      } else {
        resolve({ success: true, states: rows });
      }
    });
  });
});

ipcMain.handle('get-cities', async (event, state) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT DISTINCT city FROM Teatrers WHERE state = ?', [state], (err, rows) => {
      if (err) {
        console.error('Ошибка при запросе городов:', err.message);
        reject({ success: false, message: 'Ошибка сервера.' });
      } else {
        resolve({ success: true, cities: rows });
      }
    });
  });
});

ipcMain.handle('get-theaters-by-city', async (event, city) => {
  return new Promise((resolve, reject) => {
    db.all(`select t.name, t.city, t.address, t.state
            From Teatrers t 
            WHERE city = ?`, [city], (err, rows) => {
      if (err) {
        console.error('Ошибка при запросе :', err.message);
        reject({ success: false, message: 'Ошибка сервера.' });
      } else {
        resolve({ success: true,  theaters: rows });
      }
    });
  });
});

ipcMain.handle('get-showtimes', async (event, nameTeatrs, movieId) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT h.hall_number, s.start_time, s.price, s.showtime_id
            FROM Showtimes s 
            JOIN Halls h ON h.hall_id = s.hall_id
            JOIN Teatrers t ON t.theater_id = h.theater_id
            WHERE t.name = ? AND s.movie_id = ?
            `, [nameTeatrs, movieId], (err, rows) => {
      if (err) {
        console.error('Ошибка при запросе :', err.message);
        reject({ success: false, message: 'Ошибка сервера.' });
      } else {
        resolve({ success: true,  showtimes: rows });
      }
    });
  });
});

ipcMain.handle('getAvailableSeats', async (event, hallNumber, showtimeId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
            s.row_number,
            s.seat_number,
            s.seat_type,
            s.price_multiplier
        FROM
            Seats s
        JOIN
            Halls h ON h.hall_id = s.hall_id
        JOIN
            Showtimes s2 ON s.hall_id = s2.hall_id
        LEFT JOIN
            BookedSeats bs ON s.seat_id = bs.seat_id 
        LEFT JOIN
            Bookings b ON bs.booking_id = b.booking_id
        WHERE
            h.hall_number = ?
            AND s2.showtime_id = ?
            AND bs.seat_id IS NULL`,
      [hallNumber, showtimeId],
      (err, rows) => {
        if (err) {
          console.error('Ошибка при запросе доступных мест:', err.message);
          reject({ success: false, message: 'Ошибка сервера.' });
        } else {
          resolve({ success: true, seats: rows });
        }
      }
    );
  });
});

async function bookSeats(bookingData) {
  return new Promise((resolve, reject) => {
    db.serialize(() => { 
      db.run('BEGIN TRANSACTION;'); 
 
      const { userId, showtimeId, seats, totalPrice} = bookingData; 

      db.run(
        `INSERT INTO Bookings (user_id, showtime_id, booking_date, total_price, booking_status)
         VALUES (?, ?, DATETIME('now'), ?, 'подтверждено')`,
        [userId, showtimeId, totalPrice], 
        function (err) {
          if (err) {
            db.run('ROLLBACK;');
            console.error('Ошибка при добавлении бронирования:', err.message);
            return reject({ success: false, message: 'Ошибка при добавлении бронирования.' });
          }

          db.get('SELECT last_insert_rowid() AS bookingId', (err, row) => {
            if (err) {
              db.run('ROLLBACK;');
              console.error('Ошибка при получении ID бронирования:', err.message);
              return reject({ success: false, message: 'Ошибка при получении ID бронирования.' });
            }

            const bookingId = row.bookingId;

            const insertStmt = db.prepare(
              `INSERT INTO BookedSeats (booking_id, seat_id, seat_price) VALUES (?, ?, ?)`
            );

            seats.forEach(seat => {
              insertStmt.run(bookingId, seat.seatId, seat.seat_price, function (err) {  // Adjust seat object keys
                if (err) {
                  db.run('ROLLBACK;');
                  console.error('Ошибка при добавлении забронированного места:', err.message);
                  return reject({ success: false, message: 'Ошибка при добавлении забронированного места.' });
                }
              });
            });

            insertStmt.finalize(err => {
              if (err) {
                db.run('ROLLBACK;');
                console.error('Ошибка при завершении statement:', err.message);
                return reject({ success: false, message: 'Ошибка при завершении statement.' });
              }

              db.run('COMMIT;', err => {
                if (err) {
                  db.run('ROLLBACK;');
                  console.error('Ошибка при подтверждении транзакции:', err.message);
                  return reject({ success: false, message: 'Ошибка при подтверждении транзакции.' });
                }

                resolve({ success: true, message: 'Бронирование успешно оформлено.' });
              });
            });
          });
        }
      );
    });
  });
}

ipcMain.handle('book-seats', async (event, bookingData) => {
  try{
    const result = await bookSeats(bookingData);
    return result;
  } catch(error) {
    return { success: false, message: error.message };
  }

});

ipcMain.handle('getBookings', async (event, userID) => {
  return new Promise((resolve, reject) => {
    db.all(
          `SELECT b.booking_id, b.showtime_id, b.booking_date, b.total_price, b.booking_status, st.start_time, m.title AS movie_title,
            t.name AS theater_name
          FROM Bookings b
          JOIN Showtimes st ON b.showtime_id = st.showtime_id
          JOIN Movies m ON st.movie_id = m.movie_id
          JOIN Halls h ON st.hall_id = h.hall_id
          JOIN Teatrers t  ON h.theater_id = t.theater_id
          WHERE b.user_id = ? AND st.start_time > DATETIME('now')  
          ORDER BY st.start_time ASC `, [userID], (err, rows) => {
        if (err) {
          console.error('Ошибка при запросе доступных мест:', err.message);
          reject({ success: false, message: 'Ошибка сервера.' });
        } else {
          resolve({ success: true, bookings: rows });
        }
      }
    );
  });
});

ipcMain.handle('getAllBookings', async (event, userID) => {
  return new Promise((resolve, reject) => {
    db.all(
          `SELECT b.booking_id, b.showtime_id, b.booking_date, b.total_price, b.booking_status, st.start_time, m.title AS movie_title,
            t.name AS theater_name
          FROM Bookings b
          JOIN Showtimes st ON b.showtime_id = st.showtime_id
          JOIN Movies m ON st.movie_id = m.movie_id
          JOIN Halls h ON st.hall_id = h.hall_id
          JOIN Teatrers t  ON h.theater_id = t.theater_id
          WHERE b.user_id = ?   
          ORDER BY st.start_time ASC `, [userID], (err, rows) => {
        if (err) {
          console.error('Ошибка при запросе доступных мест:', err.message);
          reject({ success: false, message: 'Ошибка сервера.' });
        } else {
          resolve({ success: true, Allbookings: rows });
        }
      }
    );
  });
});

ipcMain.handle('getCancelledBookings', async (event, userID) => {
  return new Promise((resolve, reject) => {
    db.all(
          `SELECT b.booking_id, b.showtime_id, b.booking_date, b.total_price, b.booking_status, st.start_time, m.title AS movie_title,
            t.name AS theater_name
          FROM Bookings b
          JOIN Showtimes st ON b.showtime_id = st.showtime_id
          JOIN Movies m ON st.movie_id = m.movie_id
          JOIN Halls h ON st.hall_id = h.hall_id
          JOIN Teatrers t  ON h.theater_id = t.theater_id
          WHERE b.user_id = ? and b.booking_status = 'отменено'
          ORDER BY st.start_time ASC `, [userID], (err, rows) => {
        if (err) {
          console.error('Ошибка при запросе доступных мест:', err.message);
          reject({ success: false, message: 'Ошибка сервера.' });
        } else {
          resolve({ success: true, Сancelledbookings: rows });
        }
      }
    );
  });
});

ipcMain.handle('getPopularMovies', async (event) => {
  return new Promise((resolve, reject) => {
    db.all(
          `SELECT m.movie_id,m.title, COUNT(b.booking_id) AS booking_count
            FROM Movies m
            JOIN Showtimes st ON m.movie_id = st.movie_id
            JOIN Bookings b ON st.showtime_id = b.showtime_id
            GROUP BY m.movie_id, m.title
            ORDER BY booking_count DESC
            LIMIT 3;  `,  (err, rows) => {
        if (err) {
          console.error('Ошибка при запросе доступных мест:', err.message);
          reject({ success: false, message: 'Ошибка сервера.' });
        } else {
          resolve({ success: true, Movies: rows });
        }
      }
    );
  });
});

ipcMain.handle('getSales', async (event) => {
  return new Promise((resolve, reject) => {
    db.all(
          `SELECT t.theater_id, t.name AS theater_name, SUM(b.total_price) AS total_sales
          FROM Teatrers  t
          JOIN Halls h ON t.theater_id = h.theater_id
          JOIN Showtimes st ON h.hall_id = st.hall_id
          JOIN Bookings b ON st.showtime_id = b.showtime_id
          GROUP BY t.theater_id, t.name 
          ORDER BY total_sales DESC `,  (err, rows) => {
        if (err) {
          console.error('Ошибка при запросе доступных мест:', err.message);
          reject({ success: false, message: 'Ошибка сервера.' });
        } else {
          resolve({ success: true, theatersSales: rows });
        }
      }
    );
  });
});

ipcMain.handle('get-movies-genres-one', async (event, genreName) => { 
  return new Promise((resolve, reject) => {
    db.all(`SELECT m.movie_id, m.title, m.description FROM movies m
            Join Movie_Genre mg On mg.movie_id = m.movie_id
            Join Genres g On g.genre_id = mg.genre_id
            Where g.genre_name = ?`, [genreName], (err, rows) => { 
      if (err) {
        console.error("Error:", err.message);
        reject({ success: false, message: 'Ошибка сервера.' }); 
      } else {
        const titles = rows.map(row => row.title);
        const descriptions = rows.map(row => row.description);
        const movie_id = rows.map(row => row.movie_id);
        resolve({ success: true, titles, descriptions, movie_id });
      }
    });
  });
});

ipcMain.handle('get-theatr-id', async (event, Id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT t.name, t.address, t.city, t.state
      FROM Teatrers t
      WHERE t.theater_id = ?
    `;

    db.all(sql, [Id], (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
        reject(err);
      } else {
        if (rows.length > 0) {
          const Theatrs = rows[0];

          resolve({
            success: true,
            name: Theatrs.name,
            address: Theatrs.address,
            city: Theatrs.city,
            state: Theatrs.state,
          });
        } else {
          resolve({ success: false, message: 'Кинотеатр не найден.' }); // Отправляем сообщение об ошибке
        }
      }
    });
  });
});

ipcMain.handle('get-movie-halls', async (event, theaterId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT h.hall_number, h.capacity, h.screen_type 
      FROM Halls h
      JOIN Teatrers  t ON h.theater_id = t.theater_id
      WHERE t.theater_id = ?;
    `;

    db.all(sql, [theaterId], (err, rows) => {
      if (err) {
        console.error("Error:", err.message);
        reject({ success: false, message: 'Ошибка сервера.' });
      } else {
        if (rows.length > 0) {
          const halls = rows.map(row => ({ // Перебираем все строки
            hall_number: row.hall_number,
            capacity: row.capacity,
            screen_type: row.screen_type,
          }));
          resolve({ success: true, halls: halls }); // Возвращаем массив залов
        } else {
          resolve({ success: false, message: 'Залы не найдены.' });
        }
      }
    });
  });
});

app.on('before-quit', () => {
  if (db) {
      db.close((err) => {
          if (err) {
              console.error("Ошибка при закрытии базы данных:", err.message);
          } else {
              console.log('The database connection is closed.');
          }
      });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
  }
});
