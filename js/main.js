
//   <div class="card mb-3">
//   <div class="card-header bg-pizzkah-dark text-center">Ham Pizza</div>
//   <div class="card-body">
//   <div class="container-fluid">
//   <div class="row">
//   <div class="col-sm-11 pizza text-center m-auto"> 
//   Sauce, Cheese, Ham, Mushroom
//   </div>
//   <div class="col-sm-1 pizza text-center m-auto p-2">
//   <button type="button" class="btn btn-pizzkah">+</button>
//   </div>
//   </div>
//   </div>
//   </div>
//   <div class="card-footer bg-pizzkah-light" style="height: 5px"></div>
//   </div>

var pizzaList = [];
var pizzaArrayId = 0;

var orderList = [];


$(document).ready(() => {
    fetchPizzas();
})

function handleAddPizza(event) {
    let name = event.target.name;


    let pizza = pizzaList[parseInt(name)];
    let found = false;

    orderList.forEach(item => {
        
        if(item.name === pizza.name) {
            item.count++;
            found = true;
        }
        console.log(item);
    });

    if(!found) {
        let newItem = {
            name: pizza.name,
            count: 1,
            price: pizza.price,
            id: pizza.id,
        };

        orderList.push(newItem);
    }

    refreshOrderItems();

    

}

function handleDeleteOrderItem(event) {
    let name = event.target.name.trim('\n');
    console.log(name);

    orderList.forEach((item, index, object) => { 
        console.log(item);
        if(item.name == name) {
            console.log('found');
            item.count--;
            if(item.count == 0) {
                object.splice(index, 1);
            }
        }
    });

    refreshOrderItems();
}

function fetchPizzas() {
    fetch('http://localhost:8081/api/pizza', {
            method: 'get',
            mode: 'cors',
        })
        .then(response => response.json())
        .then(data => {
            data.map(pizza => {
                $('#pizzas').append(buildCard(pizza.name, pizza.price, pizza.ingredients));
                let newPizza = {
                    id: pizza.id,
                    name: pizza.name,
                    price: pizza.price,
                    ingredients: pizza.ingredients,
                };

                pizzaList.push(newPizza);
            });
            console.log(data);
        })
        .catch(err => {
            console.log("Rest data error");
            console.log(err);
    });
}

function handleSubmitOrder() {
    let firstNameInput = $('#firstName').val();
    let lastNameInput = $('#lastName').val();
    let phoneNumberInput = $('#phoneNumber').val();
    let addressInput = $('#address').val();

    if(firstNameInput == '' || lastNameInput == '' || phoneNumberInput == '' || addressInput == '') {
        alert('One of the field is empty');
    } else {
        let newOrder = {
            id: null,
            customerFirstName: firstNameInput,
            customerLastName: lastNameInput,
            date: new Date().toISOString(),
            phoneNumber: phoneNumberInput,
            address: addressInput,
            done: false,
            orderDataList: orderList.map(order => {
                return ({
                    id: null,
                    pizza: {
                        id: order.id,
                    }
                })
            })
        };

        fetch('http://localhost:8081/api/order', {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(newOrder),
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .then(response => console.log('Success:', JSON.stringify(response)))
        .catch(error => console.error('Error:', error));   

        $('#orderModal').modal('toggle'); 

    }


}




function buildCard(name, price, ingredients) {
    console.log(arguments);
    let cardTemplate = [
        '<div class="card mb-3">',
            '<div class="card-header bg-pizzkah-dark text-center">', name, '-', price, '</div>',
            '<div class="card-body">',
                '<div class="container-fluid">',
                    '<div class="row">',
                        '<div class="col-sm-11 pizza text-center m-auto">',
                            ingredients,
                        '</div>',
                        '<div class="col-sm-1 pizza text-center m-auto p-2">',
                            '<button type="button" class="btn btn-pizzkah" name="', pizzaArrayId, '" onclick="handleAddPizza(event)">+</button>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="card-footer bg-pizzkah-light" style="height: 5px"></div>',
        '</div>'
    ];
    pizzaArrayId++;
    let object = $(cardTemplate.join('\n'));

    return object;
}

function buildOrderItem(name, count) {
    let orderTemplate = [
        '<tr>',
            '<td>', name, '</td>',
            '<td>', count, '</td>',
            '<td><button type="button" class="btn btn-pizzkah" name="', name, '" onclick="handleDeleteOrderItem(event)">-</button></td>',
        '</td>'
    ];

    let object = $(orderTemplate.join('\n'));

    return object;
}

function refreshOrderItems() {
    console.log(orderList);
    $('#order').empty();

    orderList.map(item => {
        let newItem = buildOrderItem(item.name, item.count);
        $('#order').append(newItem);
    });

    let price = 0;

    orderList.forEach(item => price += item.price * item.count);

    $('#price').empty();
    $('#submitButton').empty();
    
    if(price > 0) {
        let button = '<button type="button" class="btn btn-pizzkah" data-toggle="modal" data-target="#orderModal">Submit</button>';
        $('#price').append('Price: ' + price);
        $('#submitButton').append(button);

    }

}