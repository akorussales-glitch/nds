'use strict'

const COUNT_INPUT = document.getElementById("input_count")
const PRICE_INPUT = document.getElementById("input_final_price")

COUNT_INPUT.oninput = updateCount
PRICE_INPUT.oninput = updatePrice

const TABLE = {
    count: document.getElementById("t-count"),
    price: document.getElementById("t-price"),
    sum: document.getElementById("t-price-for-count"),
    nds: document.getElementById("t-total-nds"),
    total: document.getElementById("t-price_with-nds"),
}

const DATA = {
    count: 1,
    price: 0,
    sum: 0,
    nds: 0,
    total: 0,
}

function updateCount(event) {
    let value = +event.target.value

    if (isNaN(value) || !isFinite(value) || value < 1) value = 1
    value = Math.ceil(value)

    DATA.count = value
    recalculate()
}

function updatePrice(event) {
    let value = +event.target.value

    if (isNaN(value) || !isFinite(value) || value < 1) value = 0
    value = Math.ceil(value)

    DATA.total = value
    recalculate()
}

function recalculate() {
    DATA.price = Math.ceil( (DATA.total / 1.2) / DATA.count)
    DATA.sum = DATA.price * DATA.count
    DATA.nds = DATA.sum * 0.2
    DATA.total = DATA.sum + DATA.nds

    setResult()
}

function setResult() {
    TABLE.count.innerText = DATA.count
    TABLE.price.innerText = DATA.price.toFixed(2).replace('.', ',')
    TABLE.sum.innerText = DATA.sum.toFixed(2).replace('.', ',')
    TABLE.nds.innerText = DATA.nds.toFixed(2).replace('.', ',')
    TABLE.total.innerText = DATA.total.toFixed(2).replace('.', ',')
}
