"use strict"

document.getElementById('copy_result').onclick = copyResultTable

async function copyResultTable() {
    const table = document.getElementById('result_table')
    const tsv  = tableToTSV(table)

    try {
        await navigator.clipboard.writeText(tsv)
        flashCopyButton('Скопировано!')
    } catch {
        fallbackCopy(tsv)
        flashCopyButton('Скопировано!')
    }
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
        rows.push(cells.join('\t'))
    }

    return rows.join('\n')
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