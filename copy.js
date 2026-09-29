"use strict"

document.getElementById('copy_result').onclick = copyResultTable

async function copyResultTable() {
    const table = document.getElementById('result_table')
    const tsv  = tableToTSV(table)
    const html = tableToHTML(table)

    try {
        const item = new ClipboardItem({
            'text/plain': new Blob([tsv],  { type: 'text/plain' }),
            'text/html':  new Blob([html], { type: 'text/html'  }),
        })
        await navigator.clipboard.write([item])
        flashCopyButton('Скопировано!')
    } catch {
        fallbackCopy(tsv)
        flashCopyButton('Скопировано!')
    }
}

function tableToHTML(table) {
    const clone = table.cloneNode(true)
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))

    // Разворачиваем colspan в отдельные ячейки — чтобы Word не спотыкался
    clone.querySelectorAll('td[colspan], th[colspan]').forEach(cell => {
        const span = +cell.colSpan || 1
        cell.removeAttribute('colspan')
        for (let i = 1; i < span; i++) {
            const empty = document.createElement(cell.tagName.toLowerCase())
            cell.after(empty)
        }
    })

    // Инлайн-стили: рамки и отступы. Word понимает именно это.
    clone.setAttribute("border", "1")
    clone.setAttribute("cellspacing", "0")
    clone.setAttribute("cellpadding", "4")
    clone.style.borderCollapse = "collapse"
    clone.style.fontFamily = "Times New Roman, serif"
    clone.style.fontSize = "11pt"

    clone.querySelectorAll("th, td").forEach(cell => {
        cell.style.border = "1px solid #000"
        cell.style.padding = "4px 6px"
        cell.style.verticalAlign = "middle"
        // Выравнивание как в вашей таблице
        if (cell.classList.contains("name")) {
            cell.style.textAlign = "left"
        } else {
            cell.style.textAlign = "center"
        }
    })

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>${clone.outerHTML}</body>
</html>`
}

function tableToTSV(table) {
    const rows = []

    for (const tr of table.querySelectorAll('tr')) {
        const cells = []
        for (const cell of tr.querySelectorAll('th, td')) {
            const span = +cell.colSpan || 1
            let text = cell.innerText.replace(/\s+/g, ' ').trim()
            text = text.replace(/\t/g, ' ').replace(/\n/g, ' ')
            cells.push(text)
            for (let i = 1; i < span; i++) cells.push('')
        }
        rows.push(cells)
    }

    const max = rows.reduce((m, r) => Math.max(m, r.length), 0)
    for (const r of rows) {
        while (r.length < max) r.push('')
    }

    return rows.map(r => r.join('\t')).join('\n')
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
}

function flashCopyButton(text) {
    const btn = document.getElementById('copy_result')
    if (btn.disabled) return
    const original = btn.dataset.original || btn.innerText
    btn.dataset.original = original
    btn.innerText = text
    btn.disabled = true
    setTimeout(() => {
        btn.innerText = original
        btn.disabled = false
    }, 1200)
}
