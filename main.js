"use strict"

const INPUT_TABLE = document.getElementById("input_table").querySelector("tbody")
const RESULT_TABLE = document.getElementById("total_line")
const TARGET_INPUT = document.getElementById("target_sum_input")
TARGET_INPUT.oninput = setTargetSum
const ADD_LINE = document.getElementById("add_line")
ADD_LINE.onclick = addLine

document.querySelectorAll('input[name="round"]').forEach(radio => {
    radio.onchange = setRoundStep
})

function setRoundStep(event) {
    roundStep = +event.target.value
    recalculate()
}
function roundTo(value, rate = roundStep) {
    return Math.round(value / rate) * rate
}

let roundStep = 1

let targetSum = 1000

const NDS = 0.2

const RESULT = {
    sum: 0,
    nds: 0,
    total: 0,
    ceils: {
        sum: document.getElementById("total_sum"),
        nds: document.getElementById("total_nds"),
        total: document.getElementById("total_total"),
    }
}

const LINES = []

class Line {
    constructor() {
        const index = LINES.length + 1
        this.name = 'Наименование ' + index
        this.rate = 100
        this.isFixedRate = false
        this.count = 1
        this.price = 0
        this.sum = 0
        this.nds = 0
        this.total = 0

        this.inputLine = document.createElement('tr')
        INPUT_TABLE.append(this.inputLine)

        this.inputCeils = {
            name: document.createElement('input'),
            count: document.createElement('input'),
            rate: document.createElement('input'),
        }

        this.tdRemove = document.createElement('td')
        this.inputLine.append(this.tdRemove)
        this.tdRemove.className = "remove-line"
        this.tdRemove.innerText = "X"
        this.tdRemove.onclick = this.remove.bind(this)

        const tdName = document.createElement('td')
        this.inputLine.append(tdName)
        tdName.append(this.inputCeils.name)
        this.inputCeils.name.type = "text"
        this.inputCeils.name.className = "name"
        this.inputCeils.name.value = this.name
        this.inputCeils.name.oninput = this.setName.bind(this)

        const tdCount = document.createElement('td')
        this.inputLine.append(tdCount)
        tdCount.append(this.inputCeils.count)
        this.inputCeils.count.type = "number"
        this.inputCeils.count.min = "1"
        this.inputCeils.count.step = "1"
        this.inputCeils.count.value = this.count
        this.inputCeils.count.oninput = this.setCount.bind(this)

        const tdRate = document.createElement('td')
        this.inputLine.append(tdRate)
        tdRate.append(this.inputCeils.rate)
        this.inputCeils.rate.type = "number"
        this.inputCeils.rate.min = "0.01"
        this.inputCeils.rate.step = "0.01"
        this.inputCeils.rate.value = this.rate
        this.inputCeils.rate.oninput = this.setRate.bind(this)

        this.tdFix = document.createElement('td')
        this.inputLine.append(this.tdFix)
        this.tdFix.className = "fix-price"
        this.tdFix.innerText = ""
        this.tdFix.onclick = this.setFixed.bind(this)

        this.resultLine = document.createElement('tr')
        RESULT_TABLE.parentNode.insertBefore(this.resultLine, RESULT_TABLE)

        this.resultCeils = {
            index: document.createElement('td'),
            name: document.createElement('td'),
            count: document.createElement('td'),
            price: document.createElement('td'),
            sum: document.createElement('td'),
            nds: document.createElement('td'),
            total: document.createElement('td'),
        }
        this.resultCeils.index.innerText = index
        this.resultLine.append(this.resultCeils.index)
        this.resultCeils.name.innerText = this.name
        this.resultCeils.name.className = "name"
        this.resultLine.append(this.resultCeils.name)
        this.resultCeils.count.innerText = this.count
        this.resultLine.append(this.resultCeils.count)
        this.resultCeils.price.innerText = this.price
        this.resultLine.append(this.resultCeils.price)
        this.resultCeils.sum.innerText = this.sum
        this.resultLine.append(this.resultCeils.sum)

        const resultNdsValue = document.createElement('td')
        resultNdsValue.innerText = NDS * 100 // %
        this.resultLine.append(resultNdsValue)
        
        this.resultCeils.nds.innerText = this.nds
        this.resultLine.append(this.resultCeils.nds)
        this.resultCeils.total.innerText = this.total
        this.resultLine.append(this.resultCeils.total)
    }

    setName(event) {
        this.name = event.target.value

        this.inputCeils.name.value = this.name
        this.resultCeils.name.innerText = this.name
    }

    setCount(event) {
        let value = +event.target.value

        if (isNaN(value) || !isFinite(value) || value < 1) value = 1
        this.count = Math.ceil(value)

        this.inputCeils.count.value = this.count

        recalculate()
    }

    setRate(event) {
        const value = +event.target.value

        const isInvalidData = (isNaN(value) || !isFinite(value) || value < 0.01)
        if (isInvalidData) return this.inputCeils.rate.style.backgroundColor = "#ff7777"

        this.inputCeils.rate.style.backgroundColor = "transparent"
        this.rate = +((Math.ceil(value * 100) / 100).toFixed(2))

        // this.inputCeils.rate.value = this.rate // отключил, чтобы не сработал oninput при вводе "," или "."

        recalculate()
    }

    setFixed() {
        this.isFixedRate = !this.isFixedRate
        this.tdFix.innerText = this.isFixedRate ? "V" : ""

        recalculate()
    }

    remove() {
        if (LINES.length === 1) return

        const isConfirmedRemove = confirm('Вы хотите удалить запись ?')
        if (!isConfirmedRemove) return

        const lineIndex = LINES.indexOf(this)

        this.inputCeils.name.oninput = null
        this.inputCeils.count.oninput = null
        this.inputCeils.rate.oninput = null
        this.tdRemove.onclick = null

        this.inputLine.remove()
        this.inputCeils = null

        this.resultLine.remove()
        this.resultCeils = null

        LINES.splice(lineIndex, 1)

        for(let i = LINES.length - 1; i >= 0; i--) {
            LINES[i].resultCeils.index.innerText = i + 1
        }

        recalculate()
    }
}

function addLine() {
    LINES.push( new Line() )
    recalculate()
}
addLine()

function setTargetSum(event) {
    let value = +event.target.value
    if (isNaN(value) || !isFinite(value) || value < 1) return

    targetSum = Math.ceil(value)

    recalculate()
}

function recalculate() {
    let freeTotalRate = 0   // вес свободных строк: Σ(rate × count)
    let fixedTotal = 0      // сумма с НДС, которую заняли фиксированные строки

    for (let i = LINES.length - 1; i >= 0; i--) {
        const line = LINES[i]
        if (line.isFixedRate) {
            const price = line.rate                       // rate — это уже цена (целое)
            const sum = price * line.count
            const nds = roundTo(sum * NDS, 0.01)
            fixedTotal += sum + nds
        } else {
            freeTotalRate += line.rate * line.count
        }
    }

    // Остаток целевой суммы на свободные строки
    const remainder = targetSum - fixedTotal

    // Цена на единицу коэффициента для свободных строк
    // Если свободных строк нет — priceRate не нужен.
    // Если remainder < 0 — фиксации «съели» больше целевой суммы,
    // свободным ставим цену 0 (и предупредим пользователя ниже).
    let priceRate = 0
    if (freeTotalRate > 0 && remainder > 0) {
        priceRate = (remainder / (1 + NDS)) / freeTotalRate
    }

    RESULT.sum = 0
    RESULT.nds = 0
    RESULT.total = 0

    for (let i = LINES.length - 1; i >= 0; i--) {
        const line = LINES[i]

        if (line.isFixedRate) {
            line.price = roundTo(line.rate)
        } else {
            line.price = roundTo(priceRate * line.rate)
        }

        line.sum   = roundTo(line.price * line.count, 0.01)
        line.nds   = roundTo(line.sum * NDS, 0.01)
        line.total = line.sum + line.nds

        RESULT.sum   += line.sum
        RESULT.nds   += line.nds
        RESULT.total += line.total

        line.resultCeils.count.innerText = line.count
        line.resultCeils.price.innerText = line.price.toFixed(2).replace('.', ',')
        line.resultCeils.sum.innerText   = line.sum.toFixed(2).replace('.', ',')
        line.resultCeils.nds.innerText   = line.nds.toFixed(2).replace('.', ',')
        line.resultCeils.total.innerText = line.total.toFixed(2).replace('.', ',')
    }

    RESULT.ceils.sum.innerText   = RESULT.sum.toFixed(2).replace('.', ',')
    RESULT.ceils.nds.innerText   = RESULT.nds.toFixed(2).replace('.', ',')
    RESULT.ceils.total.innerText = RESULT.total.toFixed(2).replace('.', ',')

    const isMismatch = RESULT.total < targetSum
    TARGET_INPUT.classList.toggle("warn", isMismatch)
}
