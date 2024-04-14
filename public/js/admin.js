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
});
