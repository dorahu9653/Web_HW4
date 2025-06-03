async function loadQuotes() {
    try {
        const res = await fetch('/api/quotes');
        const data = await res.json();
        const tbody = document.querySelector('#quotes-table tbody');
        tbody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id}</td>
                <td>${row.year}</td>
                <td>${row.month}</td>
                <td>${Number(row.price).toLocaleString()}</td>
                <td><button class="delete-btn" data-id="${row.id}">刪除</button></td>
            `;
            tbody.appendChild(tr);
        });
        bindDeleteEvents();
    } catch (err) {
        const tbody = document.querySelector('#quotes-table tbody');
        tbody.innerHTML = `<tr><td colspan="4">❌ 載入失敗</td></tr>`;
    }
}

document.getElementById('insert-form').addEventListener('submit', async function () {
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const price = parseInt(document.getElementById('price').value);
    const msgP = document.getElementById('insert-msg');

    try {
        const res = await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year, month, price })
        });

        if (!res.ok) throw new Error('新增失敗');

        const result = await res.json();
        msgP.textContent = '✅ 新增成功';
        msgP.style.color = 'green';

        document.getElementById('insert-form').reset();
        loadQuotes();
    } catch (err) {
        msgP.textContent = '❌ 新增失敗，請確認資料格式';
        msgP.style.color = 'red';
    }
});

// 搜尋房價資料
document.getElementById('search-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const year = document.getElementById('search-year').value.trim();
    const month = document.getElementById('search-month').value.trim();

    let query = [];
    if (year) query.push(`year=${parseInt(year)}`);
    if (month) query.push(`month=${parseInt(month)}`);
    const queryString = query.length ? '?' + query.join('&') : '';

    try {
        const res = await fetch('/api/quotes' + queryString);
        if (!res.ok) throw new Error('查詢失敗');
        const data = await res.json();
        const tbody = document.querySelector('#quotes-table tbody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">⚠️ 無符合資料</td></tr>';
        } else {
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.year}</td>
                    <td>${row.month}</td>
                    <td>${Number(row.price).toLocaleString()}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        alert('❌ 搜尋失敗，請稍後再試');
        console.error(err);
    }
});

// 重置搜尋
document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('search-form').reset();
    loadQuotes(); // 重新載入全部資料
});

function bindDeleteEvents() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm(`確定要刪除編號 #${id} 的資料嗎？`)) return;

            try {
                const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
                const result = await res.json();

                if (!res.ok) throw new Error(result.error || '刪除失敗');

                alert('✅ 刪除成功');
                loadQuotes();
            } catch (err) {
                alert('❌ 刪除失敗');
            }
        });
    });
}

loadQuotes();
