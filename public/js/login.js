$(function() { 
    $.get('getnames', (Data) => {
        var dropdown = $("#dropdown");
        Data.forEach(function(site) {
            dropdown.append($("<option />").val(site.id).text(site.name));
        });
    });

    $("#Monitorpagebutton").click(function(){
        window.location.href = "monitor.html";
    });

    $("#loginButton").click(function() {
        let email = $("#emailInput").val();
        let password = $("#passwordInput").val();

        let data = {
            email: email,
            password: password, 
            site: $("#dropdown").val()
        };

        $.post("/api/login", data, (res) => {
            if (res.success) {
                window.location.href = res.url;
            }
            else {
                $("body").replaceWith("Error logging in.");
            }
        });
    });
});
