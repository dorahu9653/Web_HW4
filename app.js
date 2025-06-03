var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'db', 'sqlite.db');

// 開啟資料庫（若不存在則自動建立）
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('無法開啟資料庫:', err.message);
    } else {
        console.log('成功開啟資料庫:', dbPath);
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// /api/quotes 路由，查詢 house_prices 所有資料
app.get('/api/quotes', (req, res) => {
    const { year, month } = req.query;
    const conditions = [];
    const params = [];

    if (year) {
        conditions.push('year = ?');
        params.push(year);
    }
    if (month) {
        conditions.push('month = ?');
        params.push(month);
    }

    let sql = 'SELECT * FROM house_prices';
    if (conditions.length) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY id ASC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: '查詢失敗', details: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 刪除指定 id 的房價資料
app.delete('/api/quotes/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM house_prices WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: '刪除失敗', details: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '找不到資料' });
        }
        res.json({ message: '刪除成功' });
    });
});

// /api/insert 路由，新增一筆房價資料
app.post('/api/quotes', (req, res) => {
    const { year, month, price } = req.body;
    if (!year || !month || !price) {
        return res.status(400).json({ error: '缺少必要欄位' });
    }

    db.run('INSERT INTO house_prices (year, month, price) VALUES (?, ?, ?)', [year, month, price], function(err) {
        if (err) {
            return res.status(500).json({ error: '新增失敗', details: err.message });
        }
        res.json({ message: '新增成功', id: this.lastID });
    });
});


module.exports = app;
