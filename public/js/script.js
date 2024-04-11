$(function() { 
    /*
        * I would normally hate using a global variable for something like this,
        * but it is not worth my time to store the data in the element.
    */
    let ascending = true;
    
    /* 
        * Iterates through tickets and adds a row to the table for each.
        * Ticket priority fields are colored.
        * Closed tickets are given .ticket-closed 
        * Closed tickets are hidden if #showClosed isn't checked
    */
    function populateTable(arr=null) {
        $.get('allTickets', (data) => {
            if (!arr) arr = data;

            $("tbody").html("");

            for (let i = 0; i < arr.length; i++) {
                let ticket = arr[i];

                let priorityClass = "";
                let ticketClass = "";

                if (ticket.priority === "Low") priorityClass = "ticket-green";
                if (ticket.priority === "Medium") priorityClass = "ticket-yellow";
                else if (ticket.priority === "High") priorityClass = "ticket-red";

                if (ticket.status === "Closed") {
                    ticketClass = "ticket-closed";
                    if (!$("#showClosed").is(":checked") ) ticketClass += " d-none";
                }

                $("tbody").append(`
                    <tr class="${ticketClass}">
                    <td class="field-id">${ticket.id}</td>
                    <td class="field-status">${ticket.status}</td>
                    <td class="field-date">${ticket.opendate}</td>
                    <td class="field-priority ${priorityClass}">${ticket.priority}</td>
                    <td class="field-title">${ticket.title}</td>
                    <td class="field-author">${ticket.author}</td>
                    <td class="field-category">${ticket.category}</td>
                    <td class="field-assignee">${ticket.assignee}</td>
                    <td>
                    <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#ticketModal">View Ticket</button>
                    </td>
                    </tr>
                    `);
            }
        });
    };

    // Gets tickets, sorts by id and populates the table.
    function sortTable(ascending) {
        $.get('allTickets', (data) => {
            let arr=data;
            arr.sort((a, b) => {
                if (ascending) return parseInt(a.id) - parseInt(b.id);
                else return parseInt(b.id) - parseInt(a.id);
            });

            populateTable(arr);    
        });
    }

    function sortTableDate(ascending) {
        $.get('allTickets', (data) => {
            let arr=data;
            arr.sort((a, b) => {
                if (ascending) return new Date(a.openDate) - new Date(b.openDate);
                else return new Date(b.openDate) - new Date(a.openDate);
            });

            populateTable(arr);    
        });
    }

    function sortTableStatus(ascending) {
        $.get('allTickets', (data) => {
            let arr=data;
            const sortOrder = {
                "New": 1,
                "In Progress": 2,
                "Closed": 3
            }

            arr.sort((a, b) => {
                if (ascending) return sortOrder[a.status] - sortOrder[b.status];
                else return sortOrder[b.status] - sortOrder[a.status];
            });

            populateTable(arr);    
        });
    }

    function sortTablePriority(ascending) {
        $.get('allTickets', (data) => {
            let arr=data;
            const sortOrder = {
                "Low": 1,
                "Medium": 2,
                "High": 3
            }

            arr.sort((a, b) => {
                if (ascending) return sortOrder[a.priority] - sortOrder[b.priority];
                else return sortOrder[b.priority] - sortOrder[a.priority];
            });

            populateTable(arr);    
        });
    }

    function resetSortClasses() {
        $("table a").each(function() {
            $(this).removeClass("sort-active");
        });
    };

    $("#sortID").on("click", function() {
        ascending = !ascending;
        sortTable(ascending);
        
        resetSortClasses();
        $("#sortID").addClass("sort-active");
    });

    $("#sortDate").on("click", function() {
        ascending = !ascending;
        sortTableDate(ascending);

        resetSortClasses();
        $("#sortDate").addClass("sort-active");
    });

    $("#sortStatus").on("click", function() {
        ascending = !ascending;
        sortTableStatus(ascending);

        resetSortClasses();
        $("#sortStatus").addClass("sort-active");
    });

    $("#sortPriority").on("click", function() {
        ascending = !ascending;
        sortTablePriority(ascending);

        resetSortClasses();
        $("#sortPriority").addClass("sort-active");
    });

    // Filters rows on the table by title. Filtered by input in #filterTickets
    $("#filterTickets").keyup(function() {
        $("tbody tr").each(function(index, obj) {
            let ticketTitle = $(this).find(".field-title");
            if (ticketTitle.text().toUpperCase().includes($("#filterTickets").val().toUpperCase())) {
                $(obj).removeClass("d-none");
            }
            else {
                $(obj).addClass("d-none");
            }
        });
    });

    // Whenever a ticketModal is shown, use information from table and the database to fill information
    $("#ticketModal").on("shown.bs.modal", function (event) { 
        const button = event.relatedTarget;
        const curr = $(button).closest("tr"); //current ticket (row)

        let ticketId = curr.find(".field-id").text();

        $.get(`ticket/${ticketId}`, (tickets) => {
            const ticket = tickets[0];
            $(".modal-title").text(curr.find(".field-title").text());
            $("#modalDate").text(curr.find(".field-date").text());
            $("#modalAuthor").text(curr.find(".field-author").text());
            $("#modalStatus").text(curr.find(".field-status").text());
            $("#modalPriority").text(curr.find(".field-priority").text());
            $("#modalCategory").text(curr.find(".field-category").text());
            $("#modalAssignee").text(curr.find(".field-assignee").text());
            $("#modalDescription").val(ticket.description);
            $("#modalPicture").attr("src", ticket.image);
        });
    }); 


    $("#showClosed").on("click", function() {
        $(".ticket-closed").each(function(index, obj) {
            if ($("#showClosed").is(":checked")) {
                $(obj).removeClass("d-none");
            }
            else {
                $(obj).addClass("d-none");
            };
        });
    });
    
    $("#submitTicket").on("click", function() {

        let data = {
            status: "New",
            openDate: new Date().toLocaleDateString(),
            priority: $("#inputPriority").val(),
            title: $("#inputTitle").val(),
            category: $("#inputCategory").val(),
            assignee: $("#inputAssignee").val(),
            description: $("#inputDescription").val(),
            image: $("#inputPicture").val()
        }

        if (!data.priority) {
            alert("Form not valid! You must select a priority.");
            return;
        }
        else if (!data.category) {
            alert("Form not valid! You must select a category.");
            return;
        }
        else {
            $.post("newTicket", data);
            alert("Ticket submitted!");
            $("#createTicketModal").modal("hide");
            location.reload();
        }

    });

    // populates "assigned to" dropdown with all user names
    $.get('allUsers', (users) => {
        for (const user of users) {
            $("#inputAssignee").append($("<option />").val(user.id).text(user.name));
        }
    });

    populateTable();
});
