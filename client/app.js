const SERVER_URL = 'http://192.168.43.143:5000';
// const SERVER_URL = 'http://127.0.0.1:5000';

const validPeople = ['jarvin', 'yustynn']

const [jarvinEl, yustynnEl] = validPeople.map(name => document.querySelectorAll(`.${name}`)[0])
const [jarvinAmt, yustynnAmt] = validPeople.map(name => document.querySelectorAll(`.${name} .amount`)[0])

let currPerson = null;

const deselctionMap = {
    jarvin: yustynnEl,
    yustynn: jarvinEl
}

const selectionMap = {
    jarvin: jarvinEl,
    yustynn: yustynnEl
}

async function setPerson() {
    const person = await fetch(`${SERVER_URL}/person`).then(r => r.text());
    console.log(person)

    if (validPeople.includes(person)) {
        const [toSelect, toDeselect] = [selectionMap, deselctionMap].map(map => map[person])

        toSelect.classList.remove('inactive')
        toDeselect.classList.add('inactive')

        currPerson = person;
    }

    return setPerson()
}


async function updateAmount() {
    console.log('updating amount...')
    const update = (cansTaken, deductEl, resetEl) => {
        if (!isNaN(cansTaken)) {
            deductEl.innerText = `${100 - cansTaken}.00`
            resetEl.innerText = '100.00'
        }
    }

    if (currPerson) {
        const cansTaken = +(await fetch(`${SERVER_URL}/cans`).then(r => r.text()))

        if (currPerson == 'jarvin') update(cansTaken, jarvinAmt, yustynnAmt);
        else update(cansTaken, yustynnAmt, jarvinAmt);
    }

    return setTimeout(updateAmount, 100)
}

setPerson()
updateAmount()
