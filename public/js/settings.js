$(function() { 

    $("#changePassword").on("click", function() {
        let password = $("#passwordInput").val();

        $.post("/changePassword", {password: password}, (res) => {
            if (res.success) {
                alert("Password changed successfully.");
            }
            else {
                alert(res.message);
            }
        });
    });
});
