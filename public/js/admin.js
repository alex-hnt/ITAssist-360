$(document).ready(function(){
    function populateUserList() {
        $.get('/allUsers', function(users){
            $('#userList').empty(); 
            users.forEach(function(user){
                $('#userList').append(`<option value="${user.id}">${user.name}</option>`);
            });
        });
    }

    populateUserList();

    $('#updateRoleBtn').click(function(){
        const userId = $('#userList').val();
        const newRole = $('#newRole').val();

        $.post('/updateUserRole', { userId: userId, newRole: newRole }, function(response){
            alert(response.message);
            populateUserList();
        });
    });

    $('#deleteUserBtn').on("click", function(){
        const userId = $('#userList').val();

        $.post('/deleteUser', { id: userId }, (res) => {
            if (res.success) {
                alert("Successfully deleted user.");
            }
            else {
                alert(res.message);
            }

            populateUserList();
        });
    });

    $("#signupButton").on("click", function() {
        let name = $("#nameInput").val();
        let email = $("#emailInput").val();
        let password = $("#passwordInput").val();

        let data = {
            name: name,
            email: email,
            password: password 
        };

        $.post("/api/signup", data, (res) => {
            if (res.success) {
                alert("Successfully added the user.");
                populateUserList();
            }
            else {
                alert(res.message);
            }
        });
    });
});
