const COPY_BUTTON = document.getElementById("copy_result")
COPY_BUTTON.onclick = copyResultTable

async function copyResultTable() {
    const table = document.getElementById("result_table")

    // 1. Клонируем, чтобы не трогать оригинал
    const clone = table.cloneNode(true)

    // 2. Применяем шрифт 10px ко всей таблице
    clone.style.fontSize = "10px"
    clone.style.borderCollapse = "collapse"

    // 3. Проставляем границы и паддинги — иначе в Word/Excel вставится "голая" таблица
    clone.querySelectorAll("th, td").forEach(cell => {
        cell.style.border = "1px solid #000"
        cell.style.padding = "2px 4px"
        cell.style.fontSize = "10px"
    })

    // 4. Собираем HTML + plain-text fallback
    const html = clone.outerHTML
    const text = table.innerText

    // 5. Копируем
    try {
        if (navigator.clipboard && window.ClipboardItem) {
            // Современный путь: копируем и HTML, и текст
            const item = new ClipboardItem({
                "text/html":  new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([text], { type: "text/plain" }),
            })
            await navigator.clipboard.write([item])
        } else if (navigator.clipboard) {
            // Fallback: только текст
            await navigator.clipboard.writeText(text)
        } else {
            // Совсем старый браузер — через execCommand
            legacyCopy(html)
        }
    } catch (e) {
        console.warn("Clipboard API failed, falling back:", e)
        legacyCopy(html)
    }
}

// Резервный способ через скрытый contenteditable + execCommand
function legacyCopy(html) {
    const container = document.createElement("div")
    container.contentEditable = "true"
    container.style.position = "fixed"
    container.style.left = "-9999px"
    container.innerHTML = html
    document.body.append(container)

    const range = document.createRange()
    range.selectNodeContents(container)

    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    try {
        document.execCommand("copy")
    } finally {
        selection.removeAllRanges()
        container.remove()
    }
}