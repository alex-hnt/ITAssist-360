$(function() { 
    $.get('getnames', (Data) => {
        var dropdown = $("#dropdown");
        Data.forEach(function(option) {
            dropdown.append($("<option />").val(option).text(option));
        });
    });

    $("#Monitorpagebutton").click(function(){
        window.location.href = "monitor.html";
    });
});
