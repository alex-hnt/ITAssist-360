$(function() { 
    $("#signupButton").on("click", function() {
        let siteName = $("#siteNameInput").val();
        let name = $("#nameInput").val();
        let email = $("#emailInput").val();
        let password = $("#passwordInput").val();

        let data = {
            siteName: siteName,
            name: name,
            email: email,
            password: password 
        };
        console.log("clicked");
        $.post("/api/signup-admin", data, (res) => {
            if (res.success) {
                alert("Success! Welcome to ITAssist 360!");
                window.location.href = res.url;
            }
            else {
                alert("Error signing up.");
            }
        });
    });
});
