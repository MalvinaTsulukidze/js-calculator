
window.onload = () => {
  init();
  logic();
};

const init = () => {
  initTemplate();
}

const initTemplate = () => {
  template.forEach(el => render(el));
}


const render = (args) => {
  let element = null;

  try {
    element = document.createElement(args.el);
  } catch {
    throw new Error('Unable to create HTMLElement!');
  }

  if (args.classNames) {
    element.classList.add(...args.classNames.split(' '));
  }
  
  if (args.text !== undefined) {
    element.innerText = `${args.text}`;
  }

  if (args.child && Array.isArray(args.child)) {
    args.child.forEach(child => element.appendChild(render(child)));
  }

  if (args.parent) {
    if (args.parent === 'body') {
      document.body.appendChild(element);
    }
  }

  if (args.dataAttr !== undefined) {
    args.dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === '') {
        element.setAttribute(attrName, '');
      }

      if (attrName.match(/value|id|placeholder|type/)) {
        element.setAttribute(attrName, attrValue);
      } else if (attrValue !== '') {
        element.dataset[attrName] = attrValue;
      }
    })
  }
  return element;
}

let ValueMemory = null;
let NewValue = false;
let OperationMemory = ''
let CleanMemory = false;
let NegativeNumber = false;

const logic = () => {
  const output = document.querySelector('.display__input');
  
  document.querySelector('.wrapper').addEventListener('click', (e) => {
    const item = e.target;

    // number
    if(item.hasAttribute('data-number')) {
      numberInput(item);
    }

    // operation
    if (item.hasAttribute('data-operation')) {
      operation(item);
    }

    // dot
    if (item.getAttribute('data-decimal') === '.') {
      decimal();
    }

    // clear
    if (item.hasAttribute('data-action')) {
      if (item.getAttribute('data-action') === 'partClear') {
        partClear();
      }
      if (item.getAttribute('data-action') === 'clear') {
        fullClear();
      }
      if (item.getAttribute('data-action') === '+/-') {
        negative();
      }
    }

    if (output.value === 'NaN') {
      output.value = 'Error';
    }

  });
}

const numberInput = (item) => {
  const output = document.querySelector('.display__input');
  const operations = [...document.querySelectorAll('.operation')];
  const buttonAc = document.querySelector('.buttons__item-ac');

  if (output.value.length < 13) {
    if (NewValue) {
      output.value = item.getAttribute('data-number');
      NewValue = false;
      operations.forEach(el => {
        el.classList.remove('buttons__item_active-orange');
        el.classList.remove('buttons__item_active-grey');
      });

      buttonAc.setAttribute('data-action', 'partClear');
      buttonAc.innerText = 'C';

      if (NegativeNumber) {
        output.value = item.getAttribute('data-number') * (-1);
        NegativeNumber = false;
      }
    } else {
      if (output.value === '0') {
        output.value = item.getAttribute('data-number');

        buttonAc.setAttribute('data-action', 'partClear');
        buttonAc.innerText = 'C';
        CleanMemory = false;
      } else {
        if (!NegativeNumber) {
          output.value += item.getAttribute('data-number');
        } else {
          output.value = item.getAttribute('data-number') * (-1);
          NegativeNumber = false;
        }
      }
    }
  }
}

const operation = (item) => {
  const output = document.querySelector('.display__input');
  const operations = [...document.querySelectorAll('.operation')];
  let value2 = output.value;

  operations.forEach(el => {
    el.classList.remove('buttons__item_active-orange');
    el.classList.remove('buttons__item_active-grey');
  });

  const grey = item.classList.contains('buttons__item-grey');
  const orange = item.classList.contains('buttons__item-orange');

  if (grey && item.getAttribute('data-operation') !== 'sqrt') {
    item.classList.add('buttons__item_active-grey');
  } else if (orange && item.getAttribute('data-operation') !== '=') {
    item.classList.add('buttons__item_active-orange');
  }
  if (NewValue && OperationMemory !== '=') {
    output.value = ValueMemory;
  } else {
    NewValue = true;
    if (OperationMemory === '+') {
      ValueMemory = Math.round((Number(ValueMemory) + Number(value2)) * 10000) / 10000;
    } else if (OperationMemory === '-') {
      ValueMemory = Math.round((Number(ValueMemory) - Number(value2)) * 10000) / 10000;
    } else if (OperationMemory === '*') {
      ValueMemory = Math.round((Number(ValueMemory) * Number(value2)) * 10000) / 10000;
    } else if (OperationMemory === '/') {
      ValueMemory = Math.round((Number(ValueMemory) / Number(value2)) * 10000) / 10000;
    } else if (OperationMemory === 'sqrt' || item.getAttribute('data-operation') === 'sqrt') {
      if (ValueMemory === null) {
        NewValue = false;
        if (output.value.length >= 13) {
          ValueMemory = Math.round(Math.sqrt(Number(output.value)) * 10**3) / 10**3;
        } else {
          ValueMemory = Math.round(Math.sqrt(Number(output.value)) * 10**6) / 10**6;
        }
      }
    } else if (OperationMemory === 'pow') {
      if (output.value.length >= 13) {
        ValueMemory = Math.round(Math.pow(ValueMemory, value2) * 10**3) / 10**3;
      } else {
        ValueMemory = Math.round(Math.pow(ValueMemory, value2) * 10**6) / 10**6;
      }
    } else {
      ValueMemory = Number(value2);
    }
    output.value = ValueMemory;
    OperationMemory = item.getAttribute('data-operation');
  }
}

const decimal = () => {
  const output = document.querySelector('.display__input');
  let decimalMemory = output.value;

  if (NewValue) {
    decimalMemory = '0.';
    NewValue = false;
  } else {
    if (decimalMemory.indexOf('.') === -1) {
      decimalMemory += '.';
    }
  }

  output.value = decimalMemory;
}

const partClear = () => {
  const output = document.querySelector('.display__input');
  const buttonAc = document.querySelector('.buttons__item-ac');

  output.value = '0';
  NewValue = true;
  buttonAc.innerText = 'AC';
  buttonAc.setAttribute('data-action', 'clear');
  CleanMemory = true;
}

const fullClear = () => {
  const output = document.querySelector('.display__input');
  const operations = [...document.querySelectorAll('.operation')];

  ValueMemory = null;
  NewValue = true;
  OperationMemory = '';
  output.value = '0';
  
  operations.forEach(el => {
    el.classList.remove('buttons__item_active-orange');
    el.classList.remove('buttons__item_active-grey');
  });
}

const negative = () => {
  const output = document.querySelector('.display__input');
  if (output.value !== '0' && !NewValue) {
    output.value = Number(output.value) * (-1);
  } else {
    NegativeNumber = true;
    output.value = '-0';
  }
}

export default logic;


const template = [
  {
    el: 'div',
    classNames: 'wrapper',
    parent: 'body',
    child: [
      {
        el: 'div',
        classNames: 'display',
        child: [
          {
            el: 'input',
            classNames: 'display__input',
            dataAttr: [['type', 'text'], ['value', '0'], ['disabled', '']]
          },
        ]
      },
      {
        el: 'div',
        classNames: 'buttons',
        child: [
          {
            el: 'div',
            classNames: 'buttons__row',
            child: [
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-grey buttons__item-ac',
                text: 'AC',
                dataAttr: [['action', 'clear']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-grey operation',
                text: '√',
                dataAttr: [['operation', 'sqrt']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-grey buttons__item-x operation',
                text: 'x',
                dataAttr: [['operation', 'pow']],
                child: [
                  {
                    el: 'sup',
                    classNames: '',
                    text: 'y'
                  }
                ]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-orange operation',
                text: '÷',
                dataAttr: [['operation', '/']]
              }
            ]
          },
          {
            el: 'div',
            classNames: 'buttons__row',
            child: [
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '7',
                dataAttr: [['number', '7']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '8',
                dataAttr: [['number', '8']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '9',
                dataAttr: [['number', '9']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-orange operation',
                text: 'x',
                dataAttr: [['operation', '*']]
              }
            ]
          },
          {
            el: 'div',
            classNames: 'buttons__row',
            child: [
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '4',
                dataAttr: [['number', '4']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '5',
                dataAttr: [['number', '5']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '6',
                dataAttr: [['number', '6']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-orange operation',
                text: '-',
                dataAttr: [['operation', '-']]
              }
            ]
          },
          {
            el: 'div',
            classNames: 'buttons__row',
            child: [
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '1',
                dataAttr: [['number', '1']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '2',
                dataAttr: [['number', '2']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '3',
                dataAttr: [['number', '3']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-orange operation',
                text: '+',
                dataAttr: [['operation', '+']]
              }
            ]
          },
          {
            el: 'div',
            classNames: 'buttons__row',
            child: [
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '0',
                dataAttr: [['number', '0']]
              },
              {
                el: 'button',
                classNames: 'buttons__item',
                text: '.',
                dataAttr: [['decimal', '.']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-orange',
                text: '+/-',
                dataAttr: [['action', '+/-']]
              },
              {
                el: 'button',
                classNames: 'buttons__item buttons__item-orange',
                text: '=',
                dataAttr: [['operation', '=']]
              }
            ]
          }
        ]
      }
    ]
  }
];