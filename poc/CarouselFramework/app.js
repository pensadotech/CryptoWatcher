$('.carousel').carousel({
    interval: false
});

function myFunction() {
    document.getElementById("demo").innerHTML = "testing";
}

function dFunction() {
    document.getElementById("date").innerHTML = Date();
}

function pasteName() {

    (function () {
        var cors_api_host = 'cors-anywhere.herokuapp.com';
        var cors_api_url = 'https://' + cors_api_host + '/';
        var slice = [].slice;
        var origin = window.location.protocol + '//' + window.location.host;
        var open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var args = slice.call(arguments);
            var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
            if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
                targetOrigin[1] !== cors_api_host) {
                args[1] = cors_api_url + args[1];
            }
            return open.apply(this, args);
        };
    })();

    event.preventDefault();
    var cryptoname = $('#crypto-name').val().trim();
    var coinnumber = $('#coin-number').val().trim();

   
    var totalholding = 0.0;
    var a = 0;
    function myholdings(holding) {
        totalholding = parseFloat(totalholding) + parseFloat(holding);
        console.log(totalholding);
        return totalholding;
    }


    $.get('https://api.binance.com/api/v1/ticker/24hr')
        .then(function (response) {
            console.log(response);
            var btcprice = response[11].lastPrice
            response.forEach(Mname => {
                if (Mname.symbol === cryptoname) {
                    var dollarprice = parseFloat(Mname.lastPrice) * parseFloat(btcprice);
                    var holding = parseFloat(coinnumber) * parseFloat(dollarprice);
                    a = myholdings(holding);
                    $('#total-holding').append(`${a}`)
                    $('.marketTable2').append(
                        `
                        <tr>    
                            <td>${Mname.symbol}</td>
                            <td>${holding.toString()}</td>
                            <td>${Mname.lastPrice}</td>
                            <td>${dollarprice.toString()}</td>
                            <td>${Mname.priceChangePercent}</td>
                            <td><button class="edit-btn">Edit</button></td>
                            <td><button class="remove-btn">Remove</button></td>
                        <tr>
                `
                    )
                }
            })

        })
}

$('.marketTable2').on('click', '.remove-btn', function () {
    // $('#')
    console.log($(this).parent().parent().remove())
})

function searchPage() {
    $("#carouselExampleIndicators").carousel(2);
}



Collapse 