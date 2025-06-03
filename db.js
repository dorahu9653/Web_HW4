const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

// 確保 db 目錄存在
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// 開啟資料庫（若不存在則自動建立）
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('無法開啟資料庫:', err.message);
    }
    else {
        console.log('成功開啟資料庫:', dbPath);
        // 檢查並建立 house_prices table
        db.run(`CREATE TABLE IF NOT EXISTS house_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            price INTEGER NOT NULL
        )`, (err) => {
            if (err) {
                console.error('建立 house_prices 資料表失敗:', err.message);
            }
            else {
                console.log('house_prices 資料表已存在或建立成功');
                // 插入資料
                const data = [
                    [2023, 2, 430585], [2023, 3, 428832], [2023, 4, 434596], [2023, 5, 428698],
                    [2023, 6, 435967], [2023, 7, 433540], [2023, 8, 439934], [2023, 9, 450491],
                    [2023, 10, 439426], [2023, 11, 456728], [2023, 12, 457461], [2024, 1, 470378],
                    [2024, 2, 479583], [2024, 3, 474422], [2024, 4, 485060], [2024, 5, 484329],
                    [2024, 6, 499810], [2024, 7, 497007], [2024, 8, 497791], [2024, 9, 493727],
                    [2024, 10, 500500], [2024, 11, 495411], [2024, 12, 501485], [2025, 1, 503719],
                    [2025, 2, 506917]
                ];
                db.all('SELECT COUNT(*) as count FROM house_prices', (err, rows) => {
                    if (!err && rows[0].count === 0) {
                        const stmt = db.prepare('INSERT INTO house_prices (year, month, price) VALUES (?, ?, ?)');
                        data.forEach(([year, month, price]) => {
                            stmt.run(year, month, price);
                        });
                        stmt.finalize();
                        console.log('已插入預設房價資料');
                    }
                });
            }
        });
    }
});

module.exports = db;

